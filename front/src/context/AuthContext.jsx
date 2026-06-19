import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi, setAccessToken, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initDone = useRef(false);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);

    // Защита от двойного вызова (StrictMode / HMR)
    if (initDone.current) return;
    initDone.current = true;

    // /refresh уже возвращает user внутри TokenResponse — не нужен отдельный /me
    authApi.refreshFull()
      .then((data) => {
        if (data) {
          setAccessToken(data.access_token);
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (username, password) => {
    const data = await authApi.login({ username, password });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, username, password) => {
    const data = await authApi.register({ name, username, password });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}