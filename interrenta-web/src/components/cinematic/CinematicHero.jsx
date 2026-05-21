/**
 * CinematicHero.jsx — InterRenta v5
 * UBICACIÓN: src/components/cinematic/CinematicHero.jsx
 *
 * Mejoras v5:
 *  - devicePixelRatio: canvas dibuja a resolución nativa (sin blur en retina)
 *  - Textos: duraciones más largas, transiciones más suaves
 *  - Responsivo: tamaños de fuente, padding y logo ajustados por breakpoint
 *  - Sin panel DEBUG
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Config ───────────────────────────────────────────────────────────────────
const EXT = "jpg"; // 'png' si tus frames son .png
const FASE1_N = 61;
const FASE2_N = 76;
const PX_PER_FRAME = 90; // px de scroll por frame (sube = más lento)

function urls(base, n) {
  return Array.from(
    { length: n },
    (_, i) => `${base}/ezgif-frame-${String(i + 1).padStart(3, "0")}.${EXT}`,
  );
}

const F1 = urls("/frames/fase1", FASE1_N);
const F2 = urls("/frames/fase2", FASE2_N);
const ALL = [...F1, ...F2];
const TOTAL = ALL.length; // 137

// ─── Overlays ─────────────────────────────────────────────────────────────────
// start/end definen el rango de frames en que el texto es visible.
// Cuanto más amplio el rango, más tiempo permanece el texto en pantalla.
const OVS = [
  {
    id: "o1",
    s: 0,
    e: 22,
    title: "Donde los sueños",
    sub: "toman forma",
    align: "center",
  },
  {
    id: "o2",
    s: 26,
    e: 50,
    title: "Construido con visión",
    sub: "cada detalle importa",
    align: "left",
  },
  {
    id: "o3",
    s: 54,
    e: 75,
    title: "La arquitectura",
    sub: "como expresión de vida",
    align: "right",
  },
  {
    id: "o4",
    s: 79,
    e: 103,
    title: "Bienvenido",
    sub: "a tu nuevo hogar",
    align: "center",
  },
  {
    id: "o5",
    s: 107,
    e: 125,
    title: "Cada espacio cuenta",
    sub: "diseñado para vivir",
    align: "left",
  },
  {
    id: "o6",
    s: 128,
    e: TOTAL - 1,
    title: "InterRenta",
    sub: "Tu aliado en bienes raíces · Oriente Antioqueño",
    align: "center",
  },
];

const ALIGN = {
  left: {
    textAlign: "left",
    left: "clamp(1.5rem,8%,7rem)",
    right: "auto",
    maxWidth: "min(52%, 540px)",
  },
  right: {
    textAlign: "right",
    left: "auto",
    right: "clamp(1.5rem,8%,7rem)",
    maxWidth: "min(52%, 540px)",
  },
  center: { textAlign: "center", left: 0, right: 0, maxWidth: "100%" },
};

// ─────────────────────────────────────────────────────────────────────────────
export default function CinematicHero({ logoSrc }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const imgs = useRef([]);
  const curFi = useRef(0);
  const pendingFi = useRef(-1);
  const rafId = useRef(null);
  const topCache = useRef(0);
  const hCache = useRef(0);
  const dpr = useRef(1);

  const [ov, setOv] = useState(OVS[0]);
  const [pct, setPct] = useState(0);
  const [showInd, setShowInd] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ── Dibuja frame en canvas (con soporte DPR) ─────────────────────────────
  const paint = useCallback((fi) => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const img = imgs.current[fi];
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      const ctx = canvas.getContext("2d", { alpha: false });
      // canvas.width/height ya están en píxeles físicos (multiplicados por dpr)
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
    } else {
      pendingFi.current = fi;
    }
  }, []);

  // ── Preload ──────────────────────────────────────────────────────────────
  useEffect(() => {
    imgs.current = ALL.map((src, i) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        if (pendingFi.current === i || i === 0) {
          pendingFi.current = -1;
          paint(i);
        }
      };
      return img;
    });
  }, [paint]);

  // ── Resize canvas con DPR ────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      dpr.current = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Tamaño CSS del canvas (lo que ocupa visualmente)
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // Tamaño real en píxeles (multiplicado por dpr → nitidez en retina)
      canvas.width = Math.round(w * dpr.current);
      canvas.height = Math.round(h * dpr.current);

      // Escala el contexto para que drawImage use coordenadas CSS
      const ctx = canvas.getContext("2d", { alpha: false });
      ctx.scale(dpr.current, dpr.current);

      paint(curFi.current);
      setIsMobile(w < 768);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [paint]);

  // ── Cachea posición del contenedor ───────────────────────────────────────
  const cacheDims = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    let top = 0,
      node = el;
    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    topCache.current = top;
    hCache.current = el.offsetHeight;
  }, []);

  useEffect(() => {
    const t = setTimeout(cacheDims, 200);
    return () => clearTimeout(t);
  }, [cacheDims]);

  // ── Scroll handler ───────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (hCache.current === 0) cacheDims();
        const scrolled = window.scrollY - topCache.current;
        const maxScroll = hCache.current - window.innerHeight;
        if (maxScroll <= 0) return;

        const p = Math.max(0, Math.min(scrolled / maxScroll, 1));
        const fi = Math.min(Math.round(p * (TOTAL - 1)), TOTAL - 1);

        curFi.current = fi;
        paint(fi);
        setPct(p);
        setShowInd(p < 0.03);
        setOv(OVS.find((o) => fi >= o.s && fi <= o.e) ?? null);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [paint, cacheDims]);

  const totalH = TOTAL * PX_PER_FRAME + window.innerHeight;

  return (
    <div ref={wrapRef} style={{ height: totalH, position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#0a0a0a",
        }}
      >
        {/* Canvas — tamaño CSS controlado por resize() */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ display: "block", position: "absolute", top: 0, left: 0 }}
        />

        {/* Vignette */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 130% 110% at 50% 50%, transparent 35%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* Fade inferior */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: isMobile ? "28%" : "35%",
            pointerEvents: "none",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
          }}
        />

        {/* Logo */}
        {logoSrc && (
          <div
            style={{
              position: "absolute",
              top: isMobile ? "0.75rem" : "1.5rem",
              left: isMobile ? "0.75rem" : "1.5rem",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <img
              src={logoSrc}
              alt="InterRenta"
              style={{
                height: isMobile ? 36 : 52,
                width: "auto",
                filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.75))",
              }}
            />
          </div>
        )}

        {/* ── Text overlay ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {ov && (
            <motion.div
              key={ov.id}
              initial={{
                opacity: 0,
                y: isMobile ? 24 : 40,
                filter: "blur(12px)",
              }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                y: isMobile ? -16 : -28,
                filter: "blur(8px)",
              }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                bottom: isMobile ? "12%" : "16%",
                zIndex: 10,
                padding: "0 1.5rem",
                pointerEvents: "none",
                ...ALIGN[ov.align],
              }}
            >
              <h2
                style={{
                  fontFamily:
                    "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                  fontSize: isMobile
                    ? "clamp(2rem, 8vw, 2.8rem)"
                    : "clamp(2.8rem, 5.5vw, 5.5rem)",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.93)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.01em",
                  textShadow: "0 4px 50px rgba(0,0,0,0.7)",
                  margin: 0,
                }}
              >
                {ov.title}
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                  fontSize: isMobile
                    ? "0.65rem"
                    : "clamp(0.75rem, 1.4vw, 1rem)",
                  fontWeight: 300,
                  color: "rgba(236,179,55,0.9)",
                  letterSpacing: isMobile ? "0.2em" : "0.28em",
                  textTransform: "uppercase",
                  marginTop: isMobile ? "0.6rem" : "1rem",
                  textShadow: "0 2px 24px rgba(0,0,0,0.65)",
                }}
              >
                {ov.sub}
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
              width: `${pct * 100}%`,
              background: "linear-gradient(90deg, #ecb337, #f5d170)",
              transition: "width 0.08s linear",
              boxShadow: "0 0 8px rgba(236,179,55,0.5)",
            }}
          />
        </div>

        {/* Scroll indicator */}
        <AnimatePresence>
          {showInd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: "absolute",
                bottom: isMobile ? "2.5rem" : "3.5rem",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.58rem",
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
                  width: 20,
                  height: 32,
                  borderRadius: 10,
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 6,
                }}
              >
                <div
                  style={{
                    width: 2.5,
                    height: 6,
                    borderRadius: 2,
                    background: "rgba(236,179,55,0.6)",
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicadores de fase */}
        {!isMobile && (
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
              { label: "Construcción", s: 0, e: FASE1_N },
              { label: "Recorrido", s: FASE1_N, e: TOTAL },
            ].map((ph) => {
              const active = curFi.current >= ph.s && curFi.current < ph.e;
              return (
                <div
                  key={ph.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    opacity: active ? 1 : 0.28,
                    transition: "opacity 0.5s",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.58rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: active ? "#ecb337" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {ph.label}
                  </span>
                  <div
                    style={{
                      width: 22,
                      height: 1.5,
                      background: active
                        ? "linear-gradient(90deg, #ecb337, #f5d170)"
                        : "rgba(255,255,255,0.25)",
                      transition: "background 0.5s",
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
