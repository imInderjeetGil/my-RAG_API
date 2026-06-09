from fastapi import APIRouter
from pydantic import BaseModel
from services.database import sessions_collection, messages_collection
from datetime import datetime, timezone
import uuid

router = APIRouter()

class MessageRequest(BaseModel):
    role: str
    content: str

@router.post("/sessions")
async def create_session():
    session_id = str(uuid.uuid4())
    session = {
        "_id": session_id,
        "created_at": datetime.now(timezone.utc),
        "title": "New Chat"
    }
    await sessions_collection.insert_one(session)
    return {"session_id": session_id, "title": "New Chat"}

@router.get("/sessions")
async def get_sessions():
    sessions = await sessions_collection.find().sort("created_at", -1).to_list(100)
    for s in sessions:
        s["id"] = s.pop("_id")
    return {"sessions": sessions}

@router.post("/sessions/{session_id}/messages")
async def save_message(session_id: str, message: MessageRequest):
    msg = {
        "_id": str(uuid.uuid4()),
        "session_id": session_id,
        "role": message.role,
        "content": message.content,
        "created_at": datetime.now(timezone.utc)
    }
    await messages_collection.insert_one(msg)
    return {"message": "saved"}

@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    msgs = await messages_collection.find(
        {"session_id": session_id}
    ).sort("created_at", 1).to_list(1000)
    for m in msgs:
        m["id"] = m.pop("_id")
    return {"messages": msgs}

@router.patch("/sessions/{session_id}/title")
async def update_session_title(session_id: str):
    # Get first user message
    msg = await messages_collection.find_one(
        {"session_id": session_id, "role": "user"},
        sort=[("created_at", 1)]
    )
    if not msg:
        return {"title": "New Chat"}
    
    # Title = first 40 chars of first message
    title = msg["content"][:40] + ("..." if len(msg["content"]) > 40 else "")
    
    await sessions_collection.update_one(
        {"_id": session_id},
        {"$set": {"title": title}}
    )
    return {"title": title}