import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { setLenis } from './lib/lenis'
import ProtectedRoute from './components/common/ProtectedRoute'
import Home from './pages/Home'
import WhatsAppFloat from './components/ui/WhatsAppFloat'
import CustomCursor from './components/ui/CustomCursor'
import BrandPreloader from './components/ui/BrandPreloader'
import RouteTransition from './components/ui/RouteTransition'
import logo from './assets/LogointerrentaTransparente.png'

// ── Code-splitting: estas rutas salen del bundle inicial y se cargan bajo
//    demanda (Home queda eager por ser la landing) ────────────────────────────
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))
const MunicipioPage = lazy(() => import('./pages/MunicipioPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AssistantWidget = lazy(() => import('./components/chat/AssistantWidget'))

// Fallback oscuro mientras carga el chunk de una ruta (evita flash blanco)
const RouteFallback = () => (
  <div className="min-h-screen" style={{ backgroundColor: '#161616' }} />
)

export default function App() {
  // ── Scroll suave (Lenis) solo en desktop; mobile usa scroll nativo ──────────
  useEffect(() => {
    const fine =
      window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 768;
    if (!fine) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.1, smoothWheel: true });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Anclas internas (#id) con scroll suave + compensación del navbar
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -80 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <>
    <BrandPreloader logoSrc={logo} />
    <RouteTransition logoSrc={logo} />
    <CustomCursor />
    <WhatsAppFloat />
    <Suspense fallback={null}>
      <AssistantWidget />
    </Suspense>
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
    </>
  )
}