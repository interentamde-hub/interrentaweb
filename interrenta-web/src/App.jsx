import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import ProtectedRoute from './components/common/ProtectedRoute'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/propiedades/:code" element={<PropertyDetail />} />
      <Route path="/panel-ir8x7k2m9z" element={<AdminLogin />} />
      <Route
        path="/admin-ir8x7k2m9z"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}