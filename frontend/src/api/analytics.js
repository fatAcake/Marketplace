import { apiFetch } from './http.js'

// Sales analytics для текущего продавца
export function getSalesAnalytics(token, params = {}) {
  const qs = new URLSearchParams()
  if (params.startDate) qs.set('startDate', params.startDate)
  if (params.endDate) qs.set('endDate', params.endDate)
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return apiFetch(`/api/analytics/sales${query}`, { method: 'GET', token })
}

// Price history конкретного продукта
export function getPriceHistory(productId, token) {
  return apiFetch(`/api/products/${productId}/pricehistory`, { method: 'GET', token })
}

// Изображения продукта
export function getProductImages(productId, token) {
  return apiFetch(`/api/products/${productId}/images`, { method: 'GET', token })
}
