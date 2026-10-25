import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Always ask the server who we are (the cookie is httpOnly, JS can't read it)
  const refresh = useCallback(async () => {
    try {
      const d = await api('/auth/me');
      setUser(d.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onExpired = () => setUser(null);
    // Back/forward cache: re-check the session when a page is restored from history
    const onShow = (e) => e.persisted && refresh();
    window.addEventListener('auth-expired', onExpired);
    window.addEventListener('pageshow', onShow);
    return () => {
      window.removeEventListener('auth-expired', onExpired);
      window.removeEventListener('pageshow', onShow);
    };
  }, [refresh]);

  const login = async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    setUser(d.user);
  };
  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}
