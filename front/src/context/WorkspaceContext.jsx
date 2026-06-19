import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { workspacesApi } from '../api/workspaces';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const data = await workspacesApi.list();
      setWorkspaces(data);
      if (data.length > 0 && !activeWorkspaceId) {
        setActiveWorkspaceId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch workspaces', e);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const createWorkspace = async (data) => {
    const ws = await workspacesApi.create({ ...data, position: workspaces.length });
    setWorkspaces(prev => [...prev, ws]);
    setActiveWorkspaceId(ws.id);
    return ws;
  };

  const updateWorkspace = async (id, data) => {
    const ws = await workspacesApi.update(id, data);
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...ws } : w));
    return ws;
  };

  const deleteWorkspace = async (id) => {
    await workspacesApi.delete(id);
    const remaining = workspaces.filter(w => w.id !== id);
    setWorkspaces(remaining);
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(remaining[0]?.id ?? null);
    }
  };

  // Notes management within active workspace
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) ?? null;

  const createNote = async (data) => {
    if (!activeWorkspaceId) return;
    const note = await workspacesApi.createNote(activeWorkspaceId, data);
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWorkspaceId
        ? { ...w, notes: [note, ...(w.notes || [])] }
        : w
    ));
    return note;
  };

  const updateNote = async (noteId, data) => {
    if (!activeWorkspaceId) return;
    const updated = await workspacesApi.updateNote(activeWorkspaceId, noteId, data);
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWorkspaceId
        ? { ...w, notes: (w.notes || []).map(n => n.id === noteId ? updated : n) }
        : w
    ));
    return updated;
  };

  const deleteNote = async (noteId) => {
    if (!activeWorkspaceId) return;
    await workspacesApi.deleteNote(activeWorkspaceId, noteId);
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWorkspaceId
        ? { ...w, notes: (w.notes || []).filter(n => n.id !== noteId) }
        : w
    ));
  };

  // Todo management
  const createTodo = async (data) => {
    if (!activeWorkspaceId) return;
    const todo = await workspacesApi.createTodo(activeWorkspaceId, data);
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWorkspaceId
        ? { ...w, todo: [todo, ...(w.todo || [])] }
        : w
    ));
    return todo;
  };

  const updateTodo = async (todoId, data) => {
    if (!activeWorkspaceId) return;
    const updated = await workspacesApi.updateTodo(activeWorkspaceId, todoId, data);
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWorkspaceId
        ? { ...w, todo: (w.todo || []).map(t => t.id === todoId ? updated : t) }
        : w
    ));
    return updated;
  };

  const deleteTodo = async (todoId) => {
    if (!activeWorkspaceId) return;
    await workspacesApi.deleteTodo(activeWorkspaceId, todoId);
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWorkspaceId
        ? { ...w, todo: (w.todo || []).filter(t => t.id !== todoId) }
        : w
    ));
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces, loading,
      activeWorkspaceId, setActiveWorkspaceId,
      activeWorkspace,
      createWorkspace, updateWorkspace, deleteWorkspace,
      createNote, updateNote, deleteNote,
      createTodo, updateTodo, deleteTodo
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}

