import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--md-sys-color-surface)',
        color: 'var(--md-sys-color-on-surface-variant)',
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
      }}>
        <span className="material-icons-round" style={{ fontSize: 32, opacity: 0.4 }}>hourglass_empty</span>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}