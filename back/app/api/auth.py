from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie
from sqlalchemy.orm import Session
from typing import Optional
 
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth import (
    get_user_by_username,
    create_user,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token
    
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE_NAME = "refresh_token"
COOKIE_EXPIRES = settings.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60

def _set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=COOKIE_EXPIRES,
        path="/",
    )
    
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    if get_user_by_username(db, body.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user = create_user(db, name=body.name, username=body.username, password=body.password)
    access_token = create_access_token(user.id, user.username, user.role.value)
    refresh_token = create_refresh_token(db, user.id)
    
    _set_refresh_cookie(response, refresh_token)
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )
 
 
@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = get_user_by_username(db, body.username)
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(user.id, user.username, user.role.value)
    refresh_token = create_refresh_token(db, user.id)
    
    _set_refresh_cookie(response, refresh_token)
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )
 

    
@router.post("/refresh", response_model=TokenResponse)
def refresh(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: Optional[str] = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    
    user = verify_refresh_token(db, refresh_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    # Только выдаём новый access_token, refresh_token НЕ ротируем
    access_token = create_access_token(user.id, user.username, user.role.value)
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )
 
 
@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: Optional[str] = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
):
    if refresh_token:
        revoke_refresh_token(db, refresh_token)
    
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/api/auth")
    return None
 
 
@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
