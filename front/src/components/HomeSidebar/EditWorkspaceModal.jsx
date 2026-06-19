import { useState } from 'react';
import IconPickerModal from './IconPickerModal';

export default function EditWorkspaceModal({ workspace, onSave, onClose }) {
  const [name, setName] = useState(workspace.name);
  const [icon, setIcon] = useState(workspace.icon);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon });
    onClose();
  };

  return (
    <div className="icon-picker-overlay" onClick={onClose}>
      <div className="add-ws-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-ws-title">Редактировать воркспейс</div>
        <div className="add-ws-row">
          <button className="add-ws-icon-btn" onClick={() => setShowIconPicker(true)}>
            <span className="material-icons-round">{icon}</span>
          </button>
          <input
            className="add-ws-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="add-ws-actions">
          <button className="add-ws-cancel" onClick={onClose}>Отмена</button>
          <button className="add-ws-confirm" onClick={handleSave}>Сохранить</button>
        </div>
        {showIconPicker && (
          <IconPickerModal
            current={icon}
            onSelect={setIcon}
            onClose={() => setShowIconPicker(false)}
          />
        )}
      </div>
    </div>
  );
}