from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, time
import enum

from app.core.database import Base


class WorkspaceType(str, enum.Enum):
    notes = "notes"
    todo = "todo"
    recipes = "recipes"
    schedule = "schedule"

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(Enum(WorkspaceType), default=WorkspaceType.notes, nullable=False)
    icon = Column(String(100), nullable=False, default="lightbulb")
    color = Column(String(30), nullable=True)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="workspaces")
    notes = relationship("Note", back_populates="workspace", cascade="all, delete-orphan", order_by="Note.position")
    todo = relationship("Todo", back_populates="workspace", cascade="all, delete-orphan") 


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=True)
    content = Column(Text, nullable=True)
    items = Column(JSON, nullable=True)
    mode = Column(String(20), default="text") 
    color = Column(String(30), nullable=True)
    pinned = Column(Boolean, default=False)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="notes")
    user = relationship("User")
    
    
class Todo(Base):
    __tablename__ = "todo"
    
    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=True)
    done = Column(Boolean, default=False)
    pinned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    deadline_at = Column(DateTime(timezone=True), default=lambda: datetime.combine(datetime.today().date(), time(23, 59)))
    
    workspace = relationship("Workspace", back_populates="todo")
    user = relationship("User")