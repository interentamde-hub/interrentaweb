/**
 * CinematicHero.jsx — InterRenta v8
 * UBICACIÓN: src/components/cinematic/CinematicHero.jsx
 *
 * Enfoque: 1 <img> + preload en Image[] en memoria.
 * Una vez precargada, img.src = url es INSTANTÁNEO desde caché.
 * Sin canvas, sin double-buffer, sin callbacks encadenados.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Config ───────────────────────────────────────────────────────────────────
const EXT = "jpg";
const FASE1_N = 61;
const FASE2_N = 76;
const PX_PER_FRAME = 90;

function makeUrls(base, n) {
  return Array.from(
    { length: n },
    (_, i) => `${base}/ezgif-frame-${String(i + 1).padStart(3, "0")}.${EXT}`,
  );
}

const F1 = makeUrls("/frames/fase1", FASE1_N);
const F2 = makeUrls("/frames/fase2", FASE2_N);
const ALL = [...F1, ...F2];
const TOTAL = ALL.length; // 137

// ─── Overlays ─────────────────────────────────────────────────────────────────
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
    left: "clamp(1.5rem,8vw,7rem)",
    right: "auto",
    maxWidth: "min(55%,560px)",
  },
  right: {
    textAlign: "right",
    left: "auto",
    right: "clamp(1.5rem,8vw,7rem)",
    maxWidth: "min(55%,560px)",
  },
  center: { textAlign: "center", left: 0, right: 0, maxWidth: "100%" },
};

// ─────────────────────────────────────────────────────────────────────────────
export default function CinematicHero({ logoSrc }) {
  const wrapRef = useRef(null);
  const imgRef = useRef(null); // el único <img>
  const pool = useRef([]); // Image[] precargadas en memoria
  const curFi = useRef(0);
  const rafId = useRef(null);
  const topCache = useRef(0);
  const hCache = useRef(0);

  const [ov, setOv] = useState(OVS[0]);
  const [pct, setPct] = useState(0);
  const [showInd, setShowInd] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [firstReady, setFirstReady] = useState(false);

  // ── Preload: carga todos los frames en Image[] ───────────────────────────
  // Una vez que cada Image() carga, queda en caché del navegador.
  // Cuando después hacemos imgRef.current.src = ALL[fi], es instantáneo.
  useEffect(() => {
    const images = ALL.map((src, i) => {
      const img = new window.Image();
      img.onload = () => {
        // Muestra el primer frame en cuanto cargue
        if (i === 0 && imgRef.current) {
          imgRef.current.src = src;
          setFirstReady(true);
        }
      };
      img.src = src;
      return img;
    });
    pool.current = images;
    return () => {
      // Limpia onload handlers al desmontar
      images.forEach((img) => {
        img.onload = null;
      });
    };
  }, []);

  // ── Detecta mobile ───────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

        // Solo actualiza el src si cambió el frame
        if (fi !== curFi.current) {
          curFi.current = fi;
          // Swap instantáneo: la imagen ya está en caché del navegador
          if (imgRef.current) imgRef.current.src = ALL[fi];
          setOv(OVS.find((o) => fi >= o.s && fi <= o.e) ?? null);
        }

        setPct(p);
        setShowInd(p < 0.03);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [cacheDims]);

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
        {/* ── La única imagen — calidad nativa, sin procesamiento ───────── */}
        <img
          ref={imgRef}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            // Fade suave al aparecer el primer frame
            opacity: firstReady ? 1 : 0,
            transition: firstReady ? "opacity 0.4s ease" : "none",
          }}
        />

        {/* Vignette */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
            background:
              "radial-gradient(ellipse 130% 110% at 50% 50%, transparent 35%, rgba(0,0,0,0.45) 100%)",
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
            zIndex: 1,
            height: isMobile ? "25%" : "32%",
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
                height: isMobile ? 34 : 50,
                width: "auto",
                filter: "drop-shadow(0 2px 14px rgba(0,0,0,0.8))",
              }}
            />
          </div>
        )}

        {/* Text overlay */}
        <AnimatePresence mode="wait">
          {ov && (
            <motion.div
              key={ov.id}
              initial={{
                opacity: 0,
                y: isMobile ? 20 : 36,
                filter: "blur(12px)",
              }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                y: isMobile ? -14 : -24,
                filter: "blur(8px)",
              }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                bottom: isMobile ? "11%" : "15%",
                zIndex: 10,
                padding: "0 1.5rem",
                pointerEvents: "none",
                ...ALIGN[ov.align],
              }}
            >
              <h2
                style={{
                  fontFamily:
                    "'Cormorant Garamond','Playfair Display',Georgia,serif",
                  fontSize: isMobile
                    ? "clamp(1.9rem,7.5vw,2.6rem)"
                    : "clamp(2.8rem,5.2vw,5.4rem)",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.94)",
                  lineHeight: 1.07,
                  letterSpacing: "-0.01em",
                  textShadow: "0 4px 50px rgba(0,0,0,0.7)",
                  margin: 0,
                }}
              >
                {ov.title}
              </h2>
              <p
                style={{
                  fontFamily: "'Inter','Helvetica Neue',sans-serif",
                  fontSize: isMobile
                    ? "0.62rem"
                    : "clamp(0.72rem,1.3vw,0.95rem)",
                  fontWeight: 300,
                  color: "rgba(236,179,55,0.9)",
                  letterSpacing: isMobile ? "0.18em" : "0.26em",
                  textTransform: "uppercase",
                  marginTop: isMobile ? "0.5rem" : "0.9rem",
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
                bottom: isMobile ? "2.5rem" : "3.2rem",
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
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "0.56rem",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.36)",
                }}
              >
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  width: 19,
                  height: 30,
                  borderRadius: 10,
                  border: "1.5px solid rgba(255,255,255,0.22)",
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 5,
                }}
              >
                <div
                  style={{
                    width: 2,
                    height: 6,
                    borderRadius: 2,
                    background: "rgba(236,179,55,0.6)",
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicadores de fase — solo desktop */}
        {!isMobile && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "3.2rem",
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
                    opacity: active ? 1 : 0.25,
                    transition: "opacity 0.5s",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: "0.56rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: active ? "#ecb337" : "rgba(255,255,255,0.45)",
                    }}
                  >
                    {ph.label}
                  </span>
                  <div
                    style={{
                      width: 20,
                      height: 1.5,
                      background: active
                        ? "linear-gradient(90deg,#ecb337,#f5d170)"
                        : "rgba(255,255,255,0.22)",
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
