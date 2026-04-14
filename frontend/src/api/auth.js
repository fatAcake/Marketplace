import { apiFetch } from './http.js'

export function register(payload) {
  return apiFetch('/api/auth/register', { method: 'POST', body: payload })
}

export function verifyCode(payload) {
  return apiFetch('/api/auth/verify-code', { method: 'POST', body: payload })
}

export function resendCode(payload) {
  return apiFetch('/api/auth/resend-code', { method: 'POST', body: payload })
}

export function login(payload) {
  return apiFetch('/api/auth/login', { method: 'POST', body: payload })
}

export function me(token) {
  return apiFetch('/api/auth/me', { method: 'GET', token })
}

export function refresh() {
  return apiFetch('/api/auth/refresh', { method: 'POST' })
}

export function logout(token) {
  return apiFetch('/api/auth/logout', { method: 'POST', token })
}

