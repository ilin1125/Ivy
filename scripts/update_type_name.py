import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

async def update_appointment_type():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("正在查找「別的駕駛」類型...")
    
    # Find the type with name "別的駕駛"
    result = await db.appointment_types.find_one({"name": "別的駕駛"})
    
    if result:
        print(f"找到類型: {result['name']} (ID: {result.get('id', 'N/A')})")
        
        # Update to "代理駕駛"
        update_result = await db.appointment_types.update_one(
            {"name": "別的駕駛"},
            {"$set": {"name": "代理駕駛"}}
        )
        
        if update_result.modified_count > 0:
            print("✅ 成功更新為「代理駕駛」")
        else:
            print("⚠️ 未進行更新（可能已經是正確的名稱）")
    else:
        print("❌ 未找到「別的駕駛」類型")
        
        # List all types
        print("\n現有的預約類型：")
        types = await db.appointment_types.find({}, {"_id": 0}).to_list(100)
        for t in types:
            print(f"  - {t.get('name', 'Unknown')} (ID: {t.get('id', 'N/A')})")
    
    client.close()
    print("\n完成")

if __name__ == "__main__":
    asyncio.run(update_appointment_type())
