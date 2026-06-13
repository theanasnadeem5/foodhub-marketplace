import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const api = axios.create({ baseURL: API_URL })

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('fh_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fh_token')
      localStorage.removeItem('fh_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
