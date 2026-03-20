import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { getPropertiesBySector } from "../services/property.service";
import Navbar from "../components/layout/Navbar";
import PropertyCard from "../components/property/PropertyCard";

const MUNICIPIOS = {
  rionegro: {
    nombre: "Rionegro",
    descripcion:
      "Arriendos y ventas en Rionegro, Antioquia. Apartamentos, casas y locales en el corazón del Oriente Antioqueño.",
    keyword: "Rionegro",
    emoji: "🏙️",
    detalle:
      "Rionegro es el municipio más dinámico del Oriente Antioqueño. Cerca al aeropuerto José María Córdova, con gran oferta de conjuntos residenciales, zonas comerciales y colegios internacionales.",
  },
  envigado: {
    nombre: "Envigado",
    descripcion:
      "Arriendos y ventas en Envigado, Antioquia. Propiedades premium en uno de los municipios con mejor calidad de vida de Colombia.",
    keyword: "Envigado",
    emoji: "🌿",
    detalle:
      "Envigado combina la tranquilidad de un municipio con la conectividad del área metropolitana. Ideal para familias que buscan seguridad, zonas verdes y servicios de primer nivel.",
  },
  "el-retiro": {
    nombre: "El Retiro",
    descripcion:
      "Finca raíz en El Retiro, Antioquia. Casas, fincas y propiedades premium en el municipio más exclusivo del Oriente Antioqueño.",
    keyword: "El Retiro",
    emoji: "🏡",
    detalle:
      "El Retiro es el destino preferido del segmento premium del Oriente Antioqueño. Con clima templado, paisajes verdes y una comunidad tranquila, atrae tanto a familias locales como a extranjeros.",
  },
  "san-vicente": {
    nombre: "San Vicente de Ferrer",
    descripcion:
      "Propiedades en San Vicente de Ferrer, Antioquia. Fincas, casas campestres y lotes en plena naturaleza del Oriente Antioqueño.",
    keyword: "San Vicente",
    emoji: "🌄",
    detalle:
      "San Vicente de Ferrer ofrece una vida tranquila rodeada de naturaleza. Popular entre quienes buscan fincas, retiros y propiedades campestres a buen precio.",
  },
};

export default function MunicipioPage({ municipio }) {
  const config = MUNICIPIOS[municipio];
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!config) return;
    getPropertiesBySector(config.keyword).then(({ data }) => {
      setProperties(data || []);
      setLoading(false);
    });
  }, [config]);

  const filtered =
    filter === "all"
      ? properties
      : properties.filter((p) => p.contract_type === filter);

  const scrollCarousel = (dir) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: dir === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  if (!config) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#161616" }}
      >
        <p style={{ color: "#9ca3af" }}>Municipio no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#161616" }}>
      <Helmet>
        <title>{`Propiedades en ${config.nombre} – InterRenta`}</title>
        <meta name="description" content={config.descripcion} />
        <link rel="canonical" href={`https://www.interrenta.com/${municipio}`} />
        <meta property="og:title" content={`Propiedades en ${config.nombre} – InterRenta`} />
        <meta property="og:description" content={config.descripcion} />
        <meta property="og:url" content={`https://www.interrenta.com/${municipio}`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      {/* Hero del municipio */}
      <section
        className="pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6 relative overflow-hidden"
        style={{ backgroundColor: "#161616" }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full filter blur-[200px] opacity-10"
          style={{ backgroundColor: "#ecb337" }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-80"
            style={{ color: "#9ca3af" }}
          >
            ← Volver al inicio
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-6xl mb-4">{config.emoji}</div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight"
              style={{ color: "#b3b3b3" }}
            >
              Propiedades en{" "}
              <span style={{ color: "#ecb337" }}>{config.nombre}</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8" style={{ color: "#9ca3af" }}>
              {config.descripcion}
            </p>
            <p className="text-sm max-w-xl mx-auto" style={{ color: "#6b7280" }}>
              {config.detalle}
            </p>
          </motion.div>

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex gap-3 justify-center flex-wrap mt-10"
          >
            {[
              { key: "all", label: "Todas" },
              { key: "arriendo", label: "Arriendo" },
              { key: "venta", label: "Venta" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className="px-6 py-2.5 rounded-full font-medium transition-all hover:scale-105 text-sm"
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
        </div>
      </section>

      {/* Propiedades */}
      <section className="pb-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="flex items-center justify-between">
            <div
              className="px-6 py-3 rounded-2xl"
              style={{ backgroundColor: "#262525" }}
            >
              <span className="text-2xl font-bold" style={{ color: "#ecb337" }}>
                {filtered.length}
              </span>
              <span className="ml-2 text-sm" style={{ color: "#9ca3af" }}>
                propiedades en {config.nombre}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => scrollCarousel("left")}
                className="p-3 rounded-full transition-all hover:scale-110"
                style={{ backgroundColor: "#262525", color: "#ecb337" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                className="p-3 rounded-full transition-all hover:scale-110"
                style={{ backgroundColor: "#ecb337", color: "#161616" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 rounded-full"
              style={{ borderColor: "#262525", borderTopColor: "#ecb337" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 px-4">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-xl mb-2" style={{ color: "#9ca3af" }}>
              No hay propiedades disponibles en {config.nombre} aún
            </p>
            <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
              Escríbenos por WhatsApp y te ayudamos a encontrar lo que buscas
            </p>
            <a
              href={`https://wa.me/573195227378?text=Hola, busco una propiedad en ${config.nombre}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
            >
              💬 Consultar disponibilidad
            </a>
          </div>
        ) : (
          <div className="relative">
            <div
              className="hidden sm:block absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #161616, transparent)" }}
            />
            <div
              ref={carouselRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 px-4 sm:px-12 lg:px-24"
              style={{
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {filtered.map((property, index) => (
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
              className="hidden sm:block absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, #161616, transparent)" }}
            />
          </div>
        )}
      </section>

      {/* CTA WhatsApp */}
      <section className="py-16 px-4 sm:px-6" style={{ backgroundColor: "#1a1a1a" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "#b3b3b3" }}>
            ¿No encontraste lo que buscas en{" "}
            <span style={{ color: "#ecb337" }}>{config.nombre}</span>?
          </h2>
          <p className="mb-6 text-sm" style={{ color: "#9ca3af" }}>
            Cuéntanos qué necesitas y te buscamos la propiedad ideal
          </p>
          <a
            href={`https://wa.me/573195227378?text=Hola, estoy buscando una propiedad en ${config.nombre}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all hover:scale-105"
          >
            💬 Escríbenos por WhatsApp
          </a>
        </div>
      </section>

      {/* Footer mínimo */}
      <footer className="py-8 px-4 text-center" style={{ backgroundColor: "#0d0d0d" }}>
        <p className="text-xs" style={{ color: "#6b7280" }}>
          © 2025 InterRenta · Agencia Inmobiliaria Oriente Antioqueño ·{" "}
          <a href="/" className="hover:text-[#ecb337] transition-colors">
            Inicio
          </a>
        </p>
      </footer>
    </div>
  );
}
