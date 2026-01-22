import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { createProperty, updateProperty } from '../../services/property.service'

const initialForm = {
  title: '',
  description: '',
  price: '',
  property_type: 'apartamento',
  contract_type: 'arriendo',
  status: 'disponible',
  sector: '',
  subsector: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  address: '',
  instagram_url: ''
}

export default function PropertyModal({ isOpen, onClose, onSuccess, property = null }) {
  const [form, setForm] = useState(property || initialForm)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(property?.cover_url || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!property

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (property) {
      setForm({ ...initialForm, ...property })
      setPreview(property.cover_url || null)
    } else {
      setForm(initialForm)
      setPreview(null)
    }
    setImage(null)
    setError(null)
  }, [property, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `properties/${fileName}`

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let cover_url = form.cover_url || null

      if (image) {
        cover_url = await uploadImage(image)
      }

      const propertyData = {
        title: form.title,
        description: form.description,
        cover_url,
        price: parseFloat(form.price) || 0,
        property_type: form.property_type,
        contract_type: form.contract_type,
        status: form.status,
        sector: form.sector || null,
        subsector: form.subsector || null,
        bedrooms: parseInt(form.bedrooms) || null,
        bathrooms: parseInt(form.bathrooms) || null,
        area: parseFloat(form.area) || null,
        address: form.address || null,
        instagram_url: form.instagram_url || null
      }

      let result
      if (isEditing) {
        result = await updateProperty(property.id, propertyData)
      } else {
        result = await createProperty(propertyData)
      }

      if (result.error) throw result.error

      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form con scroll */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Código generado (solo lectura si está editando) */}
            {isEditing && property.code && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  value={property.code}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                />
              </div>
            )}

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de portada</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-gray-400 transition-colors">
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => { setImage(null); setPreview(null); setForm(p => ({...p, cover_url: null})) }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">Click para subir imagen</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ej: Apartamento moderno en El Poblado"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                placeholder="Describe la propiedad..."
              />
            </div>

            {/* Grid de campos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contrato</label>
                <select
                  name="contract_type"
                  value={form.contract_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="arriendo">Arriendo</option>
                  <option value="venta">Venta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de inmueble</label>
                <select
                  name="property_type"
                  value={form.property_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="oficina">Oficina</option>
                  <option value="lote">Lote</option>
                  <option value="local">Local comercial</option>
                  <option value="finca">Finca</option>
                  <option value="bodega">Bodega</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="disponible">Disponible</option>
                  <option value="reservado">Reservado</option>
                  <option value="no_disponible">No disponible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <input 
                  type="text" 
                  name="sector" 
                  value={form.sector} 
                  onChange={handleChange}
                  placeholder="Ej: Rionegro"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subsector</label>
                <input 
                  type="text" 
                  name="subsector" 
                  value={form.subsector} 
                  onChange={handleChange}
                  placeholder="Ej: Llanogrande"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                <input 
                  type="number" 
                  name="bedrooms" 
                  value={form.bedrooms} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                <input 
                  type="number" 
                  name="bathrooms" 
                  value={form.bathrooms} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área (m²)</label>
                <input 
                  type="number" 
                  name="area" 
                  value={form.area} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input 
                  type="text" 
                  name="address" 
                  value={form.address} 
                  onChange={handleChange}
                  placeholder="Dirección completa"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent" 
                />
              </div>
            </div>

            {/* Instagram URL - Nuevo campo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Instagram (galería de fotos)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </span>
                <input
                  type="url"
                  name="instagram_url"
                  value={form.instagram_url}
                  onChange={handleChange}
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pega el enlace de Instagram donde están las fotos adicionales de esta propiedad
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}