import { apiFetch, apiFetchMultipart } from './http.js'

export function getProducts(token) {
  return apiFetch('/api/products', { method: 'GET', token })
}

export function getProductById(id, token) {
  return apiFetch(`/api/products/${id}`, { method: 'GET', token })
}

export function getProductsByUserId(userId, token) {
  return apiFetch(`/api/products/users/${userId}/products`, { method: 'GET', token })
}

/**
 * Создать продукт. formData — экземпляр FormData с полями:
 *   Name, Price, Quantity, Description, Images (файлы)
 */
export function createProduct(formData, token) {
  return apiFetchMultipart('/api/products', { method: 'POST', token, formData })
}

export function updateProduct(id, payload, token) {
  return apiFetch(`/api/products/${id}`, { method: 'PUT', token, body: payload })
}

export function deleteProduct(id, token) {
  return apiFetch(`/api/products/${id}`, { method: 'DELETE', token })
}

export function getProductImages(id, token) {
  return apiFetch(`/api/products/${id}/images`, { method: 'GET', token })
}
