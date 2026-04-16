import { apiFetch } from './http.js'

export function getSalesAnalytics(token, params = {}) {
  const qs = new URLSearchParams()
  if (params.startDate) qs.set('startDate', params.startDate)
  if (params.endDate) qs.set('endDate', params.endDate)
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return apiFetch(`/api/analytics/sales${query}`, { method: 'GET', token })
}

export function getPriceHistory(productId, token) {
  return apiFetch(`/api/products/${productId}/pricehistory`, { method: 'GET', token })
}

export function getProductImages(productId, token) {
  return apiFetch(`/api/products/${productId}/images`, { method: 'GET', token })
}
