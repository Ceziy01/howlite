import { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import TaskCreator from './TaskCreator';
import TaskItem from './TaskItem';
import './TodoWorkspace.css';

function sortByDeadline(tasks, reverse = false) {
  return [...tasks].sort((a, b) => {
    const da = a.deadline_at ? new Date(a.deadline_at) : new Date(8640000000000000);
    const db_ = b.deadline_at ? new Date(b.deadline_at) : new Date(8640000000000000);
    return reverse ? db_ - da : da - db_;
  });
}

export default function TodoWorkspace() {
  const { activeWorkspace } = useWorkspace();
  const [doneCollapsed, setDoneCollapsed] = useState(false);

  const tasks = activeWorkspace?.todo ?? [];

  const pinned = sortByDeadline(tasks.filter(t => t.pinned && !t.done));
  const others = sortByDeadline(tasks.filter(t => !t.pinned && !t.done));
  const done = sortByDeadline(tasks.filter(t => t.done), true);

  if (!activeWorkspace) return null;

  return (
    <div className="todo-workspace">
      <TaskCreator />

      {tasks.length === 0 && (
        <div className="todo-empty">
          <span className="material-icons-round todo-empty-icon">{activeWorkspace.icon}</span>
          <p>Пока задач нет</p>
        </div>
      )}

      {pinned.length > 0 && (
        <section className="todo-section">
          <div className="todo-section-label">ЗАКРЕПЛЁННЫЕ</div>
          <div className="todo-list">
            {pinned.map(t => <TaskItem key={t.id} task={t} />)}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="todo-section">
          {pinned.length > 0 && <div className="todo-section-label">ЗАДАЧИ</div>}
          <div className="todo-list">
            {others.map(t => <TaskItem key={t.id} task={t} />)}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section className="todo-section">
          <button
            className="todo-section-label todo-section-label--collapsible"
            onClick={() => setDoneCollapsed(v => !v)}
          >
            <span className="material-icons-round todo-collapse-icon">
              {doneCollapsed ? 'chevron_right' : 'expand_more'}
            </span>
            ВЫПОЛНЕНО ({done.length})
          </button>
          {!doneCollapsed && (
            <div className="todo-list todo-list--done">
              {done.map(t => <TaskItem key={t.id} task={t} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}