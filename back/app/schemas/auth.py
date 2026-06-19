from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.models.user import UserRole

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=20)
    username: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=6)
    
class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    username: str
    role: UserRole
    created_at: datetime
    
    model_config = {"from_attributes": True}
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse