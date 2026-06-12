from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URL, MONGO_DB_NAME

client = AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB_NAME]

sessions_collection = db["sessions"]
messages_collection = db["messages"]
users_collection =  db["users"]