import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/layout/Navbar";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ backgroundColor: "#161616" }}
    >
      <Helmet>
        <title>Página no encontrada – InterRenta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-lg">

          {/* Número 404 animado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          >
            <div
              className="text-[10rem] sm:text-[14rem] font-black leading-none select-none"
              style={{
                background: "linear-gradient(135deg, #ecb337, #6e3c1b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              404
            </div>
          </motion.div>

          {/* Mensaje */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1
              className="text-2xl sm:text-3xl font-bold mb-3"
              style={{ color: "#b3b3b3" }}
            >
              Esta página no existe
            </h1>
            <p className="mb-8 text-sm sm:text-base" style={{ color: "#6b7280" }}>
              La propiedad o página que buscas no está disponible. Puede que haya sido retirada o que la URL sea incorrecta.
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={{ backgroundColor: "#ecb337", color: "#161616" }}
              >
                🏠 Volver al inicio
              </Link>
              <a
                href="https://wa.me/573195227378?text=Hola, busco una propiedad en InterRenta."
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 bg-green-500 text-white hover:bg-green-600"
              >
                💬 Contactar por WhatsApp
              </a>
            </div>

            {/* Links rápidos a municipios */}
            <div className="mt-10">
              <p className="text-xs mb-4 uppercase tracking-widest" style={{ color: "#6b7280" }}>
                Busca por municipio
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { slug: "rionegro", label: "🏙️ Rionegro" },
                  { slug: "envigado", label: "🌿 Envigado" },
                  { slug: "el-retiro", label: "🏡 El Retiro" },
                  { slug: "san-vicente", label: "🌄 San Vicente" },
                ].map((m) => (
                  <Link
                    key={m.slug}
                    to={`/${m.slug}`}
                    className="px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                    style={{
                      backgroundColor: "#262525",
                      color: "#9ca3af",
                      border: "1px solid rgba(236,179,55,0.15)",
                    }}
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer mínimo */}
      <footer className="py-6 text-center" style={{ backgroundColor: "#0d0d0d" }}>
        <p className="text-xs" style={{ color: "#6b7280" }}>
          © 2025 InterRenta · Agencia Inmobiliaria Oriente Antioqueño
        </p>
      </footer>
    </div>
  );
}
