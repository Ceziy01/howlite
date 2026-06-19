import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

function getDeadlineState(deadline_at) {
  if (!deadline_at) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const d = new Date(deadline_at);
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (day < today) return 'overdue';
  if (day.getTime() === today.getTime()) return 'today';
  if (day.getTime() === tomorrow.getTime()) return 'tomorrow';
  return 'future';
}

function formatDeadline(deadline_at) {
  if (!deadline_at) return '';
  const d = new Date(deadline_at);
  const state = getDeadlineState(deadline_at);
  if (state === 'today') return 'Сегодня';
  if (state === 'tomorrow') return 'Завтра';
  return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
}

export default function TaskItem({ task }) {
  const { updateTodo, deleteTodo } = useWorkspace();
  const [content, setContent] = useState(task.content);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const saveContent = () => {
    setEditing(false);
    if (content.trim() && content.trim() !== task.content) {
      updateTodo(task.id, { content: content.trim() });
    } else {
      setContent(task.content);
    }
  };

  const deadlineState = getDeadlineState(task.deadline_at);
  const deadlineLabel = formatDeadline(task.deadline_at);

  return (
    <div className={`task-item ${task.done ? 'task-item--done' : ''}`}>
      <button
        className={`task-checkbox ${task.done ? 'task-checkbox--checked' : ''}`}
        onClick={() => updateTodo(task.id, { done: !task.done })}
        title={task.done ? 'Отметить невыполненной' : 'Отметить выполненной'}
      >
        {task.done && <span className="material-icons-round">check</span>}
      </button>

      <div className="task-item-body">
        {editing ? (
          <input
            ref={inputRef}
            className="task-item-edit-input"
            value={content}
            onChange={e => setContent(e.target.value)}
            onBlur={saveContent}
            onKeyDown={e => { if (e.key === 'Enter') saveContent(); if (e.key === 'Escape') { setContent(task.content); setEditing(false); } }}
          />
        ) : (
          <span className="task-item-content" onDoubleClick={() => !task.done && setEditing(true)}>
            {task.content}
          </span>
        )}

        {deadlineLabel && (
          <span className={`task-item-deadline task-item-deadline--${deadlineState}`}>
            <span className="material-icons-round">schedule</span>
            {deadlineLabel}
          </span>
        )}
      </div>

      <div className="task-item-actions">
        <button
          className={`task-item-pin md-icon-btn ${task.pinned ? 'task-item-pin--active' : ''}`}
          title={task.pinned ? 'Открепить' : 'Закрепить'}
          onClick={() => updateTodo(task.id, { pinned: !task.pinned })}
        >
          <span className="material-icons-round">push_pin</span>
        </button>
        <button
          className="task-item-delete md-icon-btn"
          title="Удалить"
          onClick={() => deleteTodo(task.id)}
        >
          <span className="material-icons-round">delete</span>
        </button>
      </div>
    </div>
  );
}