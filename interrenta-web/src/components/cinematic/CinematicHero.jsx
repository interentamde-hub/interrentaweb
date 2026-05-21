/**
 * CinematicHero.jsx — InterRenta Scrollytelling
 * UBICACIÓN: src/components/cinematic/CinematicHero.jsx
 *
 * CORRECCIONES v2:
 *  - query:'?url' + import:'default' → Vite retorna el string de URL directamente
 *  - containerHeight cacheado en ref para evitar reflow en cada scroll
 *  - totalH calculado en useEffect (nunca en nivel de módulo)
 *  - Panel de debug visible en pantalla hasta que frames > 0
 *  - Performance: sin getBoundingClientRect() en el hot path
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// GLOB IMPORTS — query:'?url' + import:'default' es la forma correcta en Vite 4+
// Vite retorna el URL del asset como string directamente (sin necesitar .default)
// Las rutas /src/... son absolutas desde la raíz del proyecto Vite.
// ─────────────────────────────────────────────────────────────────────────────
const fase1Raw = import.meta.glob("/src/assets/FaseScroll1/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});
const fase2Raw = import.meta.glob("/src/assets/FaseScroll2/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});

// Ordena por nombre de archivo (001, 002, 003...)
const FASE1 = Object.keys(fase1Raw)
  .sort()
  .map((k) => fase1Raw[k])
  .filter(Boolean);
const FASE2 = Object.keys(fase2Raw)
  .sort()
  .map((k) => fase2Raw[k])
  .filter(Boolean);
const ALL_FRAMES = [...FASE1, ...FASE2];
const TOTAL = ALL_FRAMES.length; // debe ser 137

// Velocidad: px de scroll por frame (85 → ~11 600 px total de scroll)
const PX_PER_FRAME = 85;

// ─────────────────────────────────────────────────────────────────────────────
// TEXT OVERLAYS
// start/end son índices de frame (0-based sobre ALL_FRAMES)
// ─────────────────────────────────────────────────────────────────────────────
const OVERLAYS = [
  {
    id: "o1",
    start: 0,
    end: 18,
    title: "Donde los sueños",
    sub: "toman forma",
    align: "center",
  },
  {
    id: "o2",
    start: 22,
    end: 42,
    title: "Construido con visión",
    sub: "cada detalle importa",
    align: "left",
  },
  {
    id: "o3",
    start: 46,
    end: 61,
    title: "La arquitectura",
    sub: "como expresión de vida",
    align: "right",
  },
  {
    id: "o4",
    start: 65,
    end: 88,
    title: "Bienvenido",
    sub: "a tu nuevo hogar",
    align: "center",
  },
  {
    id: "o5",
    start: 95,
    end: 115,
    title: "Cada espacio cuenta",
    sub: "diseñado para vivir",
    align: "left",
  },
  {
    id: "o6",
    start: 120,
    end: TOTAL - 1,
    title: "InterRenta",
    sub: "Tu aliado en bienes raíces",
    align: "center",
  },
];

const ALIGN = {
  left: { textAlign: "left", left: "8%", right: "auto", maxWidth: "50%" },
  right: { textAlign: "right", left: "auto", right: "8%", maxWidth: "50%" },
  center: { textAlign: "center", left: 0, right: 0, maxWidth: "100%" },
};

export default function CinematicHero({ logoSrc }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]); // Image objects precargados
  const curFrameRef = useRef(0);
  const rafRef = useRef(null);
  const lastDrawnRef = useRef(-1);
  const containerTopRef = useRef(0); // offsetTop cacheado (evita reflow)
  const containerHRef = useRef(0); // offsetHeight cacheado

  const [activeOverlay, setActiveOverlay] = useState(OVERLAYS[0]);
  const [scrollPct, setScrollPct] = useState(0);
  const [showScroll, setShowScroll] = useState(true);
  const [totalH, setTotalH] = useState(900); // se actualiza en effect

  // ── DEBUG: panel en pantalla hasta que los frames carguen ─────────────────
  const [debugInfo] = useState({
    fase1: FASE1.length,
    fase2: FASE2.length,
    total: TOTAL,
  });
  const showDebug = TOTAL < 2; // si no hay frames, muestra el panel

  // ── Calcula altura total del carril de scroll ──────────────────────────────
  useEffect(() => {
    const h = TOTAL * PX_PER_FRAME + window.innerHeight;
    setTotalH(h);
  }, []);

  // ── Cachea posición del contenedor (una sola vez + en resize) ─────────────
  const cacheContainerDimensions = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // offsetTop desde el documento (no getBoundingClientRect para evitar reflow)
    let top = 0;
    let node = el;
    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    containerTopRef.current = top;
    containerHRef.current = el.offsetHeight;
  }, []);

  // ── Dibuja un frame en el canvas ───────────────────────────────────────────
  const drawFrame = useCallback((idx) => {
    if (idx === lastDrawnRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = imagesRef.current[idx];
    if (!img?.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
    lastDrawnRef.current = idx;
  }, []);

  // ── Preload de imágenes ────────────────────────────────────────────────────
  useEffect(() => {
    if (TOTAL < 2) return; // no hay frames, no hacer nada
    const imgs = ALL_FRAMES.map((src, i) => {
      const img = new window.Image();
      img.src = src;
      if (i === 0) img.onload = () => drawFrame(0);
      return img;
    });
    imagesRef.current = imgs;
  }, [drawFrame]);

  // ── Resize del canvas ──────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      lastDrawnRef.current = -1;
      drawFrame(curFrameRef.current);
      cacheContainerDimensions();
      setTotalH(TOTAL * PX_PER_FRAME + window.innerHeight);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame, cacheContainerDimensions]);

  // Cachea dimensiones después de montar (el DOM está listo)
  useEffect(() => {
    // Pequeño delay para asegurar que el layout ya calculó el offsetTop
    const t = setTimeout(cacheContainerDimensions, 100);
    return () => clearTimeout(t);
  }, [cacheContainerDimensions, totalH]);

  // ── Scroll handler (sin reflow) ────────────────────────────────────────────
  useEffect(() => {
    if (TOTAL < 2) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrolled = window.scrollY - containerTopRef.current;
        const maxScroll = containerHRef.current - window.innerHeight;
        if (maxScroll <= 0 || scrolled < 0) return;

        const pct = Math.min(scrolled / maxScroll, 1);
        const fi = Math.min(Math.round(pct * (TOTAL - 1)), TOTAL - 1);

        drawFrame(fi);
        curFrameRef.current = fi;

        setScrollPct(pct);
        setShowScroll(pct < 0.04);

        const ov = OVERLAYS.find((o) => fi >= o.start && fi <= o.end) ?? null;
        setActiveOverlay(ov);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{ height: totalH, position: "relative" }}>
      {/* ── Sticky viewport ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#0a0a0a",
        }}
      >
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ display: "block", width: "100%", height: "100%" }}
        />

        {/* Vignette */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Gradiente inferior */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "35%",
            pointerEvents: "none",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
          }}
        />

        {/* Logo */}
        {logoSrc && (
          <div
            style={{
              position: "absolute",
              top: "1.5rem",
              left: "1.5rem",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <img
              src={logoSrc}
              alt="InterRenta"
              style={{
                height: 52,
                width: "auto",
                filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.7))",
              }}
            />
          </div>
        )}

        {/* ── Panel de DEBUG (solo visible si no hay frames) ──────────── */}
        {showDebug && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.85)",
              border: "1px solid #ecb337",
              borderRadius: 12,
              padding: "1.5rem 2rem",
              color: "#ecb337",
              fontFamily: "monospace",
              zIndex: 999,
              textAlign: "center",
              lineHeight: 1.8,
            }}
          >
            <p
              style={{
                fontSize: "1rem",
                marginBottom: "0.5rem",
                fontWeight: "bold",
              }}
            >
              ⚠ Debug: Frames no encontrados
            </p>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
              Fase 1: {debugInfo.fase1} frames
              <br />
              Fase 2: {debugInfo.fase2} frames
              <br />
              Total: {debugInfo.total}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginTop: "0.5rem",
              }}
            >
              Verifica las rutas en CinematicHero.jsx
            </p>
          </div>
        )}

        {/* ── Text overlay ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeOverlay && !showDebug && (
            <motion.div
              key={activeOverlay.id}
              initial={{ opacity: 0, y: 36, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -22, filter: "blur(10px)" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                bottom: "14%",
                zIndex: 10,
                padding: "0 2rem",
                pointerEvents: "none",
                ...ALIGN[activeOverlay.align ?? "center"],
              }}
            >
              <h2
                style={{
                  fontFamily:
                    "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                  fontSize: "clamp(2.6rem, 6.5vw, 5.8rem)",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.93)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.01em",
                  textShadow: "0 4px 50px rgba(0,0,0,0.65)",
                  margin: 0,
                }}
              >
                {activeOverlay.title}
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                  fontSize: "clamp(0.72rem, 1.6vw, 1rem)",
                  fontWeight: 300,
                  color: "rgba(236,179,55,0.88)",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  marginTop: "0.9rem",
                  textShadow: "0 2px 24px rgba(0,0,0,0.6)",
                }}
              >
                {activeOverlay.sub}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Barra de progreso ────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(255,255,255,0.08)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${scrollPct * 100}%`,
              background: "linear-gradient(90deg, #ecb337 0%, #f5d170 100%)",
              transition: "width 0.06s linear",
              boxShadow: "0 0 10px rgba(236,179,55,0.6)",
            }}
          />
        </div>

        {/* ── Scroll indicator ─────────────────────────────────────────── */}
        <AnimatePresence>
          {showScroll && !showDebug && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: "absolute",
                bottom: "3.5rem",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.6rem",
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.38)",
                }}
              >
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  width: 22,
                  height: 36,
                  borderRadius: 11,
                  border: "1.5px solid rgba(255,255,255,0.28)",
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 7,
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 7,
                    borderRadius: 2,
                    background: "rgba(236,179,55,0.55)",
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Indicador de fase ────────────────────────────────────────── */}
        {!showDebug && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "3.5rem",
              right: "1.5rem",
              zIndex: 10,
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.4rem",
            }}
          >
            {[
              { label: "Construcción", len: FASE1.length, start: 0 },
              { label: "Recorrido", len: FASE2.length, start: FASE1.length },
            ].map((ph) => {
              const active =
                curFrameRef.current >= ph.start &&
                curFrameRef.current < ph.start + ph.len;
              return (
                <div
                  key={ph.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    opacity: active ? 1 : 0.28,
                    transition: "opacity 0.4s",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.6rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: active ? "#ecb337" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {ph.label}
                  </span>
                  <div
                    style={{
                      width: 24,
                      height: 1.5,
                      background: active
                        ? "linear-gradient(90deg,#ecb337,#f5d170)"
                        : "rgba(255,255,255,0.3)",
                      transition: "background 0.4s",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
