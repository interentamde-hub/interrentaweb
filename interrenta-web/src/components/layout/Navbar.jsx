import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronRight, KeyRound, MessageCircle, Users } from 'lucide-react'
import logo from '../../assets/LogointerrentaTransparente.png'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '../ui/BrandIcons'
import { EMAIL, FACEBOOK_URL, INSTAGRAM_URL, whatsappUrl } from '../../lib/contact'

// `section` = ancla dentro de la home; `to` = página propia.
const NAV_ITEMS = [
  { section: 'propiedades', label: 'Propiedades', hint: 'Arriendo y venta', icon: Building2 },
  { section: 'servicios', label: 'Servicios', hint: 'Qué hacemos por ti', icon: KeyRound },
  { to: '/nosotros', label: 'Nosotros', hint: 'Redes y aliados', icon: Users },
  { section: 'contacto', label: 'Contacto', hint: 'Hablemos', icon: MessageCircle },
]

const SOCIALS = [
  { label: 'WhatsApp', url: whatsappUrl(), Icon: WhatsAppIcon },
  { label: 'Instagram', url: INSTAGRAM_URL, Icon: InstagramIcon },
  { label: 'Facebook', url: FACEBOOK_URL, Icon: FacebookIcon },
]

const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Inter', sans-serif"

/**
 * En la home las secciones son anclas (#id) que Lenis desliza. Desde cualquier
 * otra ruta hay que volver a "/" con el hash; Home lo aplica al montar.
 */
function NavLink({ item, onHome, className, children, onNavigate }) {
  if (item.to) {
    return <Link to={item.to} className={className} onClick={onNavigate} data-cursor="hover">{children}</Link>
  }
  if (onHome) {
    return <a href={`#${item.section}`} className={className} onClick={onNavigate} data-cursor="hover">{children}</a>
  }
  return <Link to={`/#${item.section}`} className={className} onClick={onNavigate} data-cursor="hover">{children}</Link>
}

