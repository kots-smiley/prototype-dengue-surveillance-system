import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken && !user) {
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        setToken(savedToken)
        await fetchUser()
      } else {
        setLoading(false)
      }
    }
    if (localStorage.getItem('token') && !user && !isLoggingIn) {
      initAuth()
    } else if (!localStorage.getItem('token')) {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      if (response.data.success && response.data.user) {
        setUser(response.data.user)
      } else if (response.data.user) {
        // Handle case where success wrapper might be missing
        setUser(response.data.user)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      // Only logout if we're not in the middle of logging in
      if (!isLoggingIn) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoggingIn(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      const responseData = response.data
      const newToken = responseData.token || responseData.data?.token
      const newUser = responseData.user || responseData.data?.user
      
      if (newToken && newUser) {
        setToken(newToken)
        localStorage.setItem('token', newToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        setUser(newUser)
        setLoading(false)
        setIsLoggingIn(false)
        return
      } else {
        throw new Error('Invalid response format from server')
      }
    } catch (error: any) {
      setIsLoggingIn(false)
      setLoading(false)
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Login failed'
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


