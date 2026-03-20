import { Routes, Route } from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'
import AdminLogin from '../pages/AdminLogin'
import ProtectedRoute from '../components/common/ProtectedRoute'
import MunicipioPage from '../pages/MunicipioPage'

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

      {/* Páginas por municipio */}
      <Route path="/rionegro" element={<MunicipioPage municipio="rionegro" />} />
      <Route path="/envigado" element={<MunicipioPage municipio="envigado" />} />
      <Route path="/el-retiro" element={<MunicipioPage municipio="el-retiro" />} />
      <Route path="/san-vicente" element={<MunicipioPage municipio="san-vicente" />} />
    </Routes>
  )
}
