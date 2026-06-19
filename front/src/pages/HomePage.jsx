import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWorkspace } from '../context/WorkspaceContext';
import Sidebar from '../components/HomeSidebar/Sidebar';
import NotesWorkspace from '../components/NotesWorkspace/NotesWorkspace';
import TodoWorkspace from '../components/TodoWorkspace/TodoWorkspace';
import Logo from '../components/Elements/Logo';
import './HomePage.css';

export default function HomePage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeWorkspace, loading } = useWorkspace();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  {/* крутящаяся херь загрузки */ }
  if (loading) {
    return (
      <div className="home-loading">
        <span className="material-icons-round home-loading-icon">hourglass_empty</span>
      </div>
    );
  }

  {/* Отрисовка воркспейса */ }
  const renderWorkspace = () => {
    if (!activeWorkspace) {
      return (
        <div className="home-no-workspace">
          <span className="material-icons-round" style={{ fontSize: 64, opacity: 0.3 }}>widgets</span>
          <p>Пока здесь как-то пустовато</p>
        </div>
      );
    }
    if (activeWorkspace.type == 'todo') {
      return <TodoWorkspace />
    }
    return <NotesWorkspace />;
  };

  return (
    <div className="home-root">
      {/* навбар */}
      <header className="topbar">
        <div className="topbar-left">
          {/* кнопка развёртывания боковой панели */}
          <button
            className="md-icon-btn topbar-menu-btn"
            onClick={() => setSidebarExpanded(e => !e)}
            title="Меню"
          >
            <span className="material-icons-round">menu</span>
          </button>

          {/* логотип этого пиздеца */}
          <Logo />
          {activeWorkspace && (
            <>
              <span className="topbar-sep material-icons-round">chevron_right</span>
              <span className="topbar-ws-name">{activeWorkspace.name}</span>
            </>
          )}
        </div>

        <div className="topbar-right">
          {/* Кнопка темы */}
          <button className="md-icon-btn" onClick={toggleTheme} title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
            <span className="material-icons-round">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          {/* Кнопка настроек */}
          <button className="md-icon-btn" title="Настройки">
            <span className="material-icons-round">settings</span>
          </button>

          {/* Отображение имени пользователя */}
          <span className="topbar-username">{user?.name || user?.username}</span>

          {/* Кнопка разлогина */}
          <button className="md-icon-btn topbar-logout" onClick={logout} title="Выйти">
            <span className="material-icons-round">logout</span>
          </button>
        </div>
      </header>

      <div className="home-body">
        <Sidebar expanded={sidebarExpanded && (
          <div className="sidebar-backdrop" onClick={() => setSidebarExpanded(false)} />
        )} onSelect={() => { if (isMobile()) setSidebarExpanded(false); }} onClick={() => { setActiveWorkspaceId(ws.id); onSelect?.(); }} />
        <main className="home-content">
          {renderWorkspace()}
        </main>
      </div>
    </div>
  );
}