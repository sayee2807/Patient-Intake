from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from services.auth_service import authenticate_user, create_user, create_access_token, get_user_by_email
from pydantic import BaseModel, EmailStr

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str
    role: str = "receptionist"

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db, req.email, req.full_name, req.password, req.role)
    return { "message": "Account created", "email": user.email, "role": user.role }

@router.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/auth/me")
def get_me(db: Session = Depends(get_db)):
    # This will be protected in main.py
    pass