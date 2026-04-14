import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth.js';
import { authStorage } from './authStorage.js';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Синхронизация состояния приложения с хранилищем
  const updateAuth = useCallback((userData, token = null) => {
    setUser(userData);
    if (token !== null) {
      authStorage.setToken(token);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Игнорируем ошибки при выходе
    } finally {
      authStorage.clearToken();
      setUser(null);
    }
  }, []);

  const hydrate = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      updateAuth(userData);
    } catch (e) {
      // Если токен протух (401), пробуем обновить
      if (e.status === 401) {
        try {
          const res = await authApi.refresh();
          if (res?.token) {
            authStorage.setToken(res.token);
            const retryUser = await authApi.getMe();
            updateAuth(retryUser);
          } else {
            await logout();
          }
        } catch {
          await logout();
        }
      }
    } finally {
      setLoading(false);
    }
  }, [updateAuth, logout]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Универсальный метод для завершения входа/верификации
  const handleAuthResponse = useCallback((res) => {
    if (res?.token && res?.user) {
      updateAuth(res.user, res.token);
    }
    return res;
  }, [updateAuth]);

  const login = useCallback(async (payload) => {
    const res = await authApi.login(payload);
    return handleAuthResponse(res);
  }, [handleAuthResponse]);

  const verify = useCallback(async (payload) => {
    const res = await authApi.verifyCode(payload);
    return handleAuthResponse(res);
  }, [handleAuthResponse]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    verify,
    logout,
    updateUser: setUser, // Понадобится для редактирования профиля
  }), [user, loading, login, verify, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}