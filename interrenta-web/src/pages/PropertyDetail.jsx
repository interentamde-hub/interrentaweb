import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPropertyByCode } from '../services/property.service'
import Navbar from '../components/layout/Navbar'

const statusConfig = {
  disponible: { color: 'bg-emerald-500', label: 'Disponible', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50' },
  reservado: { color: 'bg-amber-500', label: 'Reservado', textColor: 'text-amber-600', bgLight: 'bg-amber-50' },
  no_disponible: { color: 'bg-red-500', label: 'No disponible', textColor: 'text-red-600', bgLight: 'bg-red-50' }
}

export default function PropertyDetail() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProperty()
  }, [code])

  const loadProperty = async () => {
    try {
      const { data, error: fetchError } = await getPropertyByCode(code)
      if (fetchError) throw fetchError
      if (!data) throw new Error('Propiedad no encontrada')
      setProperty(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#161616' }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 rounded-full"
            style={{ borderColor: '#262525', borderTopColor: '#ecb337' }}
          />
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#161616' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <span className="text-6xl mb-4">🏠</span>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#b3b3b3' }}>
            Propiedad no encontrada
          </h1>
          <p className="mb-6" style={{ color: '#9ca3af' }}>
            {error || 'El código de propiedad no existe'}
          </p>
          <Link 
            to="/"
            className="px-6 py-3 rounded-xl font-semibold transition-all"
            style={{ backgroundColor: '#ecb337', color: '#161616' }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const status = statusConfig[property.status] || statusConfig.disponible

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#161616' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 px-6">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-sm" style={{ color: '#9ca3af' }}>
            <Link to="/" className="hover:text-[#ecb337] transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/#propiedades" className="hover:text-[#ecb337] transition-colors">Propiedades</Link>
            <span>/</span>
            <span style={{ color: '#ecb337' }}>{property.code}</span>
          </nav>
        </div>
      </div>

      {/* Hero de la propiedad */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* Imagen principal */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]" style={{ backgroundColor: '#262525' }}>
              {property.cover_url ? (
                <img
                  src={property.cover_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">🏠</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${status.bgLight} ${status.textColor}`}>
                  <span className={`inline-block w-2 h-2 rounded-full ${status.color} mr-2`}></span>
                  {status.label}
                </span>
              </div>

              <div className="absolute top-4 right-4">
                <span 
                  className="px-4 py-2 rounded-full text-sm font-bold uppercase"
                  style={{ backgroundColor: '#ecb337', color: '#161616' }}
                >
                  {property.contract_type === 'arriendo' ? '🏠 Arriendo' : '🏷️ Venta'}
                </span>
              </div>

              {/* Botón Ver más fotos - Instagram */}
              {property.instagram_url && (
                <a
                  href={property.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105"
                  style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#161616' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Ver más fotos
                </a>
              )}
            </div>

            {/* Info principal */}
            <div className="flex flex-col">
              {/* Código */}
              <span 
                className="inline-block w-fit px-3 py-1 rounded-lg text-sm font-semibold mb-4"
                style={{ backgroundColor: 'rgba(236, 179, 55, 0.2)', color: '#ecb337' }}
              >
                {property.code}
              </span>

              {/* Título */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#b3b3b3' }}>
                {property.title}
              </h1>

              {/* Ubicación */}
              {(property.sector || property.address) && (
                <p className="flex items-center gap-2 mb-6" style={{ color: '#9ca3af' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.address || `${property.sector}${property.subsector ? `, ${property.subsector}` : ''}`}
                </p>
              )}

              {/* Precio */}
              <div className="mb-8">
                <span className="text-4xl md:text-5xl font-bold" style={{ color: '#ecb337' }}>
                  ${property.price?.toLocaleString()}
                </span>
                {property.contract_type === 'arriendo' && (
                  <span className="text-lg ml-2" style={{ color: '#9ca3af' }}>/mes</span>
                )}
              </div>

              {/* Características */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {property.bedrooms && (
                  <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: '#262525' }}>
                    <div className="text-2xl mb-1">🛏️</div>
                    <div className="text-xl font-bold" style={{ color: '#b3b3b3' }}>{property.bedrooms}</div>
                    <div className="text-xs" style={{ color: '#9ca3af' }}>Habitaciones</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: '#262525' }}>
                    <div className="text-2xl mb-1">🚿</div>
                    <div className="text-xl font-bold" style={{ color: '#b3b3b3' }}>{property.bathrooms}</div>
                    <div className="text-xs" style={{ color: '#9ca3af' }}>Baños</div>
                  </div>
                )}
                {property.area && (
                  <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: '#262525' }}>
                    <div className="text-2xl mb-1">📐</div>
                    <div className="text-xl font-bold" style={{ color: '#b3b3b3' }}>{property.area}</div>
                    <div className="text-xs" style={{ color: '#9ca3af' }}>m²</div>
                  </div>
                )}
              </div>

              {/* Tipo de propiedad */}
              <div className="mb-8">
                <span 
                  className="inline-block px-4 py-2 rounded-xl text-sm font-medium capitalize"
                  style={{ backgroundColor: '#262525', color: '#b3b3b3' }}
                >
                  {property.property_type}
                </span>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <a
                  href={`https://wa.me/573025749331?text=Hola, me interesa la propiedad ${property.code}: ${property.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-semibold text-center hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span>💬</span> Contactar por WhatsApp
                </a>
                
                {property.instagram_url && (
                  <a
                    href={property.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-4 rounded-2xl font-semibold text-center transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#262525', color: '#ecb337' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    </svg>
                    Ver más fotos
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Descripción */}
      {property.description && (
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl"
              style={{ backgroundColor: '#262525' }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#ecb337' }}>
                Descripción
              </h2>
              <p className="leading-relaxed whitespace-pre-line" style={{ color: '#9ca3af' }}>
                {property.description}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#b3b3b3' }}>
            ¿Te interesa esta propiedad?
          </h2>
          <p className="mb-8" style={{ color: '#9ca3af' }}>
            Contáctanos y te ayudamos con el proceso
          </p>
          <a
            href={`https://wa.me/573025749331?text=Hola, me interesa la propiedad ${property.code}: ${property.title}. ¿Podemos agendar una visita?`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-2xl font-semibold hover:bg-green-600 transition-colors"
          >
            <span>💬</span> Agendar visita por WhatsApp
          </a>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid #262525' }}>
        <div className="max-w-6xl mx-auto text-center">
          <Link to="/" className="font-bold text-xl" style={{ color: '#ecb337' }}>
            InterRenta
          </Link>
          <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
            © 2025 InterRenta. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}