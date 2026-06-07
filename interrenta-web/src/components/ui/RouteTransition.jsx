/**
 * RouteTransition.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Transición entre páginas + scroll-to-top en cada cambio de ruta.
 *
 * Estrategia segura (no envuelve el contenido en transform → no rompe el
 * position:sticky / ScrollTrigger del CinematicHero):
 *   • Al cambiar el pathname se monta una cortina fija que arranca opaca
 *     (cubre el cambio instantáneo de contenido) y se desvanece.
 *   • Mientras está cubierto, hace scroll al tope.
 *   • Las navegaciones por hash (#propiedades) NO disparan la cortina.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { scrollToTop } from "../../lib/lenis";

export default function RouteTransition({ logoSrc }) {
  const { pathname } = useLocation();
  const [covering, setCovering] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Patrón intencional: la cortina se dispara al cambiar de ruta (evento externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCovering(true);
    // Salto inmediato al tope mientras la cortina cubre (compatible con Lenis)
    scrollToTop(true);
    const t = setTimeout(() => setCovering(false), 480);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {covering && (
        <motion.div
          key={pathname}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99000,
            background: "linear-gradient(160deg, #0d0d0d, #161616)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {logoSrc && (
            <motion.img
              src={logoSrc}
              alt="InterRenta"
              initial={{ opacity: 0.9, scale: 0.96 }}
              animate={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                height: "clamp(40px, 9vw, 64px)",
                width: "auto",
                filter: "drop-shadow(0 6px 30px rgba(0,0,0,0.6))",
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
