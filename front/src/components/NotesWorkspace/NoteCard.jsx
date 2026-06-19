import {
  useState,
  useRef,
  useCallback,
  useEffect
} from 'react';

import { useWorkspace } from '../../context/WorkspaceContext';
import { CheckList } from '../Elements/CheckList';

import './NoteCard.css';

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function NoteCard({ note }) {
  const { updateNote, deleteNote } = useWorkspace();

  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [items, setItems] = useState(note.items || []);
  const [mode, setMode] = useState(note.mode || 'text');
  const [pinned, setPinned] = useState(note.pinned || false);

  const [dirty, setDirty] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  // ── AUTOSAVE ─────────────────────────
  const saveTimer = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setDirty(true);
    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      updateNote(note.id, { title, content, items, mode, pinned });
      setDirty(false);
    }, 800);

    return () => clearTimeout(saveTimer.current);
  }, [title, content, items, mode, pinned]);

  // ── TEXTAREA RESIZE ───────────────────
  const textareaRef = useRef(null);

  const textareaResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  useEffect(() => {
    textareaResize();
  }, [content, textareaResize]);

  // ── MODE SWITCH ───────────────────────
  const switchToList = () => {
    if (mode === 'text') {
      const lines = content.split('\n').filter((l) => l.trim());
      setItems(
        lines.length > 0
          ? lines.map((l) => ({ id: genId(), text: l.trim(), checked: false, level: 0 }))
          : [{ id: genId(), text: '', checked: false, level: 0 }]
      );
      setContent('');
    }
    setMode('list');
  };

  const switchToText = () => {
    if (mode === 'list') setContent(items.map((i) => i.text).join('\n'));
    setMode('text');
  };

  const formattedDate = new Date(note.updatedAt || note.createdAt || Date.now())
    .toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  return (
    <div
      className="note-card"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setShowMenu(false);
      }}
      onMouseLeave={() => setShowMenu(false)}
    >
      {dirty && <div className="note-card-saving" />}

      <input
        className="note-card-title"
        placeholder="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {mode === 'text' ? (
        <textarea
          ref={textareaRef}
          className="note-card-content"
          placeholder="Заметка..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={1}
          onInput={textareaResize}
        />
      ) : (
        <CheckList items={items} onChange={setItems} />
      )}

      <div className="note-card-footer">
        <div className="note-card-actions">
          <button
            className={`note-card-action icon-button${pinned ? ' note-card-action--active' : ''}`}
            title={pinned ? 'Открепить' : 'Закрепить'}
            onClick={() => setPinned((p) => !p)}
          >
            <span className="material-icons-round">push_pin</span>
          </button>

          <button
            className={`note-card-action icon-button${mode === 'list' ? ' note-card-action--active' : ''}`}
            title={mode === 'list' ? 'Текстовый режим' : 'Режим списка'}
            onClick={mode === 'list' ? switchToText : switchToList}
          >
            <span className="material-icons-round">checklist</span>
          </button>

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              className="note-card-action icon-button"
              title="Ещё"
              onClick={() => setShowMenu((v) => !v)}
            >
              <span className="material-icons-round">more_vert</span>
            </button>

            {showMenu && (
              <div className="note-card-menu">
                <button
                  className="note-card-menu-item note-card-menu-item--danger"
                  onClick={() => {
                    setShowMenu(false);
                    deleteNote(note.id);
                  }}
                >
                  <span className="material-icons-round">delete</span>
                  Удалить
                </button>
              </div>
            )}
          </div>
        </div>



        <div className="note-card-meta">
          {note._pending && (
            <span className="material-icons-round note-card-pending" title="Ожидает синхронизации">
              cloud_off
            </span>
          )}
          <span className="note-card-date">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}