/**
 * AISearchBar.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Buscador conversacional de entrada: "Describe lo que buscas".
 *   • Al enviar, hace scroll al asistente y le inyecta el texto (llama al API).
 *   • Incluye ejemplos en chips para guiar al cliente.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion } from "framer-motion";

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Inter', sans-serif";

const EXAMPLES = [
  "Arriendo en Rionegro, 3 alcobas",
  "Casa en venta en El Retiro",
  "Apartamento hasta $1.500.000",
];

export default function AISearchBar({ onSubmit }) {
  const [q, setQ] = useState("");

  const submit = (text) => {
    const t = (text ?? q).trim();
    if (!t) return;
    onSubmit?.(t);
    setQ("");
  };

  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16" style={{ backgroundColor: "#161616" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl mx-auto text-center"
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-5"
          style={{
            backgroundColor: "rgba(236, 179, 55, 0.1)",
            color: "#ecb337",
            border: "1px solid rgba(236, 179, 55, 0.3)",
            fontFamily: SANS,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontSize: "0.72rem",
          }}
        >
          ✦ Asistente con IA
        </span>

        <h2
          className="text-3xl sm:text-4xl md:text-5xl mb-4"
          style={{ color: "#e2e2e2", fontFamily: SERIF, fontWeight: 300, letterSpacing: "-0.01em" }}
        >
          Describe lo que <span style={{ color: "#ecb337" }}>buscas</span>
        </h2>
        <p className="mb-8 max-w-xl mx-auto" style={{ color: "#b8bcc8", fontFamily: SANS }}>
          Cuéntanos en tus palabras y nuestro asistente te recomienda las propiedades que mejor encajan con tu presupuesto.
        </p>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="relative flex flex-col sm:flex-row gap-3 mb-5"
        >
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ej: arriendo en Rionegro, 3 alcobas, hasta $2.000.000"
            className="w-full px-6 py-4 sm:py-5 rounded-2xl text-base focus:outline-none transition-all"
            style={{
              backgroundColor: "rgba(38, 37, 37, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(236, 179, 55, 0.25)",
              color: "#e2e2e2",
              fontSize: "16px",
              fontFamily: SANS,
            }}
          />
          <button
            type="submit"
            data-cursor="hover"
            className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 inline-flex items-center justify-center gap-2 px-6 py-4 sm:py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: "#ecb337", color: "#161616", fontFamily: SANS }}
          >
            Preguntar
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>

        {/* Ejemplos */}
        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-xs self-center mr-1" style={{ color: "#6b7280", fontFamily: SANS }}>
            Prueba:
          </span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => submit(ex)}
              data-cursor="hover"
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: "rgba(38, 37, 37, 0.8)",
                color: "#d4d4d4",
                border: "1px solid rgba(236, 179, 55, 0.15)",
                fontFamily: SANS,
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
