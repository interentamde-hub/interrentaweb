import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/LogointerrentaTransparente.png'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.nav-menu') && !e.target.closest('.nav-toggle')) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuOpen])

  const navLinks = [
    { href: '#propiedades', label: 'Propiedades', icon: '🏠' },
    { href: '#servicios', label: 'Servicios', icon: '⚡' },
    { href: '#nosotros', label: 'Nosotros', icon: '👥' },
    { href: '#contacto', label: 'Contacto', icon: '📞' }
  ]

  return (
    <>
      {/* ========== MOBILE NAVBAR (visible en pantallas pequeñas) ========== */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 lg:hidden transition-all duration-500"
        style={{
          padding: '0.75rem 0',
          backgroundColor: scrolled ? 'rgba(22, 22, 22, 0.95)' : 'rgba(22, 22, 22, 0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : 'none'
        }}
      >
        <div className="px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.a
              href="/"
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src={logo} 
                alt="InterRenta" 
                className="h-8 w-auto object-contain"
              />
            </motion.a>

            {/* Botón menú mobile */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="nav-toggle p-2 rounded-xl"
              style={{ backgroundColor: 'rgba(236, 179, 55, 0.1)', color: '#ecb337' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>

          {/* Menú desplegable mobile */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="nav-menu mt-4 overflow-hidden"
              >
                <div 
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: 'rgba(38, 37, 37, 0.95)' }}
                >
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={i}
                      href={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors"
                      style={{ color: '#b3b3b3' }}
                      onTouchStart={e => { e.target.style.backgroundColor = 'rgba(236, 179, 55, 0.1)'; e.target.style.color = '#ecb337' }}
                      onTouchEnd={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#b3b3b3' }}
                    >
                      <span>{link.icon}</span>
                      {link.label}
                    </motion.a>
                  ))}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                    onClick={() => {
                      navigate('/admin-login')
                      setMenuOpen(false)
                    }}
                    className="w-full mt-3 px-4 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#ecb337', color: '#161616' }}
                  >
                    <span>🔐</span> Mi portal
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ========== DESKTOP: Botón flotante + Menú lateral (oculto por defecto) ========== */}
      
      {/* Botón flotante para abrir menú - solo desktop */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        onClick={() => setMenuOpen(!menuOpen)}
        className="nav-toggle hidden lg:flex fixed top-6 right-6 z-50 w-14 h-14 rounded-2xl items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        style={{ 
          backgroundColor: menuOpen ? '#ecb337' : 'rgba(22, 22, 22, 0.95)',
          color: menuOpen ? '#161616' : '#ecb337',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(236, 179, 55, 0.3)'
        }}
      >
        <motion.div
          animate={{ rotate: menuOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          )}
        </motion.div>
      </motion.button>

      {/* Menú lateral desktop */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden lg:block fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Panel lateral */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="nav-menu hidden lg:flex fixed top-0 right-0 h-full w-80 z-40 flex-col"
              style={{ backgroundColor: '#161616', borderLeft: '1px solid rgba(236, 179, 55, 0.2)' }}
            >
              {/* Header del panel */}
              <div className="p-8 border-b" style={{ borderColor: 'rgba(236, 179, 55, 0.2)' }}>
                <img 
                  src={logo} 
                  alt="InterRenta" 
                  className="h-10 w-auto object-contain"
                />
              </div>

              {/* Links de navegación */}
              <div className="flex-1 p-6 space-y-2">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={i}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 rounded-xl font-medium transition-all group"
                    style={{ color: '#b3b3b3' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(236, 179, 55, 0.1)'; e.currentTarget.style.color = '#ecb337' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#b3b3b3' }}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="text-lg">{link.label}</span>
                    <svg className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                ))}
              </div>

              {/* Footer del panel */}
              <div className="p-6 border-t" style={{ borderColor: 'rgba(236, 179, 55, 0.2)' }}>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => {
                    navigate('/admin-login')
                    setMenuOpen(false)
                  }}
                  className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105"
                  style={{ backgroundColor: '#ecb337', color: '#161616' }}
                >
                  <span>🔐</span> Mi portal
                </motion.button>
                
                <p className="text-center text-sm mt-4" style={{ color: '#6b7280' }}>
                  © 2025 InterRenta
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}