import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const canAccess = (roles: UserRole[]) => {
    return user && roles.includes(user.role)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-primary-600">
                Dengue Surveillance System
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-xs sm:text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg lg:shadow-sm
          min-h-[calc(100vh-4rem)] border-r
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 space-y-2">
            <Link
              to="/dashboard"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            {(canAccess(['ADMIN', 'BHW', 'HOSPITAL_ENCODER']) && (
              <>
                <Link
                  to="/cases"
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive('/cases') || location.pathname.startsWith('/cases/')
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dengue Cases
                </Link>
                <Link
                  to="/reports"
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive('/reports') || location.pathname.startsWith('/reports/')
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Environmental Reports
                </Link>
              </>
            ))}
            <Link
              to="/alerts"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/alerts')
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Alerts
            </Link>
            <Link
              to="/analytics"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/analytics')
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Analytics
            </Link>
            {canAccess(['ADMIN']) && (
              <>
                <Link
                  to="/users"
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive('/users')
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/barangays"
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive('/barangays')
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Barangays
                </Link>
              </>
            )}
            {canAccess(['ADMIN', 'BHW']) && (
              <Link
                to="/exports"
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive('/exports')
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Exports
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 w-full lg:w-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


