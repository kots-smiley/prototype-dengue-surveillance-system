import { Routes, Route, Navigate } from 'react-router'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import CaseForm from './pages/CaseForm'
import Reports from './pages/Reports'
import ReportForm from './pages/ReportForm'
import Alerts from './pages/Alerts'
import Users from './pages/Users'
import UserForm from './pages/UserForm'
import Barangays from './pages/Barangays'
import BarangayForm from './pages/BarangayForm'
import Analytics from './pages/Analytics'
import Exports from './pages/Exports'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cases" element={<Cases />} />
          <Route path="cases/new" element={<CaseForm />} />
          <Route path="cases/:id/edit" element={<CaseForm />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/new" element={<ReportForm />} />
          <Route path="reports/:id/edit" element={<ReportForm />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="users" element={<Users />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/:id/edit" element={<UserForm />} />
          <Route path="barangays" element={<Barangays />} />
          <Route path="barangays/new" element={<BarangayForm />} />
          <Route path="barangays/:id/edit" element={<BarangayForm />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="exports" element={<Exports />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App


