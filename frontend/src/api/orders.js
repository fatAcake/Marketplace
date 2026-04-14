import { api } from './http.js';

export const ordersApi = {
  /**
   * Заказы текущего пользователя (как покупателя)
   */
  getMyOrders: () => api.get('/api/orders'),

  /**
   * Детали конкретного заказа
   */
  getById: (id) => api.get(`/api/orders/${id}`),

  /**
   * Обновление статуса заказа
   */
  updateStatus: (id, status) => 
    api.put(`/api/orders/${id}/status`, { status }),

  /**
   * Продажи пользователя (если он продавец)
   */
  getMySales: () => api.get('/api/sales'),
};