import { useWorkspace } from '../../context/WorkspaceContext';
import NoteCreator from './NoteCreator';
import NoteCard from './NoteCard';
import './NotesWorkspace.css';

export default function NotesWorkspace() {
  const { activeWorkspace } = useWorkspace();
  const notes = activeWorkspace?.notes ?? [];

  const pinned = notes.filter(n => n.pinned);
  const others = notes.filter(n => !n.pinned);

  return (
    <div className="notes-workspace">
      <NoteCreator workspaceId={activeWorkspace?.id} />

      {pinned.length > 0 && (
        <section className="notes-section">
          <div className="notes-section-label">ЗАКРЕПЛЁННЫЕ</div>
          <div className="notes-masonry">
            {pinned.map(n => <NoteCard key={n.id} note={n} />)}
          </div>
        </section>
      )}

      {pinned.length > 0 && others.length > 0 && (
        <div className="notes-section-label notes-section-label--separator">ОСТАЛЬНЫЕ</div>
      )}

      {others.length > 0 && (
        <div className="notes-masonry">
          {others.map(n => <NoteCard key={n.id} note={n} />)}
        </div>
      )}

      {notes.length === 0 && (
        <div className="notes-empty">
          <span className="material-icons-round notes-empty-icon">{activeWorkspace.icon}</span>
          <p>Пока тут как-то пустовато</p>
        </div>
      )}
    </div>
  );
}