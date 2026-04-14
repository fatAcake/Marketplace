import { api } from './http.js';

const BASE_PATH = '/api/auth';

/**
 * Объект для работы с аутентификацией.
 * Обратите внимание: теперь методы не требуют явной передачи токена, 
 * если мы решим передавать его через опции (или позже автоматизируем это).
 */
export const authApi = {
  register: (payload) => 
    api.post(`${BASE_PATH}/register`, payload),

  verifyCode: (payload) => 
    api.post(`${BASE_PATH}/verify-code`, payload),

  resendCode: (payload) => 
    api.post(`${BASE_PATH}/resend-code`, payload),

  login: (payload) => 
    api.post(`${BASE_PATH}/login`, payload),

  /**
   * Получение данных о текущем пользователе.
   * Опции (включая token) теперь передаются вторым/третьим аргументом.
   */
  getMe: (options) => 
    api.get(`${BASE_PATH}/me`, options),

  refresh: () => 
    api.post(`${BASE_PATH}/refresh`),

  logout: (options) => 
    api.post(`${BASE_PATH}/logout`, null, options),
};