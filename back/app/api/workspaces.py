from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.workspace import Workspace, Note, Todo
from app.models.user import User
from app.schemas.workspace import (
    WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse, WorkspaceWithNotes,
    NoteCreate, NoteUpdate, NoteResponse,
    TodoCreate, TodoUpdate, TodoResponse
)

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


# ── Workspaces ────────────────────────────────────────────────────────────────

@router.get("", response_model=List[WorkspaceWithNotes])
def list_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspaces = (
        db.query(Workspace)
        .options(joinedload(Workspace.notes), joinedload(Workspace.todo))
        .filter(Workspace.user_id == current_user.id)
        .order_by(Workspace.position)
        .all()
    )
    return workspaces


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(
    body: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws = Workspace(
        user_id=current_user.id,
        name=body.name,
        type=body.type,
        icon=body.icon,
        color=body.color,
        position=body.position,
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return ws


@router.put("/{ws_id}", response_model=WorkspaceResponse)
def update_workspace(
    ws_id: int,
    body: WorkspaceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws = db.query(Workspace).filter(Workspace.id == ws_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(ws, field, val)
    db.commit()
    db.refresh(ws)
    return ws


@router.delete("/{ws_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(
    ws_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws = db.query(Workspace).filter(Workspace.id == ws_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    db.delete(ws)
    db.commit()
    return None


# ── Notes ─────────────────────────────────────────────────────────────────────

@router.get("/{ws_id}/notes", response_model=List[NoteResponse])
def list_notes(
    ws_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws = db.query(Workspace).filter(Workspace.id == ws_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    notes = db.query(Note).filter(Note.workspace_id == ws_id).order_by(Note.pinned.desc(), Note.position).all()
    return notes


@router.post("/{ws_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    ws_id: int,
    body: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws = db.query(Workspace).filter(Workspace.id == ws_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    items_data = None
    if body.items is not None:
        items_data = [item.model_dump() for item in body.items]
    
    note = Note(
        workspace_id=ws_id,
        user_id=current_user.id,
        title=body.title,
        content=body.content,
        items=items_data,
        mode=body.mode,
        color=body.color,
        pinned=body.pinned,
        position=body.position,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{ws_id}/notes/{note_id}", response_model=NoteResponse)
def update_note(
    ws_id: int,
    note_id: int,
    body: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.workspace_id == ws_id,
        Note.user_id == current_user.id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(note, field, val)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{ws_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    ws_id: int,
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.workspace_id == ws_id,
        Note.user_id == current_user.id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return None

# ── Todo ──────────────────────────────────────────────────────────────────────

@router.get("/{ws_id}/todo", response_model=List[TodoResponse])
def list_todo(
    ws_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws = db.query(Workspace).filter(Workspace.id == ws_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return db.query(Todo).filter(Todo.workspace_id == ws_id).all()


@router.post("/{ws_id}/todo", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    ws_id: int,
    body: TodoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ws = db.query(Workspace).filter(Workspace.id == ws_id, Workspace.user_id == current_user.id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    todo = Todo(
        workspace_id=ws_id,
        user_id=current_user.id,
        content=body.content,
        done=False,
        pinned=body.pinned,
        deadline_at=body.deadline_at,
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@router.put("/{ws_id}/todo/{todo_id}", response_model=TodoResponse)
def update_todo(
    ws_id: int,
    todo_id: int,
    body: TodoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.workspace_id == ws_id,
        Todo.user_id == current_user.id
    ).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(todo, field, val)
    db.commit()
    db.refresh(todo)
    return todo


@router.delete("/{ws_id}/todo/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    ws_id: int,
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.workspace_id == ws_id,
        Todo.user_id == current_user.id
    ).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return None