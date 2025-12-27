import axios from 'axios'
import toast from 'react-hot-toast'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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


