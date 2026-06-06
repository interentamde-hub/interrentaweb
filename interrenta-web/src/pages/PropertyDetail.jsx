/**
 * PropertyDetail.jsx — InterRenta (rediseño premium)
 * ──────────────────────────────────────────────────────────────────────────────
 *   • Hero full-bleed cinematográfico con la portada de la propiedad.
 *   • Layout tipo revista: descripción + características a la izquierda,
 *     tarjeta de contacto STICKY a la derecha (desktop).
 *   • Tipografías de marca (Cormorant Garamond + Inter) y paleta corregida.
 *   • Toda la lógica de datos (getPropertyByCode) permanece intacta.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getPropertyByCode } from "../services/property.service";
import Navbar from "../components/layout/Navbar";

const WA_NUMBER = "573195227378";

const statusConfig = {
  disponible: { dot: "#10b981", label: "Disponible" },
  reservado: { dot: "#f59e0b", label: "Reservado" },
  no_disponible: { dot: "#ef4444", label: "No disponible" },
};

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Inter', sans-serif";

export default function PropertyDetail() {
  const { code } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await getPropertyByCode(code);
        if (fetchError) throw fetchError;
        if (!data) throw new Error("Propiedad no encontrada");
        if (active) setProperty(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [code]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#161616" }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 rounded-full"
            style={{ borderColor: "#262525", borderTopColor: "#ecb337" }}
          />
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !property) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#161616" }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <span className="text-6xl mb-4">🏠</span>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#e2e2e2", fontFamily: SERIF }}>
            Propiedad no encontrada
          </h1>
          <p className="mb-6" style={{ color: "#b8bcc8", fontFamily: SANS }}>
            {error || "El código de propiedad no existe"}
          </p>
          <Link
            to="/"
            data-cursor="hover"
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: "#ecb337", color: "#161616", fontFamily: SANS }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[property.status] || statusConfig.disponible;
  const location =
    property.address ||
    `${property.sector || ""}${property.subsector ? `, ${property.subsector}` : ""}`;

  const features = [
    property.bedrooms && { icon: "🛏️", value: property.bedrooms, label: property.bedrooms === 1 ? "Habitación" : "Habitaciones" },
    property.bathrooms && { icon: "🚿", value: property.bathrooms, label: property.bathrooms === 1 ? "Baño" : "Baños" },
    property.area && { icon: "📐", value: property.area, label: "m² de área" },
  ].filter(Boolean);

  const waVisit = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hola, me interesa la propiedad ${property.code}: ${property.title}. ¿Podemos agendar una visita?`,
  )}`;
  const waInfo = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hola, me interesa la propiedad ${property.code}: ${property.title}.`,
  )}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#161616" }}>
      <Navbar />

      {/* ═══ HERO FULL-BLEED ═════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ height: "clamp(440px, 72vh, 760px)" }}>
        {property.cover_url ? (
          <img
            src={property.cover_url}
            alt={`${property.title} – ${property.sector || "InterRenta"}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(150deg, #262525, #161616 60%, #0d4447 170%)" }}
          >
            <span className="text-8xl opacity-30">🏠</span>
          </div>
        )}

        {/* Velo para legibilidad */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(13,13,13,0.96) 0%, rgba(13,13,13,0.45) 40%, rgba(13,13,13,0.25) 70%, rgba(13,13,13,0.55) 100%)",
          }}
        />

        {/* Instagram — ver más fotos */}
        {property.instagram_url && (
          <a
            href={property.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="absolute top-24 right-4 sm:right-8 z-10 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105 backdrop-blur"
            style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "#161616", fontFamily: SANS }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
            </svg>
            Más fotos
          </a>
        )}

        {/* Contenido del hero */}
        <div className="absolute inset-x-0 top-0 px-4 sm:px-8 pt-24">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center gap-2 text-sm" style={{ color: "#d4d4d4", fontFamily: SANS }}>
              <Link to="/" data-cursor="hover" className="hover:text-[#ecb337] transition-colors">Inicio</Link>
              <span>/</span>
              <Link to="/#propiedades" data-cursor="hover" className="hover:text-[#ecb337] transition-colors">Propiedades</Link>
              <span>/</span>
              <span style={{ color: "#ecb337" }}>{property.code}</span>
            </nav>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-0 px-4 sm:px-8 pb-8 sm:pb-12"
        >
          <div className="max-w-6xl mx-auto">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur"
                style={{ backgroundColor: "rgba(22,22,22,0.7)", color: "#e2e2e2", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: status.dot }} />
                {status.label}
              </span>
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{ backgroundColor: "#ecb337", color: "#161616" }}
              >
                {property.contract_type === "arriendo" ? "🏠 Arriendo" : "🏷️ Venta"}
              </span>
              {property.property_type && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-medium capitalize backdrop-blur"
                  style={{ backgroundColor: "rgba(22,22,22,0.7)", color: "#ecb337", border: "1px solid rgba(236,179,55,0.25)" }}
                >
                  {property.property_type}
                </span>
              )}
            </div>

            <h1
              className="font-bold mb-3 max-w-4xl"
              style={{
                color: "#ffffff",
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)",
                lineHeight: 1.05,
                textShadow: "0 2px 40px rgba(0,0,0,0.7)",
              }}
            >
              {property.title}
            </h1>

            {location && (
              <p className="flex items-center gap-2 text-base sm:text-lg" style={{ color: "#d4d4d4", fontFamily: SANS }}>
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#ecb337" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </p>
            )}
          </div>
        </motion.div>
      </section>

      {/* ═══ CUERPO: descripción + tarjeta sticky ════════════════════════════ */}
      <section className="px-4 sm:px-8 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Características */}
            {features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="grid grid-cols-3 gap-3 sm:gap-4"
              >
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="text-center p-4 sm:p-6 rounded-2xl"
                    style={{ backgroundColor: "#262525", border: "1px solid rgba(236,179,55,0.08)" }}
                  >
                    <div className="text-2xl sm:text-3xl mb-2">{f.icon}</div>
                    <div className="text-xl sm:text-2xl font-bold" style={{ color: "#e2e2e2", fontFamily: SERIF }}>
                      {f.value}
                    </div>
                    <div className="text-xs sm:text-sm" style={{ color: "#b8bcc8", fontFamily: SANS }}>
                      {f.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Descripción */}
            {property.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="p-6 sm:p-8 rounded-3xl"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(236,179,55,0.1)" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span style={{ color: "#ecb337", fontSize: "1.1rem" }}>✦</span>
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#e2e2e2", fontFamily: SERIF, fontWeight: 400 }}>
                    Sobre esta propiedad
                  </h2>
                </div>
                <p
                  className="leading-relaxed whitespace-pre-line text-base sm:text-lg"
                  style={{ color: "#b8bcc8", fontFamily: SANS, lineHeight: 1.8 }}
                >
                  {property.description}
                </p>
              </motion.div>
            )}

            {/* Ubicación / ficha */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              className="p-6 sm:p-8 rounded-3xl"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(236,179,55,0.1)" }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-5" style={{ color: "#e2e2e2", fontFamily: SERIF, fontWeight: 400 }}>
                Ficha técnica
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  property.code && ["Código", property.code],
                  property.property_type && ["Tipo", property.property_type],
                  property.contract_type && ["Operación", property.contract_type === "arriendo" ? "Arriendo" : "Venta"],
                  property.sector && ["Sector", property.sector],
                  property.subsector && ["Subsector", property.subsector],
                  property.area && ["Área", `${property.area} m²`],
                ]
                  .filter(Boolean)
                  .map(([k, v], i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 py-2"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <dt className="text-sm" style={{ color: "#9aa0ad", fontFamily: SANS }}>{k}</dt>
                      <dd className="text-sm font-medium capitalize text-right" style={{ color: "#e2e2e2", fontFamily: SANS }}>{v}</dd>
                    </div>
                  ))}
              </dl>
            </motion.div>
          </div>

          {/* Tarjeta sticky de contacto */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-3xl overflow-hidden"
                style={{ backgroundColor: "#1f1f1f", border: "1px solid rgba(236,179,55,0.18)" }}
              >
                <div className="p-6 sm:p-7">
                  {/* Precio */}
                  <div className="mb-5">
                    <span className="text-xs uppercase tracking-widest" style={{ color: "#9aa0ad", fontFamily: SANS }}>
                      {property.contract_type === "arriendo" ? "Canon mensual" : "Precio de venta"}
                    </span>
                    <div className="flex items-end gap-1 mt-1">
                      <span className="font-bold" style={{ color: "#ecb337", fontFamily: SERIF, fontSize: "clamp(2.2rem, 5vw, 3rem)", lineHeight: 1 }}>
                        ${property.price?.toLocaleString()}
                      </span>
                      {property.contract_type === "arriendo" && (
                        <span className="text-base mb-1" style={{ color: "#b8bcc8", fontFamily: SANS }}>/mes</span>
                      )}
                    </div>
                  </div>

                  <div className="h-px w-full mb-5" style={{ background: "rgba(236,179,55,0.15)" }} />

                  {/* Mini características */}
                  {features.length > 0 && (
                    <div className="flex items-center justify-around mb-6 text-center">
                      {features.map((f, i) => (
                        <div key={i}>
                          <div className="text-lg">{f.icon}</div>
                          <div className="text-base font-bold" style={{ color: "#e2e2e2", fontFamily: SANS }}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botones */}
                  <a
                    href={waVisit}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold mb-3 transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: "#25D366", color: "#fff", fontFamily: SANS }}
                  >
                    <span>💬</span> Agendar visita
                  </a>
                  <a
                    href={waInfo}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold mb-3 transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: "rgba(236,179,55,0.12)", color: "#ecb337", border: "1px solid rgba(236,179,55,0.3)", fontFamily: SANS }}
                  >
                    Solicitar información
                  </a>
                  {property.instagram_url && (
                    <a
                      href={property.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="hover"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold transition-all hover:scale-[1.02]"
                      style={{ backgroundColor: "#262525", color: "#e2e2e2", fontFamily: SANS }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                      </svg>
                      Ver más fotos
                    </a>
                  )}

                  <p className="text-center text-xs mt-5" style={{ color: "#6b7280", fontFamily: SANS }}>
                    Respuesta inmediata por WhatsApp
                  </p>
                </div>
              </motion.div>

              <Link
                to="/#propiedades"
                data-cursor="hover"
                className="block text-center mt-4 text-sm transition-colors hover:text-[#ecb337]"
                style={{ color: "#9aa0ad", fontFamily: SANS }}
              >
                ← Ver más propiedades
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-14 text-center"
            style={{ background: "linear-gradient(135deg, #1a1a1a, #262525)" }}
          >
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
              style={{ background: "rgba(236,179,55,0.1)", filter: "blur(90px)" }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#e2e2e2", fontFamily: SERIF, fontWeight: 300 }}>
                ¿Te interesa <span style={{ color: "#ecb337" }}>esta propiedad?</span>
              </h2>
              <p className="mb-8 max-w-xl mx-auto" style={{ color: "#b8bcc8", fontFamily: SANS }}>
                Contáctanos y te acompañamos en todo el proceso, sin compromiso.
              </p>
              <a
                href={waVisit}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: "#25D366", color: "#fff", fontFamily: SANS }}
              >
                <span>💬</span> Agendar visita por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid #262525" }}>
        <div className="max-w-6xl mx-auto text-center">
          <Link to="/" data-cursor="hover" className="font-bold text-2xl" style={{ color: "#ecb337", fontFamily: SERIF }}>
            InterRenta
          </Link>
          <p className="text-sm mt-2" style={{ color: "#6b7280", fontFamily: SANS }}>
            © 2025 InterRenta. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
