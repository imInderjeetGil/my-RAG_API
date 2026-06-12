from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.database import users_collection
from services.auth import hash_password, verify_password, create_token
import uuid

router = APIRouter(prefix="/auth")

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(req: RegisterRequest):
    existing = await users_collection.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already register")
    
    user = {
        "_id": str(uuid.uuid4()),
        "username": req.username,
        "email": req.email,
        "password": hash_password(req.password)
    }
    
    await users_collection.insert_one(user)
    token = create_token(user["_id"])
    return {"token": token, "username": req.username}

@router.post("/login")
async def login(req: LoginRequest):
    user = await users_collection.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["_id"])
    return {"token":token, "username": user["username"]}

@router.get("/me")
async def me():
    return {"message":"auth working"}