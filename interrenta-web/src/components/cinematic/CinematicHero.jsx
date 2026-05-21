/**
 * CinematicHero.jsx — InterRenta Scrollytelling v3 (DEFINITIVO)
 * ─────────────────────────────────────────────────────────────
 * UBICACIÓN: src/components/cinematic/CinematicHero.jsx
 *
 * Ya no usa import.meta.glob (causaba problemas en Vercel).
 * Los frames se sirven desde /public/frames/ como assets estáticos.
 *
 * ESTRUCTURA DE CARPETAS REQUERIDA:
 *   public/
 *     frames/
 *       fase1/  ← ezgif-frame-001.jpg ... ezgif-frame-061.jpg
 *       fase2/  ← ezgif-frame-001.jpg ... ezgif-frame-076.jpg
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Configuración (ajusta si cambia el número de frames o extensión) ─────────
const CONFIG = {
  fase1Count: 61, // número de frames en fase1
  fase2Count: 76, // número de frames en fase2
  ext: "jpg", // extensión: 'jpg' | 'png' | 'jpeg'
  pxPerFrame: 85, // px de scroll por frame (sube = más lento)
  fase1Path: "/frames/fase1",
  fase2Path: "/frames/fase2",
};

// ─── Genera array de URLs ──────────────────────────────────────────────────────
function makeUrls(basePath, count, ext) {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(3, "0");
    return `${basePath}/ezgif-frame-${n}.${ext}`;
  });
}

const FASE1_URLS = makeUrls(CONFIG.fase1Path, CONFIG.fase1Count, CONFIG.ext);
const FASE2_URLS = makeUrls(CONFIG.fase2Path, CONFIG.fase2Count, CONFIG.ext);
const ALL_FRAMES = [...FASE1_URLS, ...FASE2_URLS];
const TOTAL = ALL_FRAMES.length; // 137

// ─── Text overlays ────────────────────────────────────────────────────────────
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
    end: 60,
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

const ALIGN_STYLES = {
  left: { textAlign: "left", left: "8%", right: "auto", maxWidth: "50%" },
  right: { textAlign: "right", left: "auto", right: "8%", maxWidth: "50%" },
  center: { textAlign: "center", left: 0, right: 0, maxWidth: "100%" },
};

// ─── Componente ───────────────────────────────────────────────────────────────
export default function CinematicHero({ logoSrc }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]); // Image[] precargados
  const curFrameRef = useRef(0);
  const rafRef = useRef(null);
  const lastDrawnRef = useRef(-1);
  const cachedTopRef = useRef(0); // offsetTop cacheado
  const cachedHRef = useRef(0); // offsetHeight cacheado

  const [overlay, setOverlay] = useState(OVERLAYS[0]);
  const [scrollPct, setScrollPct] = useState(0);
  const [showScroll, setShowScroll] = useState(true);

  // Altura del carril de scroll
  const totalH = TOTAL * CONFIG.pxPerFrame + window.innerHeight;

  // ── drawFrame ──────────────────────────────────────────────────────────────
  const drawFrame = useCallback((idx) => {
    if (idx === lastDrawnRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = imagesRef.current[idx];
    if (!img?.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    const cw = canvas.width,
      ch = canvas.height;
    const iw = img.naturalWidth,
      ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    ctx.drawImage(
      img,
      (cw - iw * scale) / 2,
      (ch - ih * scale) / 2,
      iw * scale,
      ih * scale,
    );
    lastDrawnRef.current = idx;
  }, []);

  // ── Cachea dimensiones del contenedor (sin getBoundingClientRect) ──────────
  const cacheDims = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    let top = 0,
      node = el;
    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    cachedTopRef.current = top;
    cachedHRef.current = el.offsetHeight;
  }, []);

  // ── Preload ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const imgs = ALL_FRAMES.map((src, i) => {
      const img = new window.Image();
      img.src = src;
      // Dibuja el primer frame en cuanto cargue
      if (i === 0) img.onload = () => drawFrame(0);
      return img;
    });
    imagesRef.current = imgs;
  }, [drawFrame]);

  // ── Resize ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      lastDrawnRef.current = -1;
      drawFrame(curFrameRef.current);
      cacheDims();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame, cacheDims]);

  // Cachea dims después del primer layout
  useEffect(() => {
    const t = setTimeout(cacheDims, 150);
    return () => clearTimeout(t);
  }, [cacheDims]);

  // ── Scroll handler ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        // Si aún no cacheamos, intentar ahora
        if (cachedHRef.current === 0) cacheDims();

        const scrolled = window.scrollY - cachedTopRef.current;
        const maxScroll = cachedHRef.current - window.innerHeight;
        if (maxScroll <= 0 || scrolled < 0) return;

        const pct = Math.min(scrolled / maxScroll, 1);
        const fi = Math.min(Math.round(pct * (TOTAL - 1)), TOTAL - 1);

        drawFrame(fi);
        curFrameRef.current = fi;
        setScrollPct(pct);
        setShowScroll(pct < 0.04);
        setOverlay(OVERLAYS.find((o) => fi >= o.start && fi <= o.end) ?? null);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame, cacheDims]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{ height: totalH, position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#0a0a0a",
        }}
      >
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

        {/* Text overlay */}
        <AnimatePresence mode="wait">
          {overlay && (
            <motion.div
              key={overlay.id}
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
                ...ALIGN_STYLES[overlay.align ?? "center"],
              }}
            >
              <h2
                style={{
                  fontFamily:
                    "'Cormorant Garamond','Playfair Display',Georgia,serif",
                  fontSize: "clamp(2.6rem,6.5vw,5.8rem)",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.93)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.01em",
                  textShadow: "0 4px 50px rgba(0,0,0,0.65)",
                  margin: 0,
                }}
              >
                {overlay.title}
              </h2>
              <p
                style={{
                  fontFamily: "'Inter','Helvetica Neue',sans-serif",
                  fontSize: "clamp(0.72rem,1.6vw,1rem)",
                  fontWeight: 300,
                  color: "rgba(236,179,55,0.88)",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  marginTop: "0.9rem",
                  textShadow: "0 2px 24px rgba(0,0,0,0.6)",
                }}
              >
                {overlay.sub}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de progreso */}
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
              background: "linear-gradient(90deg,#ecb337,#f5d170)",
              transition: "width 0.06s linear",
              boxShadow: "0 0 10px rgba(236,179,55,0.6)",
            }}
          />
        </div>

        {/* Scroll indicator */}
        <AnimatePresence>
          {showScroll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
                  fontFamily: "'Inter',sans-serif",
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

        {/* Indicadores de fase */}
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
            { label: "Construcción", start: 0, end: FASE1_URLS.length },
            { label: "Recorrido", start: FASE1_URLS.length, end: TOTAL },
          ].map((ph) => {
            const active =
              curFrameRef.current >= ph.start && curFrameRef.current < ph.end;
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
                    fontFamily: "'Inter',sans-serif",
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
      </div>
    </div>
  );
}
