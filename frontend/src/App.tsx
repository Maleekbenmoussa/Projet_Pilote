import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { JobsPage } from '@/pages/JobsPage'
import { EmployersPage } from '@/pages/EmployersPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { RecruiterDashboardPage } from '@/pages/RecruiterDashboardPage'
import { PostJobPage } from '@/pages/PostJobPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { AccessDeniedPage } from '@/pages/AccessDeniedPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/employers" element={<EmployersPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['CANDIDATE', 'ADMIN']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter-dashboard"
          element={
            <ProtectedRoute roles={['EMPLOYER', 'ADMIN']}>
              <RecruiterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-job"
          element={
            <ProtectedRoute roles={['EMPLOYER', 'ADMIN']}>
              <PostJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
