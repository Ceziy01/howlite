import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import './TaskCreator.css';

function todayEnd() {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return d;
}

function tomorrowEnd() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 0, 0);
  return d;
}

function formatDeadlineLabel(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (d.getTime() === today.getTime()) return 'Сегодня';
  if (d.getTime() === tomorrow.getTime()) return 'Завтра';
  return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
}

export default function TaskCreator() {
  const { createTodo } = useWorkspace();
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState(todayEnd());
  const [showMenu, setShowMenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!showMenu && !showPicker) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu, showPicker]);

  const handleCreate = async () => {
    if (!content.trim()) return;
    await createTodo({ content: content.trim(), deadline_at: deadline.toISOString() });
    setContent('');
    setDeadline(todayEnd());
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate();
  };

  // Для нативного date input
  const pickerValue = deadline.toISOString().slice(0, 10);

  const handlePickerChange = (e) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-').map(Number);
    const picked = new Date(y, m - 1, d, 23, 59, 0, 0);
    setDeadline(picked);
    setShowMenu(false);
    setShowPicker(false);
  };

  return (
    <div className="task-creator">
      <input
        ref={inputRef}
        className="task-creator-input"
        placeholder="Задача..."
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="task-creator-deadline-wrap" ref={menuRef}>
        <button
          className="task-creator-cal-btn md-icon-btn"
          title="Срок"
          onClick={() => { setShowMenu(v => !v); setShowPicker(false); }}
        >
          <span className="material-icons-round">calendar_month</span>
        </button>
        <span className="task-creator-deadline-label">{formatDeadlineLabel(deadline)}</span>

        {showMenu && (
          <div className="task-creator-menu">
            <button onClick={() => { setDeadline(todayEnd()); setShowMenu(false); }}>
              <span className="material-icons-round">today</span>
              Сегодня
            </button>
            <button onClick={() => { setDeadline(tomorrowEnd()); setShowMenu(false); }}>
              <span className="material-icons-round">event</span>
              Завтра
            </button>
            <button onClick={() => setShowPicker(true)}>
              <span className="material-icons-round">calendar_month</span>
              Выбрать дату
            </button>
            {showPicker && (
              <input
                type="date"
                className="task-creator-date-picker"
                value={pickerValue}
                onChange={handlePickerChange}
                autoFocus
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}