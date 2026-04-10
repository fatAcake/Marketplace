const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5035'

function joinUrl(base, path) {
  if (!path) return base
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

async function readErrorMessage(res) {
  const contentType = res.headers.get('content-type') || ''

  try {
    if (contentType.includes('application/json')) {
      const data = await res.json()
      if (typeof data === 'string') return data
      if (data?.error) return String(data.error)
      if (data?.message) return String(data.message)
      return JSON.stringify(data)
    }
    const text = await res.text()
    return text || res.statusText
  } catch {
    return res.statusText
  }
}

export async function apiFetch(path, { method = 'GET', token, body } = {}) {
  const url = joinUrl(API_BASE, path)

  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
  })

  if (!res.ok) {
    const message = await readErrorMessage(res)
    const err = new Error(message || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return await res.json()
  return await res.text()
}

/**
 * Загрузка с FormData (multipart/form-data) — для создания/обновления продуктов с файлами.
 */
export async function apiFetchMultipart(path, { method = 'POST', token, formData } = {}) {
  const url = joinUrl(API_BASE, path)

  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  // Content-Type НЕ ставим — браузер сам установит boundary для multipart

  const res = await fetch(url, {
    method,
    headers,
    body: formData,
    credentials: 'include',
  })

  if (!res.ok) {
    const message = await readErrorMessage(res)
    const err = new Error(message || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return await res.json()
  return await res.text()
}

