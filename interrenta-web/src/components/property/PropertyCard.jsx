import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const statusConfig = {
  disponible: {
    color: "bg-emerald-500",
    label: "Disponible",
    glow: "shadow-emerald-500/30",
  },
  reservado: {
    color: "bg-amber-500",
    label: "Reservado",
    glow: "shadow-amber-500/30",
  },
  no_disponible: {
    color: "bg-red-500",
    label: "No disponible",
    glow: "shadow-red-500/30",
  },
};

export default function PropertyCard({ property, index = 0 }) {
  const status = statusConfig[property.status] || statusConfig.disponible;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="w-full flex-shrink-0 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group"
      style={{ backgroundColor: "#262525" }}
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
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #262525, #161616)" }}
          >
            <svg
              className="w-16 h-16"
              style={{ color: "#6e3c1b" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
        )}

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge de estado */}
        <div className="absolute top-4 left-4 z-10">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur ${status.glow} shadow-lg`}
          >
            <span
              className={`w-2 h-2 rounded-full ${status.color} animate-pulse`}
            />
            <span className="text-xs font-semibold text-gray-800">
              {status.label}
            </span>
          </div>
        </div>

        {/* Badge tipo contrato */}
        <div className="absolute top-4 right-4 z-10">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: "#ecb337", color: "#161616" }}
          >
            {property.contract_type === "arriendo" ? "🏠 Arriendo" : "🏷️ Venta"}
          </span>
        </div>

        {/* Código de propiedad */}
        {property.code && (
          <div className="absolute bottom-4 left-4 z-10">
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{
                backgroundColor: "rgba(22, 22, 22, 0.9)",
                color: "#ecb337",
              }}
            >
              {property.code}
            </span>
          </div>
        )}

        {/* Botón Ver más fotos (Instagram) - si existe */}
        {property.instagram_url && (
          <a
            href={property.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all hover:scale-105 opacity-0 group-hover:opacity-100"
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              color: "#161616",
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
            </svg>
            Más fotos
          </a>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6">
        <div className="mb-3">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#d7af4d" }}
          >
            {property.property_type}
          </span>
        </div>

        <h3
          className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-[#d7af4d] transition-colors"
          style={{ color: "#b3b3b3" }}
        >
          {property.title}
        </h3>

        {(property.sector || property.address) && (
          <p
            className="text-sm mb-4 flex items-center gap-1 line-clamp-1"
            style={{ color: "#9ca3af" }}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {property.sector}
            {property.subsector ? `, ${property.subsector}` : ""}
          </p>
        )}

        {/* Características */}
        <div
          className="flex items-center gap-4 mb-4 text-sm"
          style={{ color: "#9ca3af" }}
        >
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
        <div
          className="flex items-end justify-between pt-4 mb-4"
          style={{ borderTop: "1px solid #3a3a3a" }}
        >
          <div>
            <span className="text-2xl font-bold" style={{ color: "#ecb337" }}>
              ${property.price?.toLocaleString()}
            </span>
            {property.contract_type === "arriendo" && (
              <span className="text-sm ml-1" style={{ color: "#9ca3af" }}>
                /mes
              </span>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          {/* Botón WhatsApp */}
          <a
            href={`https://wa.me/573195227378?text=Hola, me interesa la propiedad ${
              property.code || ""
            }: ${property.title}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold text-center text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>💬</span> WhatsApp
          </a>

          {/* Botón Ver más */}
          <Link
            to={`/propiedades/${property.code}`}
            className="flex-1 py-3 rounded-xl font-semibold text-center text-sm transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: "#3a3a3a", color: "#ecb337" }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#ecb337";
              e.target.style.color = "#161616";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#3a3a3a";
              e.target.style.color = "#ecb337";
            }}
          >
            Ver más →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
