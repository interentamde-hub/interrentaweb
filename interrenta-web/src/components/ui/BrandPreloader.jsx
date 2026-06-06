/**
 * BrandPreloader.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Splash de marca que se muestra UNA sola vez por sesión (sessionStorage):
 *   • Fondo oscuro a pantalla completa.
 *   • Logo aparece con fade + scale, regla dorada se traza debajo.
 *   • Al terminar, la cortina sube revelando el sitio.
 *   • Bloquea el scroll mientras está activo.
 *
 * No reaparece en navegaciones internas dentro de la misma pestaña.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HOLD_MS = 2100;

export default function BrandPreloader({ logoSrc }) {
  const [done, setDone] = useState(
    () =>
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("ir_preloaded") === "1",
  );

  useEffect(() => {
    if (done) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      window.sessionStorage.setItem("ir_preloaded", "1");
      setDone(true);
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [done]);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="ir-preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "linear-gradient(160deg, #0d0d0d 0%, #161616 60%, #1a1a1a 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Glow dorado de fondo */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 520,
              height: 520,
              borderRadius: "50%",
              background: "rgba(236, 179, 55, 0.10)",
              filter: "blur(120px)",
              pointerEvents: "none",
            }}
          />

          {/* Logo */}
          {logoSrc && (
            <motion.img
              src={logoSrc}
              alt="InterRenta"
              initial={{ opacity: 0, scale: 0.86, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: "clamp(54px, 12vw, 92px)",
                width: "auto",
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.6))",
              }}
            />
          )}

          {/* Regla dorada que se traza */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: "1.4rem",
              width: "min(58vw, 220px)",
              height: 1,
              transformOrigin: "center",
              background:
                "linear-gradient(90deg, transparent, #ecb337 30%, #f5d170 50%, #ecb337 70%, transparent)",
              position: "relative",
              zIndex: 1,
            }}
          />

          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{
              marginTop: "1.1rem",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.62rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(236, 179, 55, 0.75)",
              position: "relative",
              zIndex: 1,
            }}
          >
            Bienes Raíces
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
