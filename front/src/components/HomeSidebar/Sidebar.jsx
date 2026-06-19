import { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import ContextMenu from '../Elements/ContextMenu';
import AddWorkspaceModal from './AddWorkspaceModal';
import EditWorkspaceModal from './EditWorkspaceModal';
import './Sidebar.css';


export default function Sidebar({expanded}) {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useWorkspace();

  const [showAdd, setShowAdd] = useState(false);

  const [editingWorkspace, setEditingWorkspace] = useState(null);

  const [contextMenu, setContextMenu] = useState(null);

  return (
    <>
      <aside
        className={`sidebar ${expanded
            ? 'sidebar--expanded'
            : ''
          }`}
      >
        <div className="sidebar-items">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="sidebar-item-wrapper md-tooltip-wrapper"
            >
              <button
                className={`sidebar-item ${activeWorkspaceId ===
                    ws.id
                    ? 'sidebar-item--active'
                    : ''
                  }`}
                onClick={() =>
                  setActiveWorkspaceId(
                    ws.id
                  )
                }
                onContextMenu={(e) => {
                  e.preventDefault();

                  setContextMenu({
                    workspace: ws,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
              >
                <span className="material-icons-round sidebar-item-icon">
                  {ws.icon}
                </span>

                {expanded && (
                  <span className="sidebar-item-label">
                    {ws.name}
                  </span>
                )}
              </button>

              {!expanded && (
                <span className="md-tooltip">
                  {ws.name}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="md-tooltip-wrapper">
            <button
              className="sidebar-add-btn md-icon-btn"
              onClick={() =>
                setShowAdd(true)
              }
              title="Добавить воркспейс"
            >
              <span className="material-icons-round">
                add
              </span>
            </button>

            {!expanded && (
              <span className="md-tooltip">
                Добавить воркспейс
              </span>
            )}
          </div>
        </div>
      </aside>

      {showAdd && (
        <AddWorkspaceModal
          onClose={() =>
            setShowAdd(false)
          }
          onCreate={createWorkspace}
        />
      )}

      {editingWorkspace && (
        <EditWorkspaceModal
          workspace={editingWorkspace}
          onClose={() =>
            setEditingWorkspace(null)
          }
          onSave={(data) =>
            updateWorkspace(
              editingWorkspace.id,
              data
            )
          }
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              icon: 'edit',
              label: 'Редактировать',
              onClick: () => {
                setEditingWorkspace(contextMenu.workspace);
              },
            },
            {
              icon: 'delete',
              label: 'Удалить',
              danger: true,
              onClick: () => {
                if (
                  window.confirm(
                    `Удалить "${contextMenu.workspace.name}"?`
                  )
                ) {
                  deleteWorkspace(contextMenu.workspace.id);
                }
              },
            },
          ]}
        />
      )}
    </>
  );
}