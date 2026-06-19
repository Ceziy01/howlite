import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { workspacesApi } from '../api/workspaces';
import { cache, queue } from '../lib/offlineStore';
import { startSyncLoop } from '../lib/sync';

const WorkspaceContext = createContext(null);
const tempId = () => `tmp_${crypto.randomUUID()}`;

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const workspacesRef = useRef(workspaces);
  workspacesRef.current = workspaces;

  const persist = useCallback((updater) => {
    setWorkspaces(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      cache.save(next);
      return next;
    });
  }, []);

  const reconcile = useCallback((op, result) => {
    persist(prev => {
      if (op.type === 'createWorkspace') {
        return prev.map(w => w.id === op.tempId ? { ...w, ...result, _pending: false } : w);
      }
      return prev.map(w => {
        if (w.id !== op.payload.wsId && w.id !== op.tempId) return w;
        if (op.type === 'createNote') {
          return { ...w, notes: w.notes.map(n => n.id === op.tempId ? { ...result, _pending: false } : n) };
        }
        if (op.type === 'createTodo') {
          return { ...w, todo: w.todo.map(t => t.id === op.tempId ? { ...result, _pending: false } : t) };
        }
        return w;
      });
    });
    setActiveWorkspaceId(prev => prev === op.tempId ? result.id : prev);
  }, [persist]);

  useEffect(() => {
    (async () => {
      const cached = await cache.load();
      if (cached) {
        setWorkspaces(cached);
        setActiveWorkspaceId(prev => prev ?? cached[0]?.id ?? null);
        setLoading(false);
      }
      try {
        const fresh = await workspacesApi.list();
        persist(fresh);
        setActiveWorkspaceId(prev => prev ?? fresh[0]?.id ?? null);
      } catch {
      } finally {
        setLoading(false);
      }
    })();

    const stop = startSyncLoop(reconcile);
    return stop;
  }, []);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) ?? null;

  // Workspaces
  const createWorkspace = async (data) => {
    const id = tempId();
    const ws = { ...data, id, notes: [], todo: [], position: workspaces.length, _pending: true };
    persist(prev => [...prev, ws]);
    setActiveWorkspaceId(id);
    await queue.push({ type: 'createWorkspace', tempId: id, payload: { ...data, position: workspaces.length } });
    startSyncLoop(reconcile); // попробовать отправить сразу, если онлайн
    return ws;
  };

  const updateWorkspace = async (id, data) => {
    persist(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    await queue.push({ type: 'updateWorkspace', payload: { id, data } });
  };

  const deleteWorkspace = async (id) => {
    const remaining = workspaces.filter(w => w.id !== id);
    persist(remaining);
    if (activeWorkspaceId === id) setActiveWorkspaceId(remaining[0]?.id ?? null);
    if (!String(id).startsWith('tmp_')) {
      await queue.push({ type: 'deleteWorkspace', payload: { id } });
    }
  };

  // Notes
  const createNote = async (data) => {
    if (!activeWorkspaceId) return;
    const id = tempId();
    const note = { ...data, id, _pending: true };
    persist(prev => prev.map(w => w.id === activeWorkspaceId ? { ...w, notes: [note, ...(w.notes || [])] } : w));
    await queue.push({ type: 'createNote', tempId: id, payload: { wsId: activeWorkspaceId, data } });
    return note;
  };

  const updateNote = async (noteId, data) => {
    if (!activeWorkspaceId) return;
    persist(prev => prev.map(w => w.id === activeWorkspaceId
      ? { ...w, notes: w.notes.map(n => n.id === noteId ? { ...n, ...data } : n) }
      : w));
    if (!String(noteId).startsWith('tmp_')) {
      await queue.push({ type: 'updateNote', payload: { wsId: activeWorkspaceId, noteId, data } });
    }
  };

  const deleteNote = async (noteId) => {
    if (!activeWorkspaceId) return;
    persist(prev => prev.map(w => w.id === activeWorkspaceId
      ? { ...w, notes: w.notes.filter(n => n.id !== noteId) }
      : w));
    if (!String(noteId).startsWith('tmp_')) {
      await queue.push({ type: 'deleteNote', payload: { wsId: activeWorkspaceId, noteId } });
    }
  };

  // Todo 
  const createTodo = async (data) => {
    if (!activeWorkspaceId) return;
    const id = tempId();
    const todo = { ...data, id, _pending: true };
    persist(prev => prev.map(w => w.id === activeWorkspaceId ? { ...w, todo: [todo, ...(w.todo || [])] } : w));
    await queue.push({ type: 'createTodo', tempId: id, payload: { wsId: activeWorkspaceId, data } });
    return todo;
  };

  const updateTodo = async (todoId, data) => {
    if (!activeWorkspaceId) return;
    persist(prev => prev.map(w => w.id === activeWorkspaceId
      ? { ...w, todo: w.todo.map(t => t.id === todoId ? { ...t, ...data } : t) }
      : w));
    if (!String(todoId).startsWith('tmp_')) {
      await queue.push({ type: 'updateTodo', payload: { wsId: activeWorkspaceId, todoId, data } });
    }
  };

  const deleteTodo = async (todoId) => {
    if (!activeWorkspaceId) return;
    persist(prev => prev.map(w => w.id === activeWorkspaceId
      ? { ...w, todo: w.todo.filter(t => t.id !== todoId) }
      : w));
    if (!String(todoId).startsWith('tmp_')) {
      await queue.push({ type: 'deleteTodo', payload: { wsId: activeWorkspaceId, todoId } });
    }
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces, loading,
      activeWorkspaceId, setActiveWorkspaceId,
      activeWorkspace,
      createWorkspace, updateWorkspace, deleteWorkspace,
      createNote, updateNote, deleteNote,
      createTodo, updateTodo, deleteTodo,
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