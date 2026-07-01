import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Otomatis kirim token JWT di setiap request kalau ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cm_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Kalau token expired / invalid → auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cm_token')
      localStorage.removeItem('cm_user')
    }
    return Promise.reject(error)
  }
)

export default api
