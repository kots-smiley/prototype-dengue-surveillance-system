import { Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Layout } from '../components/common/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Cases from '../pages/Cases';
import CaseForm from '../pages/CaseForm';
import Reports from '../pages/Reports';
import ReportForm from '../pages/ReportForm';
import Alerts from '../pages/Alerts';
import Feedback from '../pages/Feedback';
import Analytics from '../pages/Analytics';
import Diseases from '../pages/Diseases';
import DiseaseForm from '../pages/DiseaseForm';
import Barangays from '../pages/Barangays';
import BarangayForm from '../pages/BarangayForm';
import Users from '../pages/Users';
import UserForm from '../pages/UserForm';
import Exports from '../pages/Exports';

export function AppRoutes() {
  return (
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

        <Route
          path="cases"
          element={
            <ProtectedRoute roles={['ADMIN', 'BHW', 'HOSPITAL_ENCODER']}>
              <Cases />
            </ProtectedRoute>
          }
        />
        <Route
          path="cases/new"
          element={
            <ProtectedRoute roles={['ADMIN', 'BHW', 'HOSPITAL_ENCODER']}>
              <CaseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="cases/:id/edit"
          element={
            <ProtectedRoute roles={['ADMIN', 'BHW', 'HOSPITAL_ENCODER']}>
              <CaseForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="reports"
          element={
            <ProtectedRoute roles={['ADMIN', 'BHW', 'RESIDENT']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/new"
          element={
            <ProtectedRoute roles={['ADMIN', 'BHW', 'RESIDENT']}>
              <ReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/:id/edit"
          element={
            <ProtectedRoute roles={['ADMIN', 'BHW']}>
              <ReportForm />
            </ProtectedRoute>
          }
        />

        <Route path="alerts" element={<Alerts />} />
        <Route
          path="feedback"
          element={
            <ProtectedRoute roles={['ADMIN', 'BHW']}>
              <Feedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <ProtectedRoute roles={['ADMIN', 'BHW', 'HOSPITAL_ENCODER']}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="diseases"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Diseases />
            </ProtectedRoute>
          }
        />
        <Route
          path="diseases/new"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DiseaseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="diseases/:id/edit"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DiseaseForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="barangays"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Barangays />
            </ProtectedRoute>
          }
        />
        <Route
          path="barangays/new"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <BarangayForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="barangays/:id/edit"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <BarangayForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="users/new"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="users/:id/edit"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <UserForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="exports"
          element={
            <ProtectedRoute roles={['ADMIN', 'BHW']}>
              <Exports />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
