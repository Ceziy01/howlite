import { useEffect, useRef, useState } from 'react';
import './ContextMenu.css';

export default function ContextMenu({ x, y, items = [], onClose }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: y, left: x, ready: false });

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // клэмп после первого рендера, когда известны реальные размеры меню
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const margin = 8;
    const clampedLeft = Math.min(Math.max(x, margin), window.innerWidth - width - margin);
    const clampedTop = Math.min(Math.max(y, margin), window.innerHeight - height - margin);
    setPos({ top: clampedTop, left: clampedLeft, ready: true });
  }, [x, y]);

  return (
    <>
      <div className="cm-backdrop" onClick={onClose} />
      <div
        ref={menuRef}
        className="cm-menu"
        style={{ top: pos.top, left: pos.left, visibility: pos.ready ? 'visible' : 'hidden' }}
      >
        {items.map((item, idx) => (
          <button
            key={idx}
            className={`cm-item ${item.danger ? 'danger' : ''}`}
            onClick={() => { item.onClick?.(); onClose(); }}
          >
            {item.icon && <span className="material-icons-round cm-icon">{item.icon}</span>}
            <span className="cm-label">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}