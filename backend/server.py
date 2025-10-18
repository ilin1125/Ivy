from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    token: str
    message: str

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    pickup_time: str  # ISO datetime string
    pickup_location: str
    arrival_time: str  # ISO datetime string
    arrival_location: str
    flight_info: Optional[str] = ""
    luggage_count: Optional[int] = 0
    other_details: Optional[str] = ""
    appointment_type: str = "airport"  # airport, city, corporate, personal, vip
    status: str = "scheduled"  # scheduled, in_progress, completed, cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AppointmentCreate(BaseModel):
    client_name: str
    pickup_time: str
    pickup_location: str
    arrival_time: str
    arrival_location: str
    flight_info: Optional[str] = ""
    luggage_count: Optional[int] = 0
    other_details: Optional[str] = ""
    appointment_type: Optional[str] = "airport"
    status: Optional[str] = "scheduled"

class AppointmentUpdate(BaseModel):
    client_name: Optional[str] = None
    pickup_time: Optional[str] = None
    pickup_location: Optional[str] = None
    arrival_time: Optional[str] = None
    arrival_location: Optional[str] = None
    flight_info: Optional[str] = None
    luggage_count: Optional[int] = None
    other_details: Optional[str] = None
    appointment_type: Optional[str] = None
    status: Optional[str] = None

# Authentication function
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Authentication endpoint
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Simple password check - in production, you'd want to hash this
    # For now, using a simple password: "driver123"
    correct_password = "driver123"
    
    if request.password != correct_password:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Create JWT token
    token = jwt.encode({"user": "driver", "exp": datetime.now(timezone.utc).timestamp() + 86400 * 30}, SECRET_KEY, algorithm=ALGORITHM)
    
    return LoginResponse(token=token, message="Login successful")

# Appointments CRUD endpoints
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment: AppointmentCreate, user=Depends(verify_token)):
    appointment_dict = appointment.model_dump()
    appointment_obj = Appointment(**appointment_dict)
    
    doc = appointment_obj.model_dump()
    await db.appointments.insert_one(doc)
    
    return appointment_obj

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(
    status: Optional[str] = None,
    client_name: Optional[str] = None,
    date: Optional[str] = None,
    appointment_type: Optional[str] = None,
    user=Depends(verify_token)
):
    query = {}
    
    if status:
        query['status'] = status
    if client_name:
        query['client_name'] = {"$regex": client_name, "$options": "i"}
    if date:
        # Filter by date (pickup_time starts with the date)
        query['pickup_time'] = {"$regex": f"^{date}"}
    if appointment_type:
        query['appointment_type'] = appointment_type
    
    appointments = await db.appointments.find(query, {"_id": 0}).to_list(1000)
    return appointments

@api_router.get("/appointments/{appointment_id}", response_model=Appointment)
async def get_appointment(appointment_id: str, user=Depends(verify_token)):
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@api_router.put("/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(
    appointment_id: str,
    appointment_update: AppointmentUpdate,
    user=Depends(verify_token)
):
    # Get existing appointment
    existing = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Update only provided fields
    update_data = appointment_update.model_dump(exclude_unset=True)
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.appointments.update_one({"id": appointment_id}, {"$set": update_data})
    
    # Get updated appointment
    updated = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    return updated

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, user=Depends(verify_token)):
    result = await db.appointments.delete_one({"id": appointment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()