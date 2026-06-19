import { useEffect } from 'react';
import './ContextMenu.css';

export default function ContextMenu({
  x,
  y,
  items = [],
  onClose,
}) {
  // закрытие по ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      {/* фон */}
      <div className="cm-backdrop" onClick={onClose} />

      {/* меню */}
      <div
        className="cm-menu"
        style={{ top: y, left: x }}
      >
        {items.map((item, idx) => (
          <button
            key={idx}
            className={`cm-item ${item.danger ? 'danger' : ''}`}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
          >
            {item.icon && (
              <span className="material-icons-round cm-icon">
                {item.icon}
              </span>
            )}
            <span className="cm-label">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}