/**
 * ZonesSection.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * "Explora por zona" — tarjetas grandes de cada municipio del Oriente
 * Antioqueño que enlazan a las páginas /rionegro, /envigado, etc.
 *
 *   • Usa como fondo la PORTADA REAL de una propiedad de esa zona
 *     (busca en el array `properties`); si no hay, cae a un gradiente.
 *   • Muestra el conteo real de propiedades por zona.
 *   • Hover: zoom de imagen, borde dorado, flecha que avanza (parallax sutil).
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ZONES = [
  { slug: "rionegro", nombre: "Rionegro", keyword: "rionegro", desc: "Dinámica y conectada", emoji: "🏙️" },
  { slug: "envigado", nombre: "Envigado", keyword: "envigado", desc: "Calidad de vida", emoji: "🌿" },
  { slug: "el-retiro", nombre: "El Retiro", keyword: "retiro", desc: "Exclusiva y campestre", emoji: "🏡" },
  { slug: "san-vicente", nombre: "San Vicente", keyword: "san vicente", desc: "Naturaleza y calma", emoji: "🌄" },
];

function matchZone(properties, keyword) {
  const k = keyword.toLowerCase();
  return (properties || []).filter((p) => {
    const sector = (p.sector || "").toLowerCase();
    const subsector = (p.subsector || "").toLowerCase();
    const address = (p.address || "").toLowerCase();
    return sector.includes(k) || subsector.includes(k) || address.includes(k);
  });
}

export default function ZonesSection({ properties = [] }) {
  return (
    <section
      className="py-16 sm:py-24 px-4 sm:px-6 relative"
      style={{ backgroundColor: "#161616" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
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
            Dónde estamos
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl mb-4"
            style={{
              color: "#e2e2e2",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300,
              letterSpacing: "-0.01em",
            }}
          >
            Explora por <span style={{ color: "#ecb337" }}>zona</span>
          </motion.h2>
          <p
            className="max-w-2xl mx-auto"
            style={{ color: "#b8bcc8", fontFamily: "'Inter', sans-serif" }}
          >
            Cobertura en los municipios más buscados del Oriente Antioqueño
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ZONES.map((zone, i) => {
            const matches = matchZone(properties, zone.keyword);
            const cover = matches.find((p) => p.cover_url)?.cover_url || null;
            const count = matches.length;

            return (
              <motion.div
                key={zone.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              >
                <Link
                  to={`/${zone.slug}`}
                  className="group relative block overflow-hidden rounded-3xl"
                  style={{
                    height: "clamp(300px, 42vw, 380px)",
                    border: "1px solid rgba(236,179,55,0.12)",
                  }}
                  data-cursor="hover"
                >
                  {/* Fondo: imagen real o gradiente */}
                  {cover ? (
                    <img
                      src={cover}
                      alt={`Propiedades en ${zone.nombre}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(150deg, #262525 0%, #1a1a1a 60%, #0d4447 160%)",
                      }}
                    >
                      <span className="text-7xl opacity-30 transition-transform duration-700 group-hover:scale-110">
                        {zone.emoji}
                      </span>
                    </div>
                  )}

                  {/* Velo oscuro para legibilidad */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(13,13,13,0.92) 0%, rgba(13,13,13,0.35) 45%, rgba(13,13,13,0.12) 100%)",
                    }}
                  />

                  {/* Badge conteo */}
                  <div className="absolute top-4 right-4">
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur"
                      style={{
                        backgroundColor: "rgba(22,22,22,0.7)",
                        color: "#ecb337",
                        border: "1px solid rgba(236,179,55,0.25)",
                      }}
                    >
                      {count} {count === 1 ? "propiedad" : "propiedades"}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="text-2xl mb-1">{zone.emoji}</div>
                    <h3
                      className="text-2xl sm:text-3xl font-bold mb-1"
                      style={{
                        color: "#ffffff",
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontWeight: 400,
                        textShadow: "0 2px 20px rgba(0,0,0,0.6)",
                      }}
                    >
                      {zone.nombre}
                    </h3>
                    <p
                      className="text-sm mb-3"
                      style={{
                        color: "#d4d4d4",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {zone.desc}
                    </p>
                    <span
                      className="inline-flex items-center gap-2 text-sm font-semibold"
                      style={{ color: "#ecb337", fontFamily: "'Inter', sans-serif" }}
                    >
                      Ver propiedades
                      <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                        →
                      </span>
                    </span>
                  </div>

                  {/* Borde dorado en hover */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: "inset 0 0 0 1.5px rgba(236,179,55,0.6)" }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
