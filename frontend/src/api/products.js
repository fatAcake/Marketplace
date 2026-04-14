import { api } from './http.js';

const BASE_PATH = '/api/products';

export const productsApi = {
  /**
   * Список всех продуктов
   */
  getAll: () => api.get(BASE_PATH),

  /**
   * Получение одного продукта по ID
   */
  getById: (id) => api.get(`${BASE_PATH}/${id}`),

  /**
   * Продукты конкретного пользователя
   */
  getByUserId: (userId) => api.get(`${BASE_PATH}/users/${userId}/products`),

  /**
   * Создание продукта (использует FormData для загрузки изображений)
   */
  create: (formData) => api.multipart(BASE_PATH, formData),

  /**
   * Обновление данных продукта
   */
  update: (id, formData) => api.multipart(`${BASE_PATH}/${id}`, formData, 'PUT'),

  /**
   * Удаление продукта
   */
  delete: (id) => api.delete(`${BASE_PATH}/${id}`),

  /**
   * Получение списка изображений продукта
   */
  getImages: (id) => api.get(`${BASE_PATH}/${id}/images`),

  getProductImageUrl: (productId, imageId) => {
    if (!productId || !imageId) return null;
    return `${import.meta.env.VITE_API_BASE}/api/products/${productId}/images/${imageId}`;
  }
};