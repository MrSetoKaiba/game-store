"""
MongoDB-Verbindung mit Motor (async Driver für FastAPI).
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "gamestore")

client: AsyncIOMotorClient = None
db = None


async def connect_mongodb():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    print(f"[OK] MongoDB verbunden: {MONGO_URI}/{MONGO_DB}")
    return db


async def close_mongodb():
    global client
    if client:
        client.close()
        print("[CLOSED] MongoDB Verbindung geschlossen")


def get_db():
    return db
