/**
 * StatsCounter.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Banda de números animados que cuentan desde 0 al entrar en viewport.
 *   • "Propiedades" usa el conteo REAL recibido por props.
 *   • Las demás métricas son verificables (municipios cubiertos, compromiso).
 *     → Ajusta los valores en STATS si InterRenta tiene cifras oficiales.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function Counter({ to, suffix = "", duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    let startTs;
    const step = (ts) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

export default function StatsCounter({ propertyCount = 0 }) {
  const stats = [
    { to: Math.max(propertyCount, 1), suffix: "+", label: "Propiedades activas" },
    { to: 4, suffix: "", label: "Municipios del Oriente" },
    { to: 100, suffix: "%", label: "Acompañamiento personalizado" },
  ];

  return (
    <section
      className="py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "rgba(236,179,55,0.06)", filter: "blur(120px)" }}
      />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="text-center"
              style={{
                borderLeft:
                  i === 0 ? "none" : "1px solid rgba(236,179,55,0.12)",
              }}
            >
              <div
                className="font-bold mb-2"
                style={{
                  color: "#ecb337",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(2.8rem, 6vw, 4.2rem)",
                  lineHeight: 1,
                  fontWeight: 400,
                }}
              >
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <p
                className="text-sm sm:text-base"
                style={{
                  color: "#b8bcc8",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
