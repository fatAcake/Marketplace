const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5035';

/**
 * Вспомогательная функция для формирования URL.
 */
const buildUrl = (path, params) => {
  if (!path) return API_BASE;
  let url = /^https?:\/\//.test(path) ? path : `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }
  return url;
};

/**
 * Универсальный обработчик ответа.
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Извлекаем сообщение об ошибке из JSON или оставляем текст/статус
    const message = (isJson && (data.error || data.message)) || data || response.statusText;
    const error = new Error(typeof message === 'string' ? message : JSON.stringify(message));
    error.status = response.status;
    error.data = data; // Сохраняем данные для сложной логики (например, валидация полей)
    throw error;
  }

  return data;
}

/**
 * Базовое ядро запросов (Base Client)
 Вся логика fetch в одном месте.
 */
async function coreFetch(path, options = {}) {
  const { method = 'GET', token, body, isMultipart = false, ...extraOptions } = options;
  
  const headers = { ...extraOptions.headers };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Если это НЕ multipart и есть тело — ставим JSON
  if (!isMultipart && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(buildUrl(path, options.params), {
    method,
    headers,
    body: isMultipart ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    credentials: 'include',
    ...extraOptions
  });

  return handleResponse(response);
}

// --- Публичный API ---

export const api = {
  get: (path, options) => coreFetch(path, { ...options, method: 'GET' }),
  
  post: (path, body, options) => coreFetch(path, { ...options, method: 'POST', body }),
  
  put: (path, body, options) => coreFetch(path, { ...options, method: 'PUT', body }),
  
  delete: (path, options) => coreFetch(path, { ...options, method: 'DELETE' }),

  /**
   * Специальный метод для FormData
   */
  multipart: (path, formData, options) => coreFetch(path, { 
    ...options, 
    method: 'POST', 
    body: formData, 
    isMultipart: true 
  }),
};