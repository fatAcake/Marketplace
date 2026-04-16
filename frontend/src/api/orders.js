import { apiFetch } from './http.js'

export function getMyOrders(token) {
  return apiFetch('/api/orders', { method: 'GET', token })
}

export function getOrderById(id, token) {
  return apiFetch(`/api/orders/${id}`, { method: 'GET', token })
}

export function updateOrderStatus(id, status, token) {
  return apiFetch(`/api/orders/${id}/status`, {
    method: 'PUT',
    token,
    body: { status },
  })
}

export function getMySales(token) {
  return apiFetch('/api/sales', { method: 'GET', token })
}
