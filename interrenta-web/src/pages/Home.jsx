import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { getAllProperties } from '../services/property.service'
import Navbar from '../components/layout/Navbar'
import aboutImage from '../assets/familia.png'

// Componente de sección animada
const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Tarjeta de propiedad mejorada
const PropertyCard = ({ property, index, onViewDetails }) => {
  const statusConfig = {
    disponible: { color: 'bg-emerald-500', label: 'Disponible', glow: 'shadow-emerald-500/30' },
    reservado: { color: 'bg-amber-500', label: 'Reservado', glow: 'shadow-amber-500/30' },
    no_disponible: { color: 'bg-red-500', label: 'No disponible', glow: 'shadow-red-500/30' }
  }

  const status = statusConfig[property.status] || statusConfig.disponible

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="w-[320px] md:w-[360px] flex-shrink-0 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group"
      style={{ backgroundColor: '#262525', scrollSnapAlign: 'start' }}
    >
      {/* Imagen */}
      <div className="relative h-56 overflow-hidden">
        {property.cover_url ? (
          <img
            src={property.cover_url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #262525, #161616)' }}>
            <svg className="w-16 h-16" style={{ color: '#6e3c1b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge de estado */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass ${status.glow} shadow-lg`}>
            <span className={`w-2 h-2 rounded-full ${status.color} animate-pulse`} />
            <span className="text-xs font-semibold text-gray-800">{status.label}</span>
          </div>
        </div>

        {/* Badge tipo contrato */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: '#ecb337', color: '#161616' }}>
            {property.contract_type === 'arriendo' ? '🏠 Arriendo' : '🏷️ Venta'}
          </span>
        </div>

        {/* Botón flotante */}
        <motion.button
          onClick={() => onViewDetails(property)}
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.05 }}
          className="absolute bottom-4 right-4 z-10 px-4 py-2 rounded-full font-semibold text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ backgroundColor: '#ecb337', color: '#161616' }}
        >
          Ver detalles →
        </motion.button>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <div className="mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#d7af4d' }}>
            {property.property_type}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-[#d7af4d] transition-colors" style={{ color: '#b3b3b3' }}>
          {property.title}
        </h3>
        
        {property.address && (
          <p className="text-sm mb-4 flex items-center gap-1" style={{ color: '#9ca3af' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.sector}{property.subsector ? `, ${property.subsector}` : ''}
          </p>
        )}

        {/* Características */}
        <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#9ca3af' }}>
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <span className="text-lg">🛏️</span>
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <span className="text-lg">🚿</span>
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center gap-1">
              <span className="text-lg">📐</span>
              <span>{property.area} m²</span>
            </div>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-end justify-between pt-4" style={{ borderTop: '1px solid #3a3a3a' }}>
          <div>
            <span className="text-3xl font-bold" style={{ color: '#ecb337' }}>
              ${property.price?.toLocaleString()}
            </span>
            {property.contract_type === 'arriendo' && (
              <span className="text-sm ml-1" style={{ color: '#9ca3af' }}>/mes</span>
            )}
          </div>
          <button
            onClick={() => onViewDetails(property)}
            className="p-3 rounded-full transition-all duration-300"
            style={{ backgroundColor: '#3a3a3a', color: '#ecb337' }}
            onMouseEnter={e => { e.target.style.backgroundColor = '#ecb337'; e.target.style.color = '#161616' }}
            onMouseLeave={e => { e.target.style.backgroundColor = '#3a3a3a'; e.target.style.color = '#ecb337' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Modal de detalles de propiedad
const PropertyDetailModal = ({ property, onClose }) => {
  if (!property) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ backgroundColor: '#262525' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Imagen */}
        <div className="relative h-64 md:h-80">
          {property.cover_url ? (
            <img src={property.cover_url} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #262525, #161616)' }}>
              <span className="text-8xl">🏠</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(22, 22, 22, 0.9)', color: '#ecb337' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(236, 179, 55, 0.2)', color: '#ecb337' }}>
              {property.property_type}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#3a3a3a', color: '#b3b3b3' }}>
              {property.contract_type === 'arriendo' ? 'En arriendo' : 'En venta'}
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: '#b3b3b3' }}>{property.title}</h2>
          
          {property.address && (
            <p className="mb-4 flex items-center gap-2" style={{ color: '#9ca3af' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {property.address}
            </p>
          )}

          <div className="text-4xl font-bold mb-6" style={{ color: '#ecb337' }}>
            ${property.price?.toLocaleString()}
            {property.contract_type === 'arriendo' && <span className="text-lg font-normal" style={{ color: '#9ca3af' }}>/mes</span>}
          </div>

          {/* Características */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {property.bedrooms && (
              <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: '#161616' }}>
                <div className="text-2xl mb-1">🛏️</div>
                <div className="font-bold" style={{ color: '#b3b3b3' }}>{property.bedrooms}</div>
                <div className="text-xs" style={{ color: '#9ca3af' }}>Habitaciones</div>
              </div>
            )}
            {property.bathrooms && (
              <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: '#161616' }}>
                <div className="text-2xl mb-1">🚿</div>
                <div className="font-bold" style={{ color: '#b3b3b3' }}>{property.bathrooms}</div>
                <div className="text-xs" style={{ color: '#9ca3af' }}>Baños</div>
              </div>
            )}
            {property.area && (
              <div className="text-center p-4 rounded-2xl" style={{ backgroundColor: '#161616' }}>
                <div className="text-2xl mb-1">📐</div>
                <div className="font-bold" style={{ color: '#b3b3b3' }}>{property.area}</div>
                <div className="text-xs" style={{ color: '#9ca3af' }}>m²</div>
              </div>
            )}
          </div>

          {property.description && (
            <div className="mb-6">
              <h3 className="font-bold mb-2" style={{ color: '#d7af4d' }}>Descripción</h3>
              <p className="leading-relaxed" style={{ color: '#9ca3af' }}>{property.description}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4">
            <a
              href={`https://wa.me/573025749331?text=Hola, me interesa la propiedad: ${property.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-green-500 text-white rounded-2xl font-semibold text-center hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>💬</span> Contactar por WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Home() {
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSearchTerm, setActiveSearchTerm] = useState('')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const carouselRef = useRef(null)
  const heroRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    loadProperties()
  }, [])

  // Scroll automático a propiedades
  const scrollToProperties = useCallback(() => {
    const section = document.getElementById('propiedades')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Función para ejecutar búsqueda
  const handleSearch = useCallback(() => {
    setActiveSearchTerm(searchTerm)
    setTimeout(scrollToProperties, 100)
  }, [searchTerm, scrollToProperties])

  useEffect(() => {
    let result = properties

    if (filter !== 'all') {
      result = result.filter(p => p.contract_type === filter)
    }

    if (activeSearchTerm) {
      const term = activeSearchTerm.toLowerCase()
      result = result.filter(p =>
        p.title?.toLowerCase().includes(term) ||
        p.sector?.toLowerCase().includes(term) ||
        p.subsector?.toLowerCase().includes(term) ||
        p.property_type?.toLowerCase().includes(term) ||
        p.address?.toLowerCase().includes(term)
      )
    }

    setFilteredProperties(result)
  }, [properties, filter, activeSearchTerm])

  const loadProperties = async () => {
    const { data } = await getAllProperties()
    setProperties(data || [])
    setFilteredProperties(data || [])
    setLoading(false)
  }

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 400
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleViewDetails = useCallback((property) => {
    setSelectedProperty(property)
    document.body.style.overflow = 'hidden'
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedProperty(null)
    document.body.style.overflow = ''
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#161616' }}>
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background animado */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #161616 0%, #262525 50%, #1a1a1a 100%)' }}>
          <div className="absolute inset-0 opacity-30">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[100px]"
              style={{ backgroundColor: '#ecb337' }}
            />
            <motion.div
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [0, -90, 0]
              }}
              transition={{ duration: 25, repeat: Infinity }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[100px]"
              style={{ backgroundColor: '#d7af4d' }}
            />
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
              }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full filter blur-[100px]"
              style={{ backgroundColor: '#6e3c1b' }}
            />
          </div>
        </div>

        {/* Contenido Hero */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-dark text-sm font-medium" style={{ color: '#ecb337', borderColor: 'rgba(236, 179, 55, 0.3)', borderWidth: '1px' }}>
              <span className="animate-pulse">✨</span>
              Encuentra tu hogar ideal
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-tight"
            style={{ color: '#b3b3b3' }}
          >
            Vive donde
            <span className="block gradient-text">
              siempre soñaste
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
            style={{ color: '#9ca3af' }}
          >
            Descubre propiedades exclusivas con el mejor servicio inmobiliario de la región
          </motion.p>

          {/* Barra de búsqueda */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por ubicación, tipo de propiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-8 py-5 rounded-2xl text-lg focus:outline-none transition-all"
                style={{ 
                  backgroundColor: 'rgba(38, 37, 37, 0.8)', 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(236, 179, 55, 0.2)',
                  color: '#b3b3b3'
                }}
              />
              <button 
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: '#ecb337', color: '#161616' }}
              >
                Buscar
              </button>
            </div>
          </motion.div>

          {/* Filtros rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex gap-3 justify-center flex-wrap"
          >
            {[
              { key: 'all', label: 'Todas' },
              { key: 'arriendo', label: 'Arriendo' },
              { key: 'venta', label: 'Venta' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className="px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: filter === item.key ? '#ecb337' : 'rgba(38, 37, 37, 0.8)',
                  color: filter === item.key ? '#161616' : '#b3b3b3',
                  border: filter === item.key ? 'none' : '1px solid rgba(236, 179, 55, 0.2)'
                }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full flex items-start justify-center p-2"
            style={{ border: '2px solid rgba(236, 179, 55, 0.5)' }}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#ecb337' }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: 'Transparencia', subtitle: 'En cada proceso', icon: '🤝' },
              { title: 'Conectamos', subtitle: 'Propietarios y personas', icon: '🏠' },
              { title: 'Acompañamiento', subtitle: 'Honesto y seguro', icon: '😊' },
              { title: 'Cobertura', subtitle: 'Oriente Antioqueño', icon: '📍' }
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="text-center p-6 md:p-8 rounded-3xl transition-all duration-300"
                  style={{ backgroundColor: '#262525' }}
                >
                  <div className="text-4xl md:text-5xl mb-4">{stat.icon}</div>
                  <div className="text-xl md:text-2xl font-bold mb-1" style={{ color: '#ecb337' }}>
                    {stat.title}
                  </div>
                  <div className="text-sm md:text-base" style={{ color: '#9ca3af' }}>{stat.subtitle}</div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Propiedades - Carrusel Horizontal */}
      <section id="propiedades" className="py-24" style={{ backgroundColor: '#161616' }}>
        {/* Header con max-w */}
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#b3b3b3' }}>
                  Propiedades <span style={{ color: '#ecb337' }}>destacadas</span>
                </h2>
                <p style={{ color: '#9ca3af' }}>
                  {filteredProperties.length} propiedades encontradas
                </p>
              </div>
              
              {/* Controles del carrusel */}
              <div className="flex gap-3">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="p-4 rounded-full transition-all hover:scale-110"
                  style={{ backgroundColor: '#262525', color: '#ecb337' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="p-4 rounded-full transition-all hover:scale-110"
                  style={{ backgroundColor: '#ecb337', color: '#161616' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Carrusel - fuera del max-w para scroll completo */}
        <div className="relative">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 rounded-full"
                style={{ borderColor: '#262525', borderTopColor: '#ecb337' }}
              />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-xl mb-4" style={{ color: '#9ca3af' }}>
                No se encontraron propiedades
              </p>
              <button
                onClick={() => { setFilter('all'); setSearchTerm(''); }}
                className="px-6 py-3 rounded-full font-semibold transition-all"
                style={{ backgroundColor: '#ecb337', color: '#161616' }}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              {/* Gradiente izquierdo */}
              <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 z-10 pointer-events-none" 
                   style={{ background: 'linear-gradient(to right, #161616, transparent)' }} />
              
              {/* Carrusel horizontal */}
              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto pb-6 px-6 md:px-12 lg:px-24"
                style={{
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {filteredProperties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Gradiente derecho */}
              <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 z-10 pointer-events-none"
                   style={{ background: 'linear-gradient(to left, #161616, transparent)' }} />
            </>
          )}
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-24 px-6" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#b3b3b3' }}>
                Soy <span style={{ color: '#ecb337' }}>propietario</span>
              </h2>
              <p className="max-w-2xl mx-auto" style={{ color: '#9ca3af' }}>
                Ofrecemos soluciones integrales para todas tus necesidades inmobiliarias
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: '🏠',
                title: 'Arriendos',
                description: 'Ponga su propiedad en arriendo con el respaldo de un equipo experto. Nos encargamos de la gestión integral para que usted obtenga tranquilidad, rentabilidad y confianza en cada proceso.',
                whatsappMsg: 'Hola, estoy interesado en poner una propiedad en renta. ¿Podrían darme más información?'
              },
              {
                icon: '🏷️',
                title: 'Ventas',
                description: 'Venda su propiedad de manera segura y efectiva con nuestro acompañamiento profesional. Gestionamos todo el proceso para lograr una venta confiable, ágil y al mejor valor de mercado.',
                whatsappMsg: 'Hola, estoy interesado en poner una propiedad en venta. ¿Podrían darme más información?'
              }
            ].map((service, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <motion.a
                  href={`https://wa.me/573025749331?text=${encodeURIComponent(service.whatsappMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -10 }}
                  className="block p-8 rounded-3xl transition-all duration-500 group cursor-pointer"
                  style={{ backgroundColor: '#262525' }}
                >
                  <div className="text-5xl mb-6">{service.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-[#ecb337] transition-colors" style={{ color: '#b3b3b3' }}>
                    {service.title}
                  </h3>
                  <p className="mb-6 leading-relaxed" style={{ color: '#9ca3af' }}>
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-2 font-semibold group-hover:gap-4 transition-all" style={{ color: '#ecb337' }}>
                    Contactar por WhatsApp 
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </motion.a>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="py-24 px-6" style={{ backgroundColor: '#161616' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <AnimatedSection>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#b3b3b3' }}>
                  Más de <span style={{ color: '#ecb337' }}>10 años</span> de experiencia
                </h2>
                <p className="text-lg mb-8 leading-relaxed" style={{ color: '#9ca3af' }}>
                  En InterRenta nos especializamos en encontrar la propiedad perfecta 
                  para ti. Con un equipo de profesionales comprometidos y una amplia 
                  cartera de inmuebles exclusivos.
                </p>

                <div className="space-y-4">
                  {[
                    'Asesoría personalizada',
                    'Propiedades 100% verificadas',
                    'Proceso transparente y seguro',
                    'Soporte legal integral'
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ecb337' }}>
                        <svg className="w-5 h-5" style={{ color: '#161616' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span style={{ color: '#b3b3b3' }}>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="aspect-square rounded-3xl overflow-hidden relative"
                  style={{ background: 'linear-gradient(135deg, rgba(236,179,55,0.2), rgba(110,60,27,0.2))' }}
                >
                  <img 
                    src={aboutImage} 
                    alt="InterRenta - Experiencia inmobiliaria"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </AnimatedSection>
          </div>

          {/* Misión, Visión y Valores */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Misión */}
            <AnimatedSection delay={0.1}>
              <motion.div
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl h-full"
                style={{ backgroundColor: '#262525', border: '1px solid rgba(236, 179, 55, 0.2)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(236, 179, 55, 0.1)' }}>
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#ecb337' }}>Misión</h3>
                <p className="leading-relaxed" style={{ color: '#9ca3af' }}>
                  Brindar soluciones integrales de renta y gestión, ofreciendo a nuestros clientes un servicio confiable, ágil y transparente, enfocado en satisfacer sus necesidades y generar relaciones duraderas basadas en la confianza y el compromiso.
                </p>
              </motion.div>
            </AnimatedSection>

            {/* Visión */}
            <AnimatedSection delay={0.2}>
              <motion.div
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl h-full"
                style={{ backgroundColor: '#262525', border: '1px solid rgba(236, 179, 55, 0.2)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(236, 179, 55, 0.1)' }}>
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#ecb337' }}>Visión</h3>
                <p className="leading-relaxed" style={{ color: '#9ca3af' }}>
                  Ser una empresa líder y reconocida en el mercado por la excelencia en nuestros servicios de renta y gestión, destacándonos por la innovación, la calidad humana y el aporte al crecimiento económico y social de nuestros clientes y aliados.
                </p>
              </motion.div>
            </AnimatedSection>

            {/* Valores */}
            <AnimatedSection delay={0.3}>
              <motion.div
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl h-full"
                style={{ backgroundColor: '#262525', border: '1px solid rgba(236, 179, 55, 0.2)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(236, 179, 55, 0.1)' }}>
                  <span className="text-3xl">💎</span>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#ecb337' }}>Valores</h3>
                <ul className="space-y-2" style={{ color: '#9ca3af' }}>
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#ecb337' }}>•</span>
                    <span><strong style={{ color: '#b3b3b3' }}>Responsabilidad:</strong> Cumplimos con nuestros compromisos de manera ética y oportuna.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#ecb337' }}>•</span>
                    <span><strong style={{ color: '#b3b3b3' }}>Transparencia:</strong> Actuamos con claridad, honestidad y respeto en cada proceso.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#ecb337' }}>•</span>
                    <span><strong style={{ color: '#b3b3b3' }}>Compromiso:</strong> Trabajamos con dedicación para lograr la satisfacción de nuestros clientes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#ecb337' }}>•</span>
                    <span><strong style={{ color: '#b3b3b3' }}>Confianza:</strong> Construimos relaciones sólidas basadas en la credibilidad y el respeto mutuo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#ecb337' }}>•</span>
                    <span><strong style={{ color: '#b3b3b3' }}>Calidad:</strong> Buscamos la mejora continua en nuestros servicios y procesos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span style={{ color: '#ecb337' }}>•</span>
                    <span><strong style={{ color: '#b3b3b3' }}>Innovación:</strong> Nos adaptamos al cambio para ofrecer soluciones eficientes y actuales.</span>
                  </li>
                </ul>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contacto" className="py-24 px-6" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-[3rem] p-12 md:p-20 text-center" style={{ background: 'linear-gradient(135deg, #161616, #262525)' }}>
              {/* Efectos de fondo */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute top-0 left-1/4 w-64 h-64 rounded-full filter blur-[80px]"
                  style={{ backgroundColor: '#ecb337' }}
                />
                <motion.div
                  animate={{ scale: [1.3, 1, 1.3], x: [0, -50, 0] }}
                  transition={{ duration: 12, repeat: Infinity }}
                  className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full filter blur-[80px]"
                  style={{ backgroundColor: '#6e3c1b' }}
                />
              </div>

              <div className="relative z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                  style={{ color: '#b3b3b3' }}
                >
                  ¿Listo para encontrar
                  <span className="block gradient-text">
                    tu próximo hogar?
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                  className="text-xl mb-10 max-w-2xl mx-auto"
                  style={{ color: '#9ca3af' }}
                >
                  Nuestro equipo de expertos está listo para ayudarte
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex justify-center"
                >
                  <a
                    href="https://wa.me/573025749331?text=Hola,%20estoy%20interesado%20en%20sus%20servicios%20inmobiliarios.%20¿Podrían%20ayudarme?"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-10 py-5 bg-green-500 text-white rounded-2xl font-semibold hover:bg-green-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30 flex items-center justify-center gap-3 text-lg"
                  >
                    <span className="text-2xl">💬</span> Escríbenos por WhatsApp
                  </a>
                </motion.div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold mb-4" style={{ color: '#ecb337' }}>InterRenta</h3>
              <p className="mb-6 max-w-md leading-relaxed" style={{ color: '#9ca3af' }}>
                Tu socio de confianza en bienes raíces. Más de 10 años conectando 
                personas con su hogar ideal en las mejores ubicaciones.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: '📘', label: 'Facebook' },
                  { icon: '📸', label: 'Instagram' },
                  { icon: '🐦', label: 'Twitter' },
                  { icon: '💼', label: 'LinkedIn' }
                ].map((social, i) => (
                  <button
                    key={i}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: '#262525', color: '#ecb337' }}
                    title={social.label}
                  >
                    <span className="text-xl">{social.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg" style={{ color: '#d7af4d' }}>Servicios</h4>
              <ul className="space-y-3" style={{ color: '#9ca3af' }}>
                <li><a href="#servicios" className="hover:text-[#ecb337] transition-colors">Arriendo</a></li>
                <li><a href="#servicios" className="hover:text-[#ecb337] transition-colors">Venta</a></li>
                <li><a href="#nosotros" className="hover:text-[#ecb337] transition-colors">Asesoría</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg" style={{ color: '#d7af4d' }}>Contacto</h4>
              <ul className="space-y-3" style={{ color: '#9ca3af' }}>
                <li className="flex items-center gap-2">
                  <span>📧</span> interentamde@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span> +57 302 574 9331
                </li>
                <li className="flex items-center gap-2">
                  <span>📍</span> Medellín, Colombia
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid #262525' }}>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              © 2025 InterRenta. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm" style={{ color: '#6b7280' }}>
              <a href="#" className="hover:text-[#ecb337] transition-colors">Términos</a>
              <a href="#" className="hover:text-[#ecb337] transition-colors">Privacidad</a>
              <a href="#" className="hover:text-[#ecb337] transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de detalles */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}