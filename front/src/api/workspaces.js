import { api } from './client';

export const workspacesApi = {
  list: () => api.get('/workspaces'),
  create: (data) => api.post('/workspaces', data),
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),

  listNotes: (wsId) => api.get(`/workspaces/${wsId}/notes`),
  createNote: (wsId, data) => api.post(`/workspaces/${wsId}/notes`, data),
  updateNote: (wsId, noteId, data) => api.put(`/workspaces/${wsId}/notes/${noteId}`, data),
  deleteNote: (wsId, noteId) => api.delete(`/workspaces/${wsId}/notes/${noteId}`),

  listTodo: (wsId) => api.get(`/workspaces/${wsId}/todo`),
  createTodo: (wsId, data) => api.post(`/workspaces/${wsId}/todo`, data),
  updateTodo: (wsId, todoId, data) => api.put(`/workspaces/${wsId}/todo/${todoId}`, data),
  deleteTodo: (wsId, todoId) => api.delete(`/workspaces/${wsId}/todo/${todoId}`)
};