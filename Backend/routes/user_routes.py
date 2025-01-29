from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from utils.auth import create_access_token, verify_token
from config.db_configuration import get_db
from models.user import User
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

@router.post("/register", tags=["Users"])
def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User.create_user(db, request.username, request.email, request.password)
    return {"message": "User registered", "user": user.username}

@router.post("/login", tags=["Users"])
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = User.authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/verifyToken/{token}", tags=["Users"])
def verify_token_endpoint(token: str):
    verify_token(token)
    return {"message": "Token is valid"}
