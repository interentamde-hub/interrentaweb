import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProperties, deleteProperty, updateProperty } from '../services/property.service'
import { supabase } from '../services/supabase'
import AvailabilityDot from '../components/ui/AvailabilityDot'
import PropertyModal from '../components/admin/PropertyModal'

export default function AdminDashboard() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    setLoading(true)
    const { data } = await getAllProperties()
    setProperties(data || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/panel-ir8x7k2m9z')  // CAMBIO AQUÍ
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar esta propiedad?')) return
    const { error } = await deleteProperty(id)
    if (!error) {
      setProperties(properties.filter(p => p.id !== id))
    }
  }

  const handleEdit = (property) => {
    setEditingProperty(property)
    setModalOpen(true)
  }

  const handleNewProperty = () => {
    setEditingProperty(null)
    setModalOpen(true)
  }

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await updateProperty(id, { status: newStatus })
    if (!error) {
      setProperties(properties.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Panel Admin</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Propiedades ({properties.length})
          </h2>
          <button 
            onClick={handleNewProperty}
            className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            + Nueva Propiedad
          </button>
        </div>

        <div className="grid gap-4">
          {properties.map(property => (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center hover:shadow-md transition"
            >
              <div className="flex gap-4 items-center flex-1">
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {property.cover_url ? (
                    <img
                      src={property.cover_url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{property.title}</h3>
                  <p className="text-sm text-gray-500">
                    {property.property_type} · {property.contract_type}
                    {property.sector && ` · ${property.sector}`}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <AvailabilityDot status={property.status} />
                    <select
                      value={property.status}
                      onChange={(e) => handleStatusChange(property.id, e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="reservado">Reservado</option>
                      <option value="no_disponible">No disponible</option>
                    </select>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${property.price?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {property.contract_type === 'arriendo' ? 'por mes' : 'precio total'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 ml-6">
                <button 
                  onClick={() => handleEdit(property)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          {properties.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p className="text-gray-500 mb-4">No hay propiedades registradas</p>
              <button 
                onClick={handleNewProperty}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Agregar primera propiedad
              </button>
            </div>
          )}
        </div>
      </main>

      <PropertyModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProperty(null)
        }}
        onSuccess={loadProperties}
        property={editingProperty}
      />
    </div>
  )
}