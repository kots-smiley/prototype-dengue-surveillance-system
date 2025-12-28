import axios from 'axios'
import toast from 'react-hot-toast'

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '')
// Always target the API prefix even if VITE_API_URL is set to the bare domain
const apiBaseUrl = normalizedBaseUrl.endsWith('/api')
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`

export const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add token on every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            toast.error('Your session has expired. Please login again.')
            localStorage.removeItem('token')
            setTimeout(() => {
            window.location.href = '/login'
            }, 1500)
        } else if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.')
        }
        return Promise.reject(error)
    }
)


