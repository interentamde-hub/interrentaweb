import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import ProtectedRoute from './components/common/ProtectedRoute'
import Home from './pages/Home'
import PropertyDetail from './pages/PropertyDetail'
import MunicipioPage from './pages/MunicipioPage'
import WhatsAppFloat from './components/ui/WhatsAppFloat'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
    <WhatsAppFloat />
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

      {/* Páginas por municipio */}
      <Route path="/rionegro" element={<MunicipioPage municipio="rionegro" />} />
      <Route path="/envigado" element={<MunicipioPage municipio="envigado" />} />
      <Route path="/el-retiro" element={<MunicipioPage municipio="el-retiro" />} />
      <Route path="/san-vicente" element={<MunicipioPage municipio="san-vicente" />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
}