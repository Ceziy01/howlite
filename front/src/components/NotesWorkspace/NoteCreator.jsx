import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CheckList } from '../Elements/CheckList';
import './NoteCreator.css';

function genId() {
    return Math.random().toString(36).slice(2, 10);
}

export default function NoteCreator({ workspaceId }) {
    const { createNote } = useWorkspace();
    const [expanded, setExpanded] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [items, setItems] = useState([{ id: genId(), text: '', checked: false, level: 0 }]);
    const [mode, setMode] = useState('text');
    const wrapperRef = useRef(null);
    const contentRef = useRef(null);

    const reset = () => {
        setTitle('');
        setContent('');
        setItems([{ id: genId(), text: '', checked: false, level: 0 }]);
        setMode('text');
        setExpanded(false);
    };

    const handleSave = async () => {
        const hasContent = title.trim() || (mode === 'text' ? content.trim() : items.some(i => i.text.trim()));
        if (!hasContent) { reset(); return; }
        await createNote({
            title: title.trim() || null,
            content: mode === 'text' ? content : null,
            items: mode === 'list' ? items : null,
            mode,
        });
        reset();
    };

    // Close on outside click
    useEffect(() => {
        if (!expanded) return;
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                handleSave();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [expanded, title, content, items, mode]);

    const handleExpand = () => {
        setExpanded(true);
        setTimeout(() => contentRef.current?.focus(), 50);
    };

    const switchMode = (newMode) => {
        if (newMode === mode) return;
        if (newMode === 'list') {
            const lines = content.split('\n').filter(l => l.trim());
            setItems(lines.length > 0
                ? lines.map(l => ({ id: genId(), text: l.trim(), checked: false, level: 0 }))
                : [{ id: genId(), text: '', checked: false, level: 0 }]);
            setContent('');
        } else {
            setContent(items.map(i => i.text).join('\n'));
        }
        setMode(newMode);
    };

    if (!expanded) {
        return (
            <div className="note-creator-collapsed" onClick={handleExpand}>
                <span className="note-creator-placeholder">Заметка...</span>
                <div className="note-creator-quick-actions">
                    <button
                        className="md-icon-btn"
                        title="Создать список"
                        onClick={e => { e.stopPropagation(); setMode('list'); setExpanded(true); }}
                    >
                        <span className="material-icons-round">checklist</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="note-creator-expanded" ref={wrapperRef}>
            <input
                className="note-creator-title"
                placeholder="Название"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />

            {mode === 'text' ? (
                <textarea
                    ref={contentRef}
                    className="note-creator-content"
                    placeholder="Заметка..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={3}
                    onInput={e => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />
            ) : (
                <div className="note-creator-list">
                    <CheckList items={items} onChange={setItems} />
                </div>
            )}

            <div className="note-creator-footer">
                <div className="note-creator-tools">
                    <button
                        className={`md-icon-btn ${mode === 'list' ? 'note-creator-tool--active' : ''}`}
                        title="В виде списка"
                        onClick={() => switchMode(mode === 'list' ? 'text' : 'list')}
                    >
                        <span className="material-icons-round">checklist</span>
                    </button>
                </div>
                <button className="note-creator-close" onClick={handleSave}>
                    Закрыть
                </button>
            </div>
        </div>
    );
}