import { useState, useRef, useEffect } from 'react';
import { ListItem } from './ListItem';

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export function CheckList({ items, onChange }) {
  const focusIndexRef = useRef(null);

  const dragIndex = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const listRef = useRef(null);
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const handleDragStart = (e, idx) => {
    e.preventDefault();
    dragIndex.current = idx;
    setDraggingId(itemsRef.current[idx].id);
  };

  useEffect(() => {
    const move = (e) => {
      if (dragIndex.current === null) return;

      const container = listRef.current;
      if (!container) return;

      const elements = [...container.querySelectorAll('.list-item')];
      if (elements.length === 0) return;

      let targetIndex = elements.length - 1;
      for (let i = 0; i < elements.length; i++) {
        const rect = elements[i].getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex === dragIndex.current) return;

      const from = dragIndex.current;
      const to = targetIndex;
      dragIndex.current = to;

      const next = [...itemsRef.current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onChange(next);
    };

    const up = () => {
      if (dragIndex.current === null) return;
      dragIndex.current = null;
      setDraggingId(null);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [onChange]);

  const updateItem = (idx, patch) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const itemKeyDown = (e, idx) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const next = [...items];
      next.splice(idx + 1, 0, {
        id: genId(),
        text: '',
        checked: false,
        level: items[idx].level,
      });
      focusIndexRef.current = idx + 1;
      onChange(next);
    } else if (e.key === 'Backspace' && items[idx].text === '' && items.length > 1) {
      e.preventDefault();
      focusIndexRef.current = Math.max(0, idx - 1);
      onChange(items.filter((_, i) => i !== idx));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const newLevel = e.shiftKey
        ? Math.max(0, items[idx].level - 1)
        : Math.min(3, items[idx].level + 1);
      updateItem(idx, { level: newLevel });
    }
  };

  const addItem = () => {
    focusIndexRef.current = items.length;
    onChange([...items, { id: genId(), text: '', checked: false, level: 0 }]);
  };

  const handleFocusRequest = (idx, el) => {
    if (focusIndexRef.current === idx) {
      focusIndexRef.current = null;
      el?.focus();
    }
  };

  return (
    <div className="note-card-list" ref={listRef}>
      {items.map((item, idx) => (
        <ListItem
          key={item.id}
          item={item}
          index={idx}
          dragging={draggingId === item.id}
          onChange={updateItem}
          onKeyDown={itemKeyDown}
          onDragStart={handleDragStart}
          onFocusRequest={handleFocusRequest}
        />
      ))}

      <button className="list-add-item" onClick={addItem}>
        <span className="material-icons-round">add</span>
        Добавить пункт
      </button>
    </div>
  );
}