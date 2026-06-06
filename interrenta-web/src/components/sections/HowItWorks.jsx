/**
 * HowItWorks.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * "Cómo funciona" — 3 pasos animados (Explora → Agenda → Firma) con número
 * grande, ícono, y una línea conectora que se traza al entrar en viewport.
 * Reduce fricción explicando el proceso a clientes nuevos.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Explora",
    desc: "Navega el catálogo y filtra por zona, tipo y presupuesto hasta encontrar lo que buscas.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Agenda tu visita",
    desc: "Escríbenos por WhatsApp y coordinamos una visita sin compromiso, en el horario que prefieras.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Firma con confianza",
    desc: "Te acompañamos en cada paso del proceso, con transparencia total, hasta la entrega de llaves.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      className="py-16 sm:py-24 px-4 sm:px-6 relative"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
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
            Proceso simple
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
            }}
          >
            Cómo <span style={{ color: "#ecb337" }}>funciona</span>
          </motion.h2>
          <p
            className="max-w-2xl mx-auto"
            style={{ color: "#b8bcc8", fontFamily: "'Inter', sans-serif" }}
          >
            Tres pasos para encontrar tu próximo hogar
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8 md:gap-6">
          {/* Línea conectora (desktop) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
            className="hidden md:block absolute left-[16%] right-[16%] top-10"
            style={{
              height: 1,
              transformOrigin: "left center",
              background:
                "linear-gradient(90deg, rgba(236,179,55,0.4), rgba(236,179,55,0.15))",
            }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              className="relative text-center"
            >
              {/* Círculo con ícono */}
              <div
                className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "linear-gradient(135deg, #262525, #1e1e1e)",
                  border: "1px solid rgba(236,179,55,0.25)",
                  color: "#ecb337",
                }}
              >
                {step.icon}
                <span
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: "#ecb337", color: "#161616" }}
                >
                  {step.n}
                </span>
              </div>

              <h3
                className="text-xl sm:text-2xl font-bold mb-3"
                style={{
                  color: "#e2e2e2",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 400,
                }}
              >
                {step.title}
              </h3>
              <p
                className="leading-relaxed max-w-xs mx-auto"
                style={{ color: "#b8bcc8", fontFamily: "'Inter', sans-serif" }}
              >
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
