import { get, set } from 'idb-keyval';

const CACHE_KEY = 'workspaces-cache';
const QUEUE_KEY = 'sync-queue';

export const cache = {
  load: () => get(CACHE_KEY),
  save: (workspaces) => set(CACHE_KEY, workspaces),
};

export const queue = {
  async list() {
    return (await get(QUEUE_KEY)) ?? [];
  },
  async push(op) {
    const q = await queue.list();
    q.push({ ...op, id: crypto.randomUUID(), createdAt: Date.now() });
    await set(QUEUE_KEY, q);
  },
  async remove(opId) {
    const q = await queue.list();
    await set(QUEUE_KEY, q.filter(o => o.id !== opId));
  },
};