function SocialRow({ size = 'w-11 h-11' }) {
  return (
    <div className="flex items-center gap-2.5">
      {SOCIALS.map(({ label, url, Icon }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          data-cursor="hover"
          className={`${size} flex items-center justify-center rounded-full border border-[#ecb337]/25 text-[#b8bcc8] transition-colors hover:border-[#ecb337] hover:bg-[#ecb337] hover:text-[#161616]`}
        >
          <Icon className="w-[18px] h-[18px]" />
        </a>
      ))}
    </div>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const close = () => setMenuOpen(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e) => {
      if (!e.target.closest('.nav-menu') && !e.target.closest('.nav-toggle')) setMenuOpen(false)
    }
    const handleKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  const isActive = (item) => item.to === pathname

  const toggleIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {menuOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h9" />
      )}
    </svg>
  )

  return (
    <>
      {/* ── MÓVIL: barra superior + panel desplegable ─────────────────────── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 lg:hidden transition-all duration-500"
        style={{
          padding: '0.75rem 0',
          backgroundColor: scrolled || menuOpen ? 'rgba(22, 22, 22, 0.97)' : 'rgba(22, 22, 22, 0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        <div className="px-4">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={close}>
              <img src={logo} alt="InterRenta" className="h-8 w-auto object-contain" />
            </Link>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              className="nav-toggle p-2 rounded-xl"
              style={{ backgroundColor: 'rgba(236, 179, 55, 0.1)', color: '#ecb337' }}
            >
              {toggleIcon}
            </motion.button>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="nav-menu mt-3 overflow-hidden"
              >
                <div className="rounded-2xl border border-[#ecb337]/15 bg-[#1c1c1c]/95 p-2">
                  {NAV_ITEMS.map((item, i) => {
                    const Icon = item.icon
                    const active = isActive(item)
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.06 }}
                      >
                        <NavLink
                          item={item}
                          onHome={onHome}
                          onNavigate={close}
                          className={`flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors active:bg-[#ecb337]/10 ${active ? 'bg-[#ecb337]/10' : ''}`}
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[#ecb337] text-[#161616]' : 'bg-[#ecb337]/10 text-[#ecb337]'}`}>
                            <Icon size={19} strokeWidth={1.8} />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-[15px] font-medium text-[#e2e2e2]" style={{ fontFamily: SANS }}>{item.label}</span>
                            <span className="block text-xs text-[#9aa0ad]" style={{ fontFamily: SANS }}>{item.hint}</span>
                          </span>
                          <ChevronRight size={18} className="text-[#6b7280]" />
                        </NavLink>
                      </motion.div>
                    )
                  })}

                  <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#ecb337]/10 px-3 pt-4 pb-2">
                    <SocialRow size="w-10 h-10" />
                    <a
                      href={whatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-[#ecb337] px-4 py-2.5 text-[13px] font-semibold text-[#161616]"
                      style={{ fontFamily: SANS }}
                    >
                      Escríbenos
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ── ESCRITORIO: botón flotante ────────────────────────────────────── */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
        data-cursor="hover"
        className="nav-toggle hidden lg:flex fixed top-6 right-6 z-50 w-14 h-14 rounded-2xl items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: menuOpen ? '#ecb337' : 'rgba(22, 22, 22, 0.95)',
          color: menuOpen ? '#161616' : '#ecb337',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(236, 179, 55, 0.3)',
        }}
      >
        <motion.div animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
          {toggleIcon}
        </motion.div>
      </motion.button>

      {/* ── ESCRITORIO: panel lateral ─────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden lg:block fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(4px)' }}
              onClick={close}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="nav-menu hidden lg:flex fixed top-0 right-0 h-full w-[400px] z-40 flex-col"
              style={{
                background: 'linear-gradient(180deg, #181818 0%, #121212 100%)',
                borderLeft: '1px solid rgba(236, 179, 55, 0.18)',
              }}
            >
              <div className="px-10 pt-9 pb-8">
                <Link to="/" onClick={close}>
                  <img src={logo} alt="InterRenta" className="h-14 w-auto object-contain" />
                </Link>
              </div>

              <nav className="flex-1 px-6">
                <p className="px-4 pb-3 text-[11px] uppercase tracking-[0.28em] text-[#6b7280]" style={{ fontFamily: SANS }}>
                  Menú
                </p>
                {NAV_ITEMS.map((item, i) => {
                  const active = isActive(item)
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.07 }}
                    >
                      <NavLink
                        item={item}
                        onHome={onHome}
                        onNavigate={close}
                        className="group flex items-center gap-5 border-b border-[#ecb337]/10 px-4 py-5"
                      >
                        <span className={`w-6 text-xs tabular-nums ${active ? 'text-[#ecb337]' : 'text-[#6b7280] group-hover:text-[#ecb337]'} transition-colors`} style={{ fontFamily: SANS }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1 transition-transform duration-300 group-hover:translate-x-1">
                          <span
                            className={`block text-[1.85rem] leading-none transition-colors ${active ? 'text-[#ecb337]' : 'text-[#e2e2e2] group-hover:text-[#ecb337]'}`}
                            style={{ fontFamily: SERIF, fontWeight: 400 }}
                          >
                            {item.label}
                          </span>
                          <span className="mt-1.5 block text-[13px] text-[#9aa0ad]" style={{ fontFamily: SANS }}>
                            {item.hint}
                          </span>
                        </span>
                        <ArrowUpRight
                          size={20}
                          className={`transition-all duration-300 ${active ? 'text-[#ecb337] opacity-100' : 'text-[#ecb337] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}
                        />
                      </NavLink>
                    </motion.div>
                  )
                })}
              </nav>

              <div className="px-10 pb-9 pt-6">
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="hover"
                  className="flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#ecb337] text-[15px] font-semibold text-[#161616] transition-colors hover:bg-[#f5d170]"
                  style={{ fontFamily: SANS }}
                >
                  <WhatsAppIcon className="w-[18px] h-[18px]" />
                  Escríbenos por WhatsApp
                </a>
                <div className="mt-6 flex flex-col items-center gap-4">
                  <SocialRow />
                  <a href={`mailto:${EMAIL}`} className="text-xs text-[#6b7280] transition-colors hover:text-[#ecb337]" style={{ fontFamily: SANS }}>
                    {EMAIL}
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
