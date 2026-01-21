import { Routes, Route } from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'
import AdminLogin from '../pages/AdminLogin'
import ProtectedRoute from '../components/common/ProtectedRoute'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/admin-login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
