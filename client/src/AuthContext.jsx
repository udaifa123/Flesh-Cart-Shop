
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { api } from './api.js';

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the current login session.
  const refresh = useCallback(async () => {
    try {
      const data = await api('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const onExpired = () => {
      setUser(null);
    };

    const onShow = (event) => {
      if (event.persisted) {
        refresh();
      }
    };

    window.addEventListener('auth-expired', onExpired);
    window.addEventListener('pageshow', onShow);

    return () => {
      window.removeEventListener('auth-expired', onExpired);
      window.removeEventListener('pageshow', onShow);
    };
  }, [refresh]);

  // Email and password login.
  const login = async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    });

    setUser(data.user);
    return data.user;
  };

  // Google sign-in.
  const googleLogin = async (credential) => {
    if (typeof credential !== 'string' || !credential) {
      throw new Error('Google sign-in credential is missing.');
    }

    const data = await api('/auth/google', {
      method: 'POST',
      body: {
        credential,
      },
    });

    setUser(data.user);
    return data.user;
  };

  // Logout.
  const logout = async () => {
    try {
      await api('/auth/logout', {
        method: 'POST',
      });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        login,
        googleLogin,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
