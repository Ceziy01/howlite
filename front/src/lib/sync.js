import { queue } from './offlineStore';
import { workspacesApi } from '../api/workspaces';

const HANDLERS = {
  createWorkspace: (op) => workspacesApi.create(op.payload),
  updateWorkspace: (op) => workspacesApi.update(op.payload.id, op.payload.data),
  deleteWorkspace: (op) => workspacesApi.delete(op.payload.id),
  createNote: (op) => workspacesApi.createNote(op.payload.wsId, op.payload.data),
  updateNote: (op) => workspacesApi.updateNote(op.payload.wsId, op.payload.noteId, op.payload.data),
  deleteNote: (op) => workspacesApi.deleteNote(op.payload.wsId, op.payload.noteId),
  createTodo: (op) => workspacesApi.createTodo(op.payload.wsId, op.payload.data),
  updateTodo: (op) => workspacesApi.updateTodo(op.payload.wsId, op.payload.todoId, op.payload.data),
  deleteTodo: (op) => workspacesApi.deleteTodo(op.payload.wsId, op.payload.todoId),
};

let running = false;

export async function drainQueue(onReconcile) {
  if (running || !navigator.onLine) return;
  running = true;
  try {
    const ops = await queue.list();
    for (const op of ops) {
      try {
        const result = await HANDLERS[op.type](op);
        await queue.remove(op.id);
        if (op.tempId && result?.id) onReconcile?.(op, result);
      } catch (e) {
        if (e.message?.includes('Unauthorized')) break;
        console.warn('Sync op failed, will retry later', op.type, e);
        break;
      }
    }
  } finally {
    running = false;
  }
}

export function startSyncLoop(onReconcile) {
  window.addEventListener('online', () => drainQueue(onReconcile));
  const interval = setInterval(() => drainQueue(onReconcile), 15000);
  drainQueue(onReconcile);
  return () => clearInterval(interval);
}