const TOKEN_KEY = 'mp_access_token';

/**
 * Хранилище для токена аутентификации.
 * Используем localStorage для сохранения сессии между перезагрузками.
 */
export const authStorage = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error getting token from localStorage', e);
      return null;
    }
  },

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        this.clearToken();
      }
    } catch (e) {
      console.error('Error setting token in localStorage', e);
    }
  },

  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error removing token from localStorage', e);
    }
  }
};