import { useState } from 'react';

const WORKSPACE_ICONS = [
  'lightbulb', 'bookmark', 'star', 'favorite', 'home', 'work',
  'school', 'fitness_center', 'restaurant', 'travel_explore', 'palette', 'code',
  'music_note', 'library_books', 'science', 'shopping_cart', 'medical_services', 'sports_esports',
  'movie', 'airplane_ticket', 'directions_car', 'paid', 'auto_awesome', 'cake'
];

export { WORKSPACE_ICONS };

export default function IconPickerModal({ current, onSelect, onClose }) {
  return (
    <div className="icon-picker-overlay" onClick={onClose}>
      <div className="icon-picker" onClick={(e) => e.stopPropagation()}>
        <div className="icon-picker-title">Выбрать значок</div>
        <div className="icon-picker-grid">
          {WORKSPACE_ICONS.map((icon) => (
            <button
              key={icon}
              className={`icon-picker-item ${current === icon ? 'active' : ''}`}
              onClick={() => { onSelect(icon); onClose(); }}
            >
              <span className="material-icons-round">{icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}