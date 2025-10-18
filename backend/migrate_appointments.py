import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def migrate():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Create default appointment types if none exist
    types_count = await db.appointment_types.count_documents({})
    
    default_types = [
        {"id": str(uuid.uuid4()), "name": "機場接送", "color": "#9333ea", "icon": "Plane", "created_at": "2025-10-18T00:00:00"},
        {"id": str(uuid.uuid4()), "name": "市區接送", "color": "#06b6d4", "icon": "Car", "created_at": "2025-10-18T00:00:00"},
        {"id": str(uuid.uuid4()), "name": "商務用車", "color": "#64748b", "icon": "Briefcase", "created_at": "2025-10-18T00:00:00"},
        {"id": str(uuid.uuid4()), "name": "私人行程", "color": "#10b981", "icon": "User", "created_at": "2025-10-18T00:00:00"},
        {"id": str(uuid.uuid4()), "name": "VIP 專屬", "color": "#f59e0b", "icon": "Star", "created_at": "2025-10-18T00:00:00"},
    ]
    
    if types_count == 0:
        await db.appointment_types.insert_many(default_types)
        print(f"Created {len(default_types)} default appointment types")
    
    # Get the first type as default
    first_type = await db.appointment_types.find_one({})
    default_type_id = first_type['id']
    
    # Migrate appointments
    # 1. Update appointments with old 'appointment_type' field
    result1 = await db.appointments.update_many(
        {"appointment_type": {"$exists": True}},
        [
            {
                "$set": {
                    "appointment_type_id": {
                        "$switch": {
                            "branches": [
                                {"case": {"$eq": ["$appointment_type", "airport"]}, "then": default_types[0]["id"]},
                                {"case": {"$eq": ["$appointment_type", "city"]}, "then": default_types[1]["id"]},
                                {"case": {"$eq": ["$appointment_type", "corporate"]}, "then": default_types[2]["id"]},
                                {"case": {"$eq": ["$appointment_type", "personal"]}, "then": default_types[3]["id"]},
                                {"case": {"$eq": ["$appointment_type", "vip"]}, "then": default_types[4]["id"]},
                            ],
                            "default": default_type_id
                        }
                    }
                }
            },
            {"$unset": "appointment_type"}
        ]
    )
    
    # 2. Add appointment_type_id to appointments that don't have it
    result2 = await db.appointments.update_many(
        {"appointment_type_id": {"$exists": False}},
        {"$set": {"appointment_type_id": default_type_id}}
    )
    
    print(f"Updated {result1.modified_count} appointments with old type field")
    print(f"Added type_id to {result2.modified_count} appointments without type")
    
    client.close()
    print("Migration completed!")

if __name__ == "__main__":
    asyncio.run(migrate())
