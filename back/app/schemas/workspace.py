from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class NoteItem(BaseModel):
    id: str
    text: str
    checked: bool = False
    level: int = 0


class NoteCreate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    items: Optional[List[NoteItem]] = None
    mode: str = "text"
    color: Optional[str] = None
    pinned: bool = False
    position: int = 0


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    items: Optional[List[Any]] = None
    mode: Optional[str] = None
    color: Optional[str] = None
    pinned: Optional[bool] = None
    position: Optional[int] = None


class NoteResponse(BaseModel):
    id: int
    workspace_id: int
    title: Optional[str]
    content: Optional[str]
    items: Optional[List[Any]]
    mode: str
    color: Optional[str]
    pinned: bool
    position: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = "notes"
    icon: str = "lightbulb"
    color: Optional[str] = None
    position: int = 0


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    icon: Optional[str] = None
    color: Optional[str] = None
    position: Optional[int] = None


class WorkspaceResponse(BaseModel):
    id: int
    name: str
    type: str
    icon: str
    color: Optional[str]
    position: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    
class TodoCreate(BaseModel):
    content: str = Field(..., min_length=1)
    deadline_at: Optional[datetime] = None
    pinned: bool = False


class TodoUpdate(BaseModel):
    content: Optional[str] = None
    done: Optional[bool] = None
    pinned: Optional[bool] = None
    deadline_at: Optional[datetime] = None


class TodoResponse(BaseModel):
    id: int
    workspace_id: int
    content: str
    done: bool
    pinned: bool
    created_at: datetime
    deadline_at: Optional[datetime]

    model_config = {"from_attributes": True}
    
class WorkspaceWithNotes(WorkspaceResponse):
    notes: List[NoteResponse] = []
    todo: List[TodoResponse] = []