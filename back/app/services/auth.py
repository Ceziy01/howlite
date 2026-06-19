from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import secrets

from app.config import settings
from app.models.user import User, RefreshToken, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_KEY, algorithms=[settings.JWT_ALG])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None

def create_access_token(user_id: int, username: str, role: str):
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRES_MINUTES)
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "exp": expire,
        "type": "access"
    }    
    return jwt.encode(payload, settings.JWT_KEY, algorithm=settings.JWT_ALG)

def create_refresh_token(db: Session, user_id: int):
    token_value = secrets.token_urlsafe(64)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRES_DAYS)
    
    db_token = RefreshToken(
        token = token_value,
        user_id = user_id,
        expires_at = expires_at
    )
    db.add(db_token)
    db.commit()
    return token_value

def verify_refresh_token(db: Session, token_value: str):
    db_token = db.query(RefreshToken).filter(RefreshToken.token == token_value).first()
    if not db_token:
        return None
    if db_token.expires_at < datetime.now(timezone.utc):
        db.delete(db_token)
        db.commit()
        return None
    return db_token.user

def revoke_refresh_token(db: Session, token_value: str):
    db_token = db.query(RefreshToken).filter(RefreshToken.token == token_value).first()
    if db_token:
        db.delete(db_token)
        db.commit()
        
def revoke_all_user_tokens(db: Session, user_id: int):
    db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete()
    db.commit()
    
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username). first()

def create_user(db: Session, name: str, username: str, password: str, role: UserRole = UserRole.user):
    user = User(
        name = name,
        username = username,
        password_hash = hash_password(password),
        role = role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user