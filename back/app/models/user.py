from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.core.database import Base

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(20), nullable=False)
    username = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    workspaces = relationship("Workspace", back_populates="user", cascade="all, delete-orphan",
                              order_by="Workspace.position")
    
class RefreshToken(Base):
    __tablename__ = "refresh_token"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(Text, unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="refresh_tokens")