/**
 * Home.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * CAMBIOS respecto al original:
 *   • Se agregó <CinematicHero> como primera sección (scrollytelling).
 *   • El Hero estático anterior fue reemplazado por el cinematográfico.
 *   • TODA la lógica de negocio (Supabase, filtros, búsqueda, carrusel)
 *     permanece IDÉNTICA. Cero cambios funcionales.
 *   • Google Fonts (Cormorant Garamond + Inter) se agregan aquí vía <link>
 *     inyectado en <head> una sola vez.
 *   • La barra de búsqueda y filtros se movió a la sección de propiedades
 *     para que sea accesible después del scrollytelling.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";

// Importaciones del proyecto (mantén tus rutas originales)
import { getAllProperties } from "../services/property.service";
import Navbar from "../components/layout/Navbar";
import PropertyCard from "../components/property/PropertyCard";
import CinematicHero from "../components/cinematic/CinematicHero";
import aboutImage from "../assets/familia.png";
import logoImage from "../assets/LogointerrentaTransparente.png";

// ── Fuentes premium (inyectadas una sola vez) ─────────────────────────────────
function injectFonts() {
  if (document.getElementById("ir-fonts")) return;
  const link = document.createElement("link");
  link.id = "ir-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400;500;600&display=swap";
  document.head.appendChild(link);
}

// ── Componente de sección animada (idéntico al original) ──────────────────────
const AnimatedSection = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
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
  );
};

export default function Home() {
  // ── Estado (100% idéntico al original) ──────────────────────────────────
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const carouselRef = useRef(null);

  // Inyectar fuentes
  useEffect(() => {
    injectFonts();
  }, []);

  // ── Carga de propiedades (idéntico al original) ──────────────────────────
  useEffect(() => {
    loadProperties();
  }, []);

  const scrollToProperties = useCallback(() => {
    const section = document.getElementById("propiedades");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSearch = useCallback(() => {
    setActiveSearchTerm(searchTerm);
    setTimeout(scrollToProperties, 100);
  }, [searchTerm, scrollToProperties]);

  useEffect(() => {
    let result = properties;
    if (filter !== "all") {
      result = result.filter((p) => p.contract_type === filter);
    }
    if (activeSearchTerm) {
      const term = activeSearchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(term) ||
          p.sector?.toLowerCase().includes(term) ||
          p.subsector?.toLowerCase().includes(term) ||
          p.property_type?.toLowerCase().includes(term) ||
          p.address?.toLowerCase().includes(term) ||
          p.code?.toLowerCase().includes(term),
      );
    }
    setFilteredProperties(result);
  }, [properties, filter, activeSearchTerm]);

  const loadProperties = async () => {
    const { data } = await getAllProperties();
    setProperties(data || []);
    setFilteredProperties(data || []);
    setLoading(false);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    // ✅ overflow: clip no crea scroll container, sticky funciona
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#161616", overflowX: "clip" }}
    >
      {/* Navbar flotante — siempre visible */}
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 1 — SCROLLYTELLING CINEMATOGRÁFICO
          137 frames (~11 600 px de scroll en total)
      ════════════════════════════════════════════════════════════════════ */}
      <CinematicHero logoSrc={logoImage} />

      {/* ═══════════════════════════════════════════════════════════════════
          REVEAL — Transición suave después del scrollytelling
      ════════════════════════════════════════════════════════════════════ */}
      <RevealDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 2 — PROPIEDADES (carrusel + búsqueda)
      ════════════════════════════════════════════════════════════════════ */}
      <section
        id="propiedades"
        className="py-16 sm:py-24 relative"
        style={{ backgroundColor: "#161616" }}
      >
        {/* Destellos decorativos */}
        <div
          className="absolute top-0 left-0 w-72 h-72 rounded-full filter blur-[150px] opacity-20 pointer-events-none"
          style={{ backgroundColor: "#ecb337" }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full filter blur-[150px] opacity-20 pointer-events-none"
          style={{ backgroundColor: "#0d4447" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-10 sm:mb-14">
              {/* Eyebrow */}
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-5"
                style={{
                  backgroundColor: "rgba(236, 179, 55, 0.1)",
                  color: "#ecb337",
                  border: "1px solid rgba(236, 179, 55, 0.3)",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: "0.72rem",
                }}
              >
                Catálogo de propiedades
              </span>

              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{
                  color: "#b3b3b3",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 300,
                  letterSpacing: "-0.01em",
                }}
              >
                Propiedades{" "}
                <span style={{ color: "#ecb337" }}>disponibles</span>
              </h2>
              <p
                className="max-w-2xl mx-auto mb-8"
                style={{ color: "#9ca3af", fontFamily: "'Inter', sans-serif" }}
              >
                Encuentra el espacio perfecto para ti y tu familia
              </p>

              {/* ── Barra de búsqueda ──────────────────────────────── */}
              <div className="max-w-2xl mx-auto mb-6">
                <div className="relative flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Buscar por ubicación, tipo, código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full px-6 py-4 sm:py-5 rounded-2xl text-base focus:outline-none transition-all"
                    style={{
                      backgroundColor: "rgba(38, 37, 37, 0.8)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(236, 179, 55, 0.2)",
                      color: "#b3b3b3",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                  <button
                    onClick={handleSearch}
                    className="w-full sm:w-auto sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2 px-6 py-4 sm:py-3 rounded-xl font-semibold transition-all hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: "#ecb337",
                      color: "#161616",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {/* ── Filtros rápidos ────────────────────────────────── */}
              <div className="flex gap-2 sm:gap-3 justify-center flex-wrap mb-8">
                {[
                  { key: "all", label: "Todas" },
                  { key: "arriendo", label: "Arriendo" },
                  { key: "venta", label: "Venta" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key)}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all hover:scale-105 text-sm sm:text-base cursor-pointer"
                    style={{
                      backgroundColor:
                        filter === item.key
                          ? "#ecb337"
                          : "rgba(38, 37, 37, 0.8)",
                      color: filter === item.key ? "#161616" : "#b3b3b3",
                      border:
                        filter === item.key
                          ? "none"
                          : "1px solid rgba(236, 179, 55, 0.2)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Contador + controles carrusel */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                <div
                  className="px-6 py-3 rounded-2xl"
                  style={{ backgroundColor: "#262525" }}
                >
                  <span
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: "#ecb337" }}
                  >
                    {filteredProperties.length}
                  </span>
                  <span
                    className="ml-2 text-sm sm:text-base"
                    style={{ color: "#9ca3af" }}
                  >
                    propiedades encontradas
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => scrollCarousel("left")}
                    className="p-3 sm:p-4 rounded-full transition-all hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: "#262525", color: "#ecb337" }}
                    aria-label="Anterior"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollCarousel("right")}
                    className="p-3 sm:p-4 rounded-full transition-all hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: "#ecb337", color: "#161616" }}
                    aria-label="Siguiente"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Carrusel de propiedades */}
        <div className="relative">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 rounded-full"
                style={{ borderColor: "#262525", borderTopColor: "#ecb337" }}
              />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-20 px-4">
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-xl mb-4" style={{ color: "#9ca3af" }}>
                No se encontraron propiedades
              </p>
              <button
                onClick={() => {
                  setFilter("all");
                  setSearchTerm("");
                  setActiveSearchTerm("");
                }}
                className="px-6 py-3 rounded-full font-semibold transition-all cursor-pointer"
                style={{ backgroundColor: "#ecb337", color: "#161616" }}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div
                className="hidden sm:block absolute left-0 top-0 bottom-0 w-16 md:w-24 z-10 pointer-events-none"
                style={{
                  background: "linear-gradient(to right, #161616, transparent)",
                }}
              />
              <div
                ref={carouselRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 px-4 sm:px-6 md:px-12 lg:px-24"
                style={{
                  scrollSnapType: "x mandatory",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {filteredProperties.map((property, index) => (
                  <div
                    key={property.id}
                    className="w-[280px] sm:w-[320px] md:w-[360px] flex-shrink-0"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <PropertyCard property={property} index={index} />
                  </div>
                ))}
              </div>
              <div
                className="hidden sm:block absolute right-0 top-0 bottom-0 w-16 md:w-24 z-10 pointer-events-none"
                style={{
                  background: "linear-gradient(to left, #161616, transparent)",
                }}
              />
            </>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 3 — STATS / VALORES (idéntica al original)
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-16 sm:py-20 px-4 sm:px-6"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: "Transparencia",
                subtitle: "En cada proceso",
                icon: "🤝",
              },
              {
                title: "Conectamos",
                subtitle: "Propietarios y personas",
                icon: "🏠",
              },
              {
                title: "Acompañamiento",
                subtitle: "Honesto y seguro",
                icon: "😊",
              },
              {
                title: "Cobertura",
                subtitle: "Oriente Antioqueño",
                icon: "📍",
              },
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div
                  className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-center"
                  style={{
                    background: "linear-gradient(135deg, #262525, #1e1e1e)",
                    border: "1px solid rgba(236, 179, 55, 0.08)",
                  }}
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">
                    {stat.icon}
                  </div>
                  <h3
                    className="text-lg sm:text-xl font-bold mb-1 sm:mb-2"
                    style={{
                      color: "#ecb337",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 400,
                    }}
                  >
                    {stat.title}
                  </h3>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: "#9ca3af" }}
                  >
                    {stat.subtitle}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 4 — SERVICIOS
      ════════════════════════════════════════════════════════════════════ */}
      <section
        id="servicios"
        className="py-16 sm:py-24 px-4 sm:px-6"
        style={{ backgroundColor: "#161616" }}
      >
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{
                  backgroundColor: "rgba(236,179,55,0.1)",
                  color: "#ecb337",
                  border: "1px solid rgba(236,179,55,0.3)",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: "0.72rem",
                }}
              >
                Lo que ofrecemos
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl mb-4"
                style={{
                  color: "#b3b3b3",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 300,
                }}
              >
                Nuestros <span style={{ color: "#ecb337" }}>servicios</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
                    />
                  </svg>
                ),
                title: "Arriendo",
                desc: "Encuentra el inmueble perfecto en arriendo con las mejores condiciones del mercado.",
              },
              {
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"
                    />
                  </svg>
                ),
                title: "Venta",
                desc: "Propiedades en venta con acompañamiento experto durante todo el proceso.",
              },
              {
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                    />
                  </svg>
                ),
                title: "Gestión Integral",
                desc: "Administración transparente y confiable de tu patrimonio inmobiliario.",
              },
            ].map((svc, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div
                  className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl h-full"
                  style={{
                    background: "linear-gradient(135deg, #1e1e1e, #262525)",
                    border: "1px solid rgba(236,179,55,0.1)",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                      backgroundColor: "rgba(236,179,55,0.1)",
                      color: "#ecb337",
                    }}
                  >
                    {svc.icon}
                  </div>
                  <h3
                    className="text-xl sm:text-2xl font-bold mb-3"
                    style={{
                      color: "#b3b3b3",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 400,
                    }}
                  >
                    {svc.title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{
                      color: "#9ca3af",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {svc.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 5 — NOSOTROS
      ════════════════════════════════════════════════════════════════════ */}
      <section
        id="nosotros"
        className="py-16 sm:py-24 px-4 sm:px-6"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            {/* Imagen */}
            <AnimatedSection>
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
                  style={{
                    background: "linear-gradient(135deg, #ecb337, #0d4447)",
                  }}
                />
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
                  <img
                    src={aboutImage}
                    alt="El equipo de InterRenta"
                    className="w-full object-cover"
                    style={{ aspectRatio: "4/3" }}
                  />
                  {/* Glass badge */}
                  <div
                    className="absolute bottom-6 left-6 right-6 p-4 sm:p-5 rounded-xl sm:rounded-2xl"
                    style={{
                      background: "rgba(22,22,22,0.85)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(236,179,55,0.2)",
                    }}
                  >
                    <p
                      className="text-sm sm:text-base"
                      style={{
                        color: "#b3b3b3",
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: 300,
                        lineHeight: 1.5,
                      }}
                    >
                      "Tu hogar es nuestra misión. Cada propiedad, una
                      historia."
                    </p>
                    <p
                      className="mt-2 text-xs"
                      style={{ color: "#ecb337", letterSpacing: "0.1em" }}
                    >
                      — Equipo InterRenta
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Contenido */}
            <AnimatedSection delay={0.2}>
              <div>
                <span
                  className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
                  style={{
                    backgroundColor: "rgba(236,179,55,0.1)",
                    color: "#ecb337",
                    border: "1px solid rgba(236,179,55,0.3)",
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontSize: "0.72rem",
                  }}
                >
                  Sobre nosotros
                </span>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl mb-6"
                  style={{
                    color: "#b3b3b3",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 300,
                    lineHeight: 1.1,
                  }}
                >
                  Expertos en el{" "}
                  <span style={{ color: "#ecb337" }}>Oriente Antioqueño</span>
                </h2>
                <p
                  className="text-base sm:text-lg mb-8 leading-relaxed"
                  style={{
                    color: "#9ca3af",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Somos una empresa comprometida con brindar soluciones
                  inmobiliarias integrales, conectando propietarios y
                  arrendatarios con transparencia, honestidad y el mejor
                  acompañamiento de la región.
                </p>

                {/* Características */}
                <div className="space-y-4">
                  {[
                    {
                      icon: "✦",
                      title: "Transparencia total",
                      desc: "Procesos claros y documentados en cada paso.",
                    },
                    {
                      icon: "✦",
                      title: "Cobertura regional",
                      desc: "Presencia en todo el Oriente Antioqueño.",
                    },
                    {
                      icon: "✦",
                      title: "Acompañamiento experto",
                      desc: "Te guiamos desde la búsqueda hasta el cierre.",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-4 p-4 rounded-xl"
                      style={{ backgroundColor: "rgba(38,37,37,0.6)" }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(236,179,55,0.12)" }}
                      >
                        <span style={{ color: "#ecb337", fontSize: "1rem" }}>
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <h4
                          className="font-bold mb-1"
                          style={{
                            color: "#b3b3b3",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {item.title}
                        </h4>
                        <p
                          className="text-sm"
                          style={{
                            color: "#9ca3af",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Misión / Visión / Valores */}
          <AnimatedSection className="mt-16 sm:mt-20">
            <div
              className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl"
              style={{
                backgroundColor: "#262525",
                border: "1px solid rgba(236,179,55,0.1)",
              }}
            >
              <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
                {[
                  {
                    icon: "🚩",
                    title: "Misión",
                    text: "Brindar soluciones integrales de renta y gestión, ofreciendo un servicio confiable y transparente.",
                  },
                  {
                    icon: "🔭",
                    title: "Visión",
                    text: "Ser una empresa líder y reconocida por la excelencia en nuestros servicios de renta y gestión.",
                  },
                  {
                    icon: "🤝",
                    title: "Valores",
                    text: "Responsabilidad, Transparencia, Compromiso, Confianza, Calidad e Innovación.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
                      style={{ backgroundColor: "rgba(236,179,55,0.1)" }}
                    >
                      <span className="text-3xl sm:text-4xl">{item.icon}</span>
                    </div>
                    <h3
                      className="text-xl sm:text-2xl font-bold mb-3"
                      style={{
                        color: "#ecb337",
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontWeight: 400,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="leading-relaxed text-sm sm:text-base"
                      style={{
                        color: "#9ca3af",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN 6 — CTA (WhatsApp)
      ════════════════════════════════════════════════════════════════════ */}
      <section
        id="contacto"
        className="py-16 sm:py-24 px-4 sm:px-6"
        style={{ backgroundColor: "#161616" }}
      >
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div
              className="relative overflow-hidden rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center"
              style={{
                background: "linear-gradient(135deg, #1a1a1a, #262525)",
              }}
            >
              {/* Glow decorativo */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-[80px] pointer-events-none"
                style={{ backgroundColor: "#ecb337" }}
              />
              <div className="relative z-10">
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
                  style={{
                    color: "#b3b3b3",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 300,
                  }}
                >
                  ¿Listo para encontrar{" "}
                  <span style={{ color: "#ecb337" }}>tu próximo hogar?</span>
                </h2>
                <p
                  className="text-lg sm:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto"
                  style={{
                    color: "#9ca3af",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Nuestro equipo de expertos está listo para ayudarte
                </p>
                <a
                  href="https://wa.me/573195227378?text=Hola,%20estoy%20interesado%20en%20sus%20servicios%20inmobiliarios."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-green-500 text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-green-600 transition-all hover:scale-105 text-base sm:text-lg"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 flex-shrink-0"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.557 4.133 1.535 5.869L.057 23.272a.75.75 0 00.932.932l5.403-1.478A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.948 0-3.773-.5-5.355-1.376L2.25 21.75l1.126-4.395A9.954 9.954 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  Escríbenos por WhatsApp
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════ */}
      <footer
        className="py-12 sm:py-16 px-4 sm:px-6"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="col-span-2 md:col-span-1">
              <h3
                className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
                style={{
                  color: "#ecb337",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 400,
                }}
              >
                InterRenta
              </h3>
              <p
                className="text-sm sm:text-base mb-4 sm:mb-6"
                style={{ color: "#9ca3af" }}
              >
                Tu socio de confianza en bienes raíces.
              </p>
            </div>

            <div>
              <h4
                className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg"
                style={{ color: "#d7af4d", fontFamily: "'Inter', sans-serif" }}
              >
                Servicios
              </h4>
              <ul
                className="space-y-2 sm:space-y-3 text-sm sm:text-base"
                style={{ color: "#9ca3af" }}
              >
                <li>
                  <a
                    href="#servicios"
                    className="hover:text-[#ecb337] transition-colors cursor-pointer"
                  >
                    Arriendo
                  </a>
                </li>
                <li>
                  <a
                    href="#servicios"
                    className="hover:text-[#ecb337] transition-colors cursor-pointer"
                  >
                    Venta
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4
                className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg"
                style={{ color: "#d7af4d", fontFamily: "'Inter', sans-serif" }}
              >
                Contacto
              </h4>
              <ul
                className="space-y-2 sm:space-y-3 text-sm sm:text-base"
                style={{ color: "#9ca3af" }}
              >
                <li className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-4 h-4 flex-shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <span className="break-all">comercial@interrenta.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-4 h-4 flex-shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                  +57 319 522 7378
                </li>
              </ul>
            </div>
          </div>

          <div
            className="pt-6 sm:pt-8 text-center"
            style={{ borderTop: "1px solid #262525" }}
          >
            <p className="text-xs sm:text-sm" style={{ color: "#6b7280" }}>
              © 2025 InterRenta. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Divisor de revelación entre scrollytelling y contenido ────────────────────
function RevealDivider() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1.2 }}
      style={{
        height: 1,
        background:
          "linear-gradient(90deg, transparent, rgba(236,179,55,0.35), transparent)",
        margin: "0 auto",
        maxWidth: "60%",
      }}
    />
  );
}
