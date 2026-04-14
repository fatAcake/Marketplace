import { api } from './http.js';

const BASE_PATH = '/api/analytics';

export const analyticsApi = {
  /**
   * Получение аналитики продаж. 
   * params может содержать { startDate, endDate }
   */
  getSales: (params) => api.get(`${BASE_PATH}/sales`, { params }),

  /**
   * История изменения цен конкретного продукта
   */
  getPriceHistory: (productId) => 
    api.get(`/api/products/${productId}/pricehistory`),
};