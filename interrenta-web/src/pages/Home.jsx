import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { getAllProperties } from "../services/property.service";
import Navbar from "../components/layout/Navbar";
import PropertyCard from "../components/property/PropertyCard";
import aboutImage from "../../src/assets/familia.png";
import fondoImage from "../assets/fondo.jpg";
import logoImage from "../assets/LogointerrentaTransparente.png";

// Componente de sección animada
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

function LeadForm() {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    municipio: "",
    tipo: "",
  });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, telefono, municipio, tipo } = form;
    if (!nombre || !telefono || !municipio || !tipo) return;

    const msg = `Hola, quiero evaluar mi propiedad de forma gratuita.
- Nombre: ${nombre}
- Teléfono: ${telefono}
- Municipio: ${municipio}
- Tipo de propiedad: ${tipo}`;

    window.open(
      `https://wa.me/573195227378?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
    setEnviado(true);
  };

  const inputStyle = {
    backgroundColor: "#262525",
    border: "1px solid rgba(236, 179, 55, 0.2)",
    color: "#b3b3b3",
    borderRadius: "0.75rem",
    padding: "0.875rem 1.25rem",
    width: "100%",
    fontSize: "0.95rem",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.375rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#9ca3af",
  };

  if (enviado) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 px-8 rounded-2xl"
        style={{ backgroundColor: "#262525", border: "1px solid rgba(236, 179, 55, 0.2)" }}
      >
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: "#b3b3b3" }}>
          ¡Gracias, {form.nombre}!
        </h3>
        <p style={{ color: "#9ca3af" }}>
          Te redirigimos a WhatsApp para completar la evaluación. Nuestro equipo te responderá pronto.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl"
      style={{
        backgroundColor: "#262525",
        border: "1px solid rgba(236, 179, 55, 0.15)",
      }}
    >
      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label style={labelStyle}>Nombre completo</label>
          <input
            type="text"
            name="nombre"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Teléfono / WhatsApp</label>
          <input
            type="tel"
            name="telefono"
            placeholder="3xx xxx xxxx"
            value={form.telefono}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Municipio</label>
          <select
            name="municipio"
            value={form.municipio}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Selecciona un municipio</option>
            <option value="Rionegro">Rionegro</option>
            <option value="Envigado">Envigado</option>
            <option value="El Retiro">El Retiro</option>
            <option value="San Vicente de Ferrer">San Vicente de Ferrer</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Tipo de propiedad</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Selecciona el tipo</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Casa">Casa</option>
            <option value="Finca">Finca</option>
            <option value="Local comercial">Local comercial</option>
            <option value="Lote">Lote</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-[1.02] hover:opacity-90"
        style={{ backgroundColor: "#ecb337", color: "#161616" }}
      >
        Solicitar evaluación gratuita →
      </button>

      <p className="text-center text-xs mt-3" style={{ color: "#6b7280" }}>
        Te redirigiremos a WhatsApp para completar la solicitud. Sin spam, sin compromisos.
      </p>
    </form>
  );
}

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const carouselRef = useRef(null);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    loadProperties();
  }, []);

  const scrollToProperties = useCallback(() => {
    const section = document.getElementById("propiedades");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
          p.code?.toLowerCase().includes(term)
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
      const scrollAmount = 400;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#161616" }}
    >
      <Navbar />

      {/* Logo flotante arriba a la izquierda */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="hidden md:block fixed top-4 left-4 z-50"
      >
        <img
          src={logoImage}
          alt="InterRenta Logo"
          className="h-16 md:h-20 w-auto drop-shadow-lg"
        />
      </motion.div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Imagen de fondo con opacidad */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${fondoImage})`,
            opacity: 1,
          }}
        />

        {/* Background animado */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(13, 68, 71, 0.85) 0%, rgba(38, 37, 37, 0.8) 50%, rgba(13, 68, 71, 0.85) 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-30">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full filter blur-[100px]"
              style={{ backgroundColor: "#ecb337" }}
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
              transition={{ duration: 25, repeat: Infinity }}
              className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full filter blur-[100px]"
              style={{ backgroundColor: "#d7af4d" }}
            />
          </div>
        </div>

        {/* Contenido Hero */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium"
              style={{
                color: "#ecb337",
                backgroundColor: "rgba(236, 179, 55, 0.1)",
                border: "1px solid rgba(236, 179, 55, 0.3)",
              }}
            >
              <span className="animate-pulse">✨</span>
              Encuentra tu hogar ideal
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-tight"
            style={{ color: "#b3b3b3" }}
          >
            Vive donde
            <span className="block gradient-text">siempre soñaste</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 max-w-2xl mx-auto"
            style={{ color: "#9ca3af" }}
          >
            Descubre propiedades exclusivas con el mejor servicio inmobiliario
            de la región
          </motion.p>

          {/* Barra de búsqueda */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Buscar por ubicación, tipo, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-6 py-4 sm:py-5 rounded-2xl text-base sm:text-lg focus:outline-none transition-all"
                style={{
                  backgroundColor: "rgba(38, 37, 37, 0.8)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(236, 179, 55, 0.2)",
                  color: "#b3b3b3",
                }}
              />
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2 px-6 py-4 sm:py-3 rounded-xl font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: "#ecb337", color: "#161616" }}
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
            className="flex gap-2 sm:gap-3 justify-center flex-wrap"
          >
            {[
              { key: "all", label: "Todas" },
              { key: "arriendo", label: "Arriendo" },
              { key: "venta", label: "Venta" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all hover:scale-105 text-sm sm:text-base"
                style={{
                  backgroundColor:
                    filter === item.key ? "#ecb337" : "rgba(38, 37, 37, 0.8)",
                  color: filter === item.key ? "#161616" : "#b3b3b3",
                  border:
                    filter === item.key
                      ? "none"
                      : "1px solid rgba(236, 179, 55, 0.2)",
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
            style={{ border: "2px solid rgba(236, 179, 55, 0.5)" }}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#ecb337" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Propiedades - Carrusel */}
      <section
        id="propiedades"
        className="py-16 sm:py-24 relative"
        style={{ backgroundColor: "#161616" }}
      >
        {/* Efecto decorativo */}
        <div
          className="absolute top-0 left-0 w-72 h-72 rounded-full filter blur-[150px] opacity-20"
          style={{ backgroundColor: "#ecb337" }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full filter blur-[150px] opacity-20"
          style={{ backgroundColor: "#0d4447" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{
                  backgroundColor: "rgba(236, 179, 55, 0.1)",
                  color: "#ecb337",
                  border: "1px solid rgba(236, 179, 55, 0.3)",
                }}
              >
                🏡 Explora nuestro catálogo
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ color: "#b3b3b3" }}
              >
                Propiedades{" "}
                <span style={{ color: "#ecb337" }}>disponibles</span>
              </h2>
              <p
                className="max-w-2xl mx-auto mb-6"
                style={{ color: "#9ca3af" }}
              >
                Encuentra el espacio perfecto para ti y tu familia
              </p>

              {/* Contador y controles */}
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
                    className="p-3 sm:p-4 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: "#262525", color: "#ecb337" }}
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
                    className="p-3 sm:p-4 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: "#ecb337", color: "#161616" }}
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

        {/* Carrusel */}
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
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-xl mb-4" style={{ color: "#9ca3af" }}>
                No se encontraron propiedades
              </p>
              <button
                onClick={() => {
                  setFilter("all");
                  setSearchTerm("");
                  setActiveSearchTerm("");
                }}
                className="px-6 py-3 rounded-full font-semibold transition-all"
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

      {/* Municipios */}
      <section
        className="py-16 sm:py-24 px-4 sm:px-6"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{
                  backgroundColor: "rgba(236, 179, 55, 0.1)",
                  color: "#ecb337",
                  border: "1px solid rgba(236, 179, 55, 0.3)",
                }}
              >
                📍 Nuestra cobertura
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ color: "#b3b3b3" }}
              >
                Encuentra tu hogar por{" "}
                <span style={{ color: "#ecb337" }}>municipio</span>
              </h2>
              <p className="max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
                Conocemos el Oriente Antioqueño como nadie. Explora propiedades por zona
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { slug: "rionegro", nombre: "Rionegro", emoji: "🏙️", desc: "Ciudad aeropuerto, conjuntos y comercio" },
              { slug: "envigado", nombre: "Envigado", emoji: "🌿", desc: "Calidad de vida y conectividad" },
              { slug: "el-retiro", nombre: "El Retiro", emoji: "🏡", desc: "Segmento premium y naturaleza" },
              { slug: "san-vicente", nombre: "San Vicente", emoji: "🌄", desc: "Fincas y vida campestre" },
            ].map((m, i) => (
              <AnimatedSection key={m.slug} delay={i * 0.1}>
                <Link to={`/${m.slug}`}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center transition-all duration-300 cursor-pointer group"
                    style={{
                      backgroundColor: "#262525",
                      border: "1px solid rgba(236, 179, 55, 0.1)",
                    }}
                  >
                    <div className="text-4xl sm:text-5xl mb-3">{m.emoji}</div>
                    <div
                      className="text-base sm:text-lg font-bold mb-1 group-hover:text-[#ecb337] transition-colors"
                      style={{ color: "#b3b3b3" }}
                    >
                      {m.nombre}
                    </div>
                    <div className="text-xs sm:text-sm" style={{ color: "#6b7280" }}>
                      {m.desc}
                    </div>
                    <div
                      className="mt-4 text-xs font-semibold group-hover:gap-2 flex items-center justify-center gap-1 transition-all"
                      style={{ color: "#ecb337" }}
                    >
                      Ver propiedades →
                    </div>
                  </motion.div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario captación de propietarios */}
      <section
        className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden"
        style={{ backgroundColor: "#161616" }}
      >
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full filter blur-[200px] opacity-10"
          style={{ backgroundColor: "#0d4447" }}
        />
        <div className="max-w-3xl mx-auto relative z-10">
          <AnimatedSection>
            <div className="text-center mb-10 sm:mb-12">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{
                  backgroundColor: "rgba(236, 179, 55, 0.1)",
                  color: "#ecb337",
                  border: "1px solid rgba(236, 179, 55, 0.3)",
                }}
              >
                🏠 ¿Tienes una propiedad?
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ color: "#b3b3b3" }}
              >
                Evalúa tu propiedad{" "}
                <span style={{ color: "#ecb337" }}>gratis</span>
              </h2>
              <p className="max-w-xl mx-auto" style={{ color: "#9ca3af" }}>
                Cuéntanos sobre tu inmueble y te contactamos en menos de 24 horas con una valoración sin costo
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <LeadForm />
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonios */}
      <section
        className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden"
        style={{ backgroundColor: "#161616" }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full filter blur-[150px] opacity-10"
          style={{ backgroundColor: "#ecb337" }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{
                  backgroundColor: "rgba(236, 179, 55, 0.1)",
                  color: "#ecb337",
                  border: "1px solid rgba(236, 179, 55, 0.3)",
                }}
              >
                ⭐ Lo que dicen nuestros clientes
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ color: "#b3b3b3" }}
              >
                Familias que{" "}
                <span style={{ color: "#ecb337" }}>confían en nosotros</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Daniela Restrepo",
                location: "Rionegro",
                type: "Arriendo",
                text: "Encontramos el apartamento perfecto en menos de dos semanas. El proceso fue transparente y el equipo nos acompañó en cada paso.",
                stars: 5,
              },
              {
                name: "Carlos Mejía",
                location: "El Retiro",
                type: "Venta",
                text: "Vendí mi casa en tiempo récord y al precio que esperaba. InterRenta conoce muy bien el mercado del Oriente Antioqueño.",
                stars: 5,
              },
              {
                name: "Marcela Gómez",
                location: "Envigado",
                type: "Arriendo",
                text: "Como propietaria, me da mucha tranquilidad saber que mi propiedad está en buenas manos. Excelente comunicación y gestión.",
                stars: 5,
              },
            ].map((t, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col gap-4"
                  style={{
                    backgroundColor: "#262525",
                    border: "1px solid rgba(236, 179, 55, 0.1)",
                  }}
                >
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <span key={s} style={{ color: "#ecb337" }}>★</span>
                    ))}
                  </div>
                  <p
                    className="leading-relaxed text-sm sm:text-base flex-1"
                    style={{ color: "#9ca3af" }}
                  >
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid #3a3a3a" }}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: "rgba(236, 179, 55, 0.2)", color: "#ecb337" }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "#b3b3b3" }}>
                        {t.name}
                      </div>
                      <div className="text-xs" style={{ color: "#6b7280" }}>
                        {t.location} · {t.type}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN STATS - Reubicada después de propiedades */}
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
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="text-center p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl transition-all duration-300"
                  style={{ backgroundColor: "#262525" }}
                >
                  <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">
                    {stat.icon}
                  </div>
                  <div
                    className="text-base sm:text-xl md:text-2xl font-bold mb-1"
                    style={{ color: "#ecb337" }}
                  >
                    {stat.title}
                  </div>
                  <div
                    className="text-xs sm:text-sm md:text-base"
                    style={{ color: "#9ca3af" }}
                  >
                    {stat.subtitle}
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
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
                  backgroundColor: "rgba(236, 179, 55, 0.1)",
                  color: "#ecb337",
                  border: "1px solid rgba(236, 179, 55, 0.3)",
                }}
              >
                Para propietarios
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ color: "#b3b3b3" }}
              >
                Soy <span style={{ color: "#ecb337" }}>propietario</span>
              </h2>
              <p className="max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
                Ofrecemos soluciones integrales para todas tus necesidades
                inmobiliarias
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: "🏠",
                title: "Arriendos",
                description:
                  "Ponga su propiedad en arriendo con el respaldo de un equipo experto.",
                whatsappMsg:
                  "Hola, estoy interesado en poner una propiedad en renta.",
              },
              {
                icon: "🏷️",
                title: "Ventas",
                description:
                  "Venda su propiedad de manera segura y efectiva con nuestro acompañamiento.",
                whatsappMsg:
                  "Hola, estoy interesado en poner una propiedad en venta.",
              },
            ].map((service, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <motion.a
                  href={`https://wa.me/573195227378?text=${encodeURIComponent(
                    service.whatsappMsg
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -10 }}
                  className="block p-6 sm:p-8 rounded-2xl sm:rounded-3xl transition-all duration-500 group cursor-pointer"
                  style={{ backgroundColor: "#262525" }}
                >
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">
                    {service.icon}
                  </div>
                  <h3
                    className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-[#ecb337] transition-colors"
                    style={{ color: "#b3b3b3" }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base"
                    style={{ color: "#9ca3af" }}
                  >
                    {service.description}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 font-semibold group-hover:gap-4 transition-all text-sm sm:text-base"
                    style={{ color: "#ecb337" }}
                  >
                    Contactar por WhatsApp
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </motion.a>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros */}
      {/* Nosotros */}
      <section
        id="nosotros"
        className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        {/* Decoración de fondo */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full filter blur-[200px] opacity-10"
          style={{ backgroundColor: "#ecb337" }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full filter blur-[200px] opacity-10"
          style={{ backgroundColor: "#0d4447" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header centrado */}
          <AnimatedSection>
            <div className="text-center mb-16 sm:mb-20">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{
                  backgroundColor: "rgba(236, 179, 55, 0.1)",
                  color: "#ecb337",
                  border: "1px solid rgba(236, 179, 55, 0.3)",
                }}
              >
                Conócenos
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ color: "#b3b3b3" }}
              >
                Más de <span style={{ color: "#ecb337" }}>10 años</span> creando
                hogares
              </h2>
              <p className="max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
                En InterRenta nos especializamos en encontrar la propiedad
                perfecta para ti
              </p>
            </div>
          </AnimatedSection>

          {/* Grid principal: Imagen + Beneficios */}
          <div className="grid lg:grid-cols-5 gap-8 sm:gap-12 items-center mb-16 sm:mb-20">
            {/* Imagen grande */}
            <AnimatedSection className="lg:col-span-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden relative"
                style={{ backgroundColor: "#262525" }}
              >
                {aboutImage ? (
                  <img
                    src={aboutImage}
                    alt="InterRenta - Experiencia inmobiliaria"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-9xl">🏠</span>
                  </div>
                )}
                {/* Overlay con estadística */}
                <div
                  className="absolute bottom-4 left-4 right-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-sm"
                  style={{ backgroundColor: "rgba(22, 22, 22, 0.9)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: "#ecb337" }}
                      >
                        10/10
                      </div>
                      <div className="text-sm" style={{ color: "#9ca3af" }}>
                        Acompañamiento
                      </div>
                    </div>
                    <div
                      className="w-px h-12"
                      style={{ backgroundColor: "#3a3a3a" }}
                    />
                    <div>
                      <div
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: "#ecb337" }}
                      >
                        +10
                      </div>
                      <div className="text-sm" style={{ color: "#9ca3af" }}>
                        Años de experiencia
                      </div>
                    </div>
                    <div
                      className="w-px h-12 hidden sm:block"
                      style={{ backgroundColor: "#3a3a3a" }}
                    />
                    <div className="hidden sm:block">
                      <div
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: "#ecb337" }}
                      >
                        100%
                      </div>
                      <div className="text-sm" style={{ color: "#9ca3af" }}>
                        Compromiso
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>

            {/* Lista de beneficios */}
            <AnimatedSection delay={0.2} className="lg:col-span-2">
              <div className="space-y-4">
                {[
                  {
                    icon: "✓",
                    title: "Asesoría personalizada",
                    desc: "Te guiamos en cada paso del proceso",
                  },
                  {
                    icon: "✓",
                    title: "Propiedades verificadas",
                    desc: "100% confiables y documentadas",
                  },
                  {
                    icon: "✓",
                    title: "Proceso transparente",
                    desc: "Sin letras pequeñas ni sorpresas",
                  },
                  {
                    icon: "✓",
                    title: "Soporte legal integral",
                    desc: "Respaldo jurídico en cada transacción",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5 }}
                    className="p-4 sm:p-5 rounded-xl sm:rounded-2xl transition-all"
                    style={{ backgroundColor: "#262525" }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(236, 179, 55, 0.2)" }}
                      >
                        <span
                          style={{ color: "#ecb337" }}
                          className="font-bold"
                        >
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <h4
                          className="font-bold mb-1"
                          style={{ color: "#b3b3b3" }}
                        >
                          {item.title}
                        </h4>
                        <p className="text-sm" style={{ color: "#9ca3af" }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          {/* Misión, Visión y Valores - Diseño horizontal */}
          <AnimatedSection>
            <div
              className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl"
              style={{
                backgroundColor: "#262525",
                border: "1px solid rgba(236, 179, 55, 0.1)",
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
                    icon: "🤝🏻",
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
                      style={{ backgroundColor: "rgba(236, 179, 55, 0.1)" }}
                    >
                      <span className="text-3xl sm:text-4xl">{item.icon}</span>
                    </div>
                    <h3
                      className="text-xl sm:text-2xl font-bold mb-3"
                      style={{ color: "#ecb337" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="leading-relaxed text-sm sm:text-base"
                      style={{ color: "#9ca3af" }}
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

      {/* Equipo */}
      <section
        className="py-16 sm:py-24 px-4 sm:px-6"
        style={{ backgroundColor: "#161616" }}
      >
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{
                  backgroundColor: "rgba(236, 179, 55, 0.1)",
                  color: "#ecb337",
                  border: "1px solid rgba(236, 179, 55, 0.3)",
                }}
              >
                👋 Nuestro equipo
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                style={{ color: "#b3b3b3" }}
              >
                Personas reales,{" "}
                <span style={{ color: "#ecb337" }}>resultados reales</span>
              </h2>
              <p className="max-w-xl mx-auto" style={{ color: "#9ca3af" }}>
                Detrás de cada negocio hay un equipo comprometido con encontrar la mejor solución para ti
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <motion.div
              whileHover={{ y: -5 }}
              className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 p-8 sm:p-10 rounded-2xl sm:rounded-3xl"
              style={{
                backgroundColor: "#262525",
                border: "1px solid rgba(236, 179, 55, 0.15)",
              }}
            >
              {/* Avatar placeholder */}
              <div
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl flex items-center justify-center flex-shrink-0 text-5xl sm:text-6xl"
                style={{ backgroundColor: "rgba(236, 179, 55, 0.1)" }}
              >
                🤝
              </div>
              <div className="text-center sm:text-left">
                <h3
                  className="text-xl sm:text-2xl font-bold mb-1"
                  style={{ color: "#b3b3b3" }}
                >
                  Equipo InterRenta
                </h3>
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: "#ecb337" }}
                >
                  Agencia Inmobiliaria · Oriente Antioqueño
                </p>
                <p
                  className="leading-relaxed text-sm sm:text-base mb-5"
                  style={{ color: "#9ca3af" }}
                >
                  Con más de 10 años en el mercado inmobiliario del Oriente Antioqueño, nuestro equipo te acompaña desde la búsqueda hasta la firma. Conocemos Rionegro, Envigado, El Retiro y San Vicente de Ferrer como nadie.
                </p>
                <a
                  href="https://wa.me/573195227378?text=Hola,%20quiero%20conocer%20más%20sobre%20InterRenta."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                  style={{ backgroundColor: "#ecb337", color: "#161616" }}
                >
                  💬 Hablar con el equipo
                </a>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
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
              <div className="relative z-10">
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
                  style={{ color: "#b3b3b3" }}
                >
                  ¿Listo para encontrar{" "}
                  <span className="gradient-text">tu próximo hogar?</span>
                </h2>

                <p
                  className="text-lg sm:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto"
                  style={{ color: "#9ca3af" }}
                >
                  Nuestro equipo de expertos está listo para ayudarte
                </p>

                <a
                  href="https://wa.me/573195227378?text=Hola,%20estoy%20interesado%20en%20sus%20servicios%20inmobiliarios."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-green-500 text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-green-600 transition-all hover:scale-105 text-base sm:text-lg"
                >
                  <span className="text-xl sm:text-2xl">💬</span> Escríbenos por
                  WhatsApp
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 sm:py-16 px-4 sm:px-6"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="col-span-2 md:col-span-1">
              <h3
                className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
                style={{ color: "#ecb337" }}
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
                style={{ color: "#d7af4d" }}
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
                    className="hover:text-[#ecb337] transition-colors"
                  >
                    Arriendo
                  </a>
                </li>
                <li>
                  <a
                    href="#servicios"
                    className="hover:text-[#ecb337] transition-colors"
                  >
                    Venta
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4
                className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg"
                style={{ color: "#d7af4d" }}
              >
                Contacto
              </h4>
              <ul
                className="space-y-2 sm:space-y-3 text-sm sm:text-base"
                style={{ color: "#9ca3af" }}
              >
                <li className="flex items-center gap-2">
                  <span>📧</span>{" "}
                  <span className="break-all">comercial@interrenta.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span> +57 319 522 7378
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
