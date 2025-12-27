import { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: UserRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, token, loading } = useAuth()

  // Check for token in both state and localStorage
  const hasToken = token || localStorage.getItem('token')

  // Show loading while checking auth
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  // If no token, redirect to login
  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  // If we have a token but no user yet, wait a bit (might be loading)
  if (hasToken && !user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <div className="text-lg text-gray-600">Loading user information...</div>
        </div>
      </div>
    )
  }

  // If still no user after loading, redirect to login
  if (!user && !loading) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}


