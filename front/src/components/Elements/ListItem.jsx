import { useEffect, useRef } from 'react';

export function ListItem({
  item,
  index,
  dragging,
  onChange,
  onKeyDown,
  onDragStart,
  onFocusRequest,
}) {
  const indent = item.level * 24;
  const textareaRef = useRef(null);

  // Auto-resize on every text change
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [item.text]);

  // Notify parent if this item should receive focus
  useEffect(() => {
    onFocusRequest?.(index, textareaRef.current);
  });

  return (
    <div
      className={`list-item ${dragging ? 'list-item--dragging' : ''} ${item.checked ? 'list-item--checked' : ''}`}
      data-index={index}
      style={{ paddingLeft: indent + 4 }}
    >
      <span
        className="material-icons-round list-drag-handle"
        onPointerDown={(e) => onDragStart(e, index)}
      >
        drag_indicator
      </span>

      <input
        type="checkbox"
        className="list-checkbox"
        checked={item.checked}
        onChange={(e) => onChange(index, { checked: e.target.checked })}
      />

      <textarea
        ref={textareaRef}
        className="list-text-input"
        value={item.text}
        rows={1}
        onChange={(e) => onChange(index, { text: e.target.value })}
        onKeyDown={(e) => onKeyDown(e, index)}
      />
    </div>
  );
}