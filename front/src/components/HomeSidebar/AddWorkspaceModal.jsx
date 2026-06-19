import { useState } from 'react';
import IconPickerModal from './IconPickerModal';

const WORKSPACE_TYPES = [
    { id: 'notes', label: 'Заметки', icon: 'notes' },
    { id: 'todo', label: 'Список дел', icon: 'checklist' },
];

function TypePreview({ type }) {
    if (type === 'notes') return (
        <div className="ws-type-preview">
            <div className="ws-notes-creator-mini">
                <div className="ws-notes-creator-text" />
                <div className="ws-notes-creator-icon" />
            </div>
            <div className="ws-notes-masonry">
                {[
                    ['70%', ['90%', '60%', '80%']],
                    ['80%', ['75%', '55%']],
                    ['60%', ['85%', '70%', '40%']],
                ].map(([titleW, lines], i) => (
                    <div key={i} className="ws-notes-card-mini">
                        <div className="ws-notes-card-title" style={{ width: titleW }} />
                        {lines.map((w, j) => (
                            <div key={j} className="ws-note-line" style={{ width: w }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
    if (type === 'todo') return (
        <div className="ws-type-preview">
            {[true, true, false, false].map((done, i) => (
                <div key={i} className="ws-todo-row">
                    <div className={`ws-todo-check ${done ? 'ws-todo-check--done' : ''}`} />
                    <div className="ws-todo-line" style={{ width: `${[70, 55, 80, 45][i]}%` }} />
                </div>
            ))}
        </div>
    );
    return null;
}

export default function AddWorkspaceModal({ onClose, onCreate }) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('lightbulb');
    const [type, setType] = useState('notes');
    const [showIconPicker, setShowIconPicker] = useState(false);

    const handleCreate = () => {
        if (!name.trim()) return;
        onCreate({ name: name.trim(), icon, type });
        onClose();
    };

    return (
        <div className="icon-picker-overlay" onClick={onClose}>
            <div className="add-ws-modal" onClick={(e) => e.stopPropagation()}>
                <div className="add-ws-title">Новый воркспейс</div>

                <div className="add-ws-row">
                    <button className="add-ws-icon-btn" onClick={() => setShowIconPicker(true)}>
                        <span className="material-icons-round">{icon}</span>
                    </button>
                    <input
                        className="add-ws-input"
                        placeholder="Название"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        autoFocus
                    />
                </div>

                <div className="add-ws-type-label">Тип</div>
                <div className="add-ws-types">
                    {WORKSPACE_TYPES.map((t) => (
                        <button
                            key={t.id}
                            className={`add-ws-type-card ${type === t.id ? 'add-ws-type-card--selected' : ''}`}
                            onClick={() => setType(t.id)}
                        >
                            <div className="add-ws-type-check">
                                <span className="material-icons-round">check</span>
                            </div>
                            <TypePreview type={t.id} />
                            <div className="add-ws-type-name">
                                <span className="material-icons-round">{t.icon}</span>
                                {t.label}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="add-ws-actions">
                    <button className="add-ws-cancel" onClick={onClose}>Отмена</button>
                    <button className="add-ws-confirm" onClick={handleCreate} disabled={!name.trim()}>
                        Создать
                    </button>
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