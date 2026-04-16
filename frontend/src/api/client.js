import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5035/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд
})
// Добавление токена перед каждым запросом
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Обработка ответов и ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Если токен истек — разлогиниваем
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api