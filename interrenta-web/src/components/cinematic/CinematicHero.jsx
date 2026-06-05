/**
 * CinematicHero.jsx — InterRenta v10
 *
 * FIX CRÍTICO: createImageBitmap() decodifica cada frame como píxeles crudos
 * (~8 MB por frame × 181 = ~1.5 GB en mobile → crash).
 * Solución: new Image() — el browser almacena WebP comprimido y decodifica
 * solo al momento de ctx.drawImage(). Memoria real: ~11 MB total.
 *
 * Otros cambios:
 *  - Scroll mobile mucho más corto (40 px/frame vs 72 en desktop)
 *  - Concurrencia de carga limitada a 4 para no saturar la red mobile
 *  - scrub más rápido en mobile (0.5) para respuesta inmediata al touch
 */

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Config ───────────────────────────────────────────────────────────────────
const TOTAL = 181;
const PX_DESKTOP = 72;
const PX_MOBILE  = 38; // scroll mucho más corto en mobile

function makeUrls(base) {
  return Array.from(
    { length: TOTAL },
    (_, i) => `${base}/frame_${String(i + 1).padStart(4, "0")}.webp`,
  );
}
const DESKTOP_URLS = makeUrls("/frames/desktop");
const MOBILE_URLS  = makeUrls("/frames/mobile");

// ─── Overlays ─────────────────────────────────────────────────────────────────
const OVERLAYS = [
  { id: "o1", start: 0.00, end: 0.16, title: "Donde los sueños",    sub: "toman forma",                                      align: "center" },
  { id: "o2", start: 0.20, end: 0.38, title: "Construido con visión", sub: "cada detalle importa",                           align: "left"   },
  { id: "o3", start: 0.42, end: 0.60, title: "La arquitectura",      sub: "como expresión de vida",                          align: "right"  },
  { id: "o4", start: 0.63, end: 0.80, title: "Bienvenido",           sub: "a tu nuevo hogar",                                align: "center" },
  { id: "o5", start: 0.84, end: 1.00, title: "InterRenta",           sub: "Tu aliado en bienes raíces · Oriente Antioqueño", align: "center" },
];

const ALIGN = {
  left:   { textAlign: "left",   paddingLeft:  "clamp(1.5rem,8vw,7rem)" },
  right:  { textAlign: "right",  paddingRight: "clamp(1.5rem,8vw,7rem)" },
  center: { textAlign: "center" },
};

function smoothstep(t) {
  const c = Math.max(0, Math.min(t, 1));
  return c * c * (3 - 2 * c);
}

function drawCover(ctx, img, cw, ch) {
  const iw = img.naturalWidth  || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CinematicHero({ logoSrc }) {
  const wrapRef        = useRef(null);
  const canvasRef      = useRef(null);
  const overlayRefs    = useRef([]);
  const progressFillRef = useRef(null);
  const scrollIndRef   = useRef(null);
  // Pool de Image() — el browser gestiona la memoria comprimida
  const pool           = useRef([]);
  const lastFi         = useRef(-1);
  const isMobileRef    = useRef(false);

  const [firstReady, setFirstReady] = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);

  // ── Detect mobile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      isMobileRef.current = m;
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Canvas = viewport ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const prev = lastFi.current;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      if (prev >= 0) { lastFi.current = -1; drawFrame(prev); }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Dibuja un frame ───────────────────────────────────────────────────────
  const drawFrame = useCallback((fi) => {
    const i = Math.max(0, Math.min(fi, TOTAL - 1));
    if (i === lastFi.current) return;
    lastFi.current = i;
    const img = pool.current[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCover(canvas.getContext("2d", { alpha: false }), img, canvas.width, canvas.height);
  }, []);

  // ── Actualiza overlays + barra (puro DOM, sin estado React) ───────────────
  const FADE = 0.04;
  const updateScene = useCallback((progress) => {
    overlayRefs.current.forEach((el, i) => {
      if (!el) return;
      const { start, end } = OVERLAYS[i];
      let t = 0;
      if (progress > start && progress < end) {
        t = Math.min(
          smoothstep((progress - start) / FADE),
          smoothstep((end   - progress) / FADE),
        );
      }
      gsap.set(el, {
        opacity: t,
        y: 24 * (1 - t),
        filter: t < 0.98 ? `blur(${(10 * (1 - t)).toFixed(1)}px)` : "none",
      });
    });
    if (progressFillRef.current)
      gsap.set(progressFillRef.current, { scaleX: progress, transformOrigin: "left center" });
    if (scrollIndRef.current)
      gsap.set(scrollIndRef.current, { opacity: progress < 0.04 ? 1 : 0 });
  }, []);

  // ── Carga frames con new Image() — sin createImageBitmap ─────────────────
  useEffect(() => {
    pool.current  = new Array(TOTAL).fill(null);
    lastFi.current = -1;
    setFirstReady(false);

    const urls = isMobile ? MOBILE_URLS : DESKTOP_URLS;

    function loadOne(i) {
      return new Promise((resolve) => {
        const img = new Image();
        pool.current[i] = img;
        img.onload = () => {
          if (i === 0) { drawFrame(0); setFirstReady(true); }
          resolve();
        };
        img.onerror = resolve;
        img.src = urls[i];
      });
    }

    // Primeros 10 frames con prioridad, luego cola de 4 concurrentes
    const CONCUR = 4;
    let next = 10;
    function runNext() {
      if (next >= TOTAL) return;
      const i = next++;
      loadOne(i).then(runNext);
    }

    const priority = Array.from({ length: Math.min(10, TOTAL) }, (_, i) => loadOne(i));
    Promise.all(priority).then(() => {
      for (let c = 0; c < CONCUR; c++) runNext();
    });
  }, [isMobile, drawFrame]);

  // ── GSAP ScrollTrigger ───────────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const st = ScrollTrigger.create({
      id: "cinematic-hero",
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      // scrub más rápido en mobile para respuesta inmediata al touch
      scrub: isMobileRef.current ? 0.4 : 0.9,
      onUpdate: ({ progress }) => {
        drawFrame(Math.floor(progress * (TOTAL - 1)));
        updateScene(progress);
      },
    });

    updateScene(0);
    return () => st.kill();
  }, [drawFrame, updateScene]);

  const pxPerFrame = isMobile ? PX_MOBILE : PX_DESKTOP;
  const totalH = TOTAL * pxPerFrame + window.innerHeight;

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
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "block",
            opacity: firstReady ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />

        {/* Vignette */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 130% 110% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Fade inferior */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: isMobile ? "28%" : "32%",
            zIndex: 2,
            pointerEvents: "none",
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
          }}
        />

        {/* Logo */}
        {logoSrc && (
          <div
            style={{
              position: "absolute",
              top:  isMobile ? "0.75rem" : "1.5rem",
              left: isMobile ? "0.75rem" : "1.5rem",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            <img
              src={logoSrc}
              alt="InterRenta"
              style={{
                height: isMobile ? 32 : 48,
                width: "auto",
                filter: "drop-shadow(0 2px 16px rgba(0,0,0,0.9))",
              }}
            />
          </div>
        )}

        {/* ── Overlays ──────────────────────────────────────────────────── */}
        {OVERLAYS.map((ov, i) => (
          <div
            key={ov.id}
            ref={(el) => (overlayRefs.current[i] = el)}
            style={{
              position: "absolute",
              left: 0, right: 0,
              bottom: isMobile ? "12%" : "14%",
              padding: "0 clamp(1.25rem,5vw,4rem)",
              zIndex: 10,
              pointerEvents: "none",
              opacity: 0,
              willChange: "opacity, transform, filter",
              ...ALIGN[ov.align],
            }}
          >
            {/* Subtítulo dorado */}
            <p
              style={{
                fontFamily: "'Inter','Helvetica Neue',sans-serif",
                fontSize: isMobile ? "0.6rem" : "clamp(0.62rem,1vw,0.8rem)",
                fontWeight: 500,
                color: "#ecb337",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginBottom: isMobile ? "0.4rem" : "0.7rem",
                textShadow: "0 1px 12px rgba(0,0,0,0.9)",
              }}
            >
              {ov.sub}
            </p>

            {/* Título serif */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif",
                fontSize: isMobile
                  ? "clamp(1.9rem,7.5vw,2.6rem)"
                  : "clamp(3rem,5.2vw,5.8rem)",
                fontWeight: 300,
                color: "#ffffff",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                textShadow: "0 2px 40px rgba(0,0,0,0.85), 0 0 80px rgba(0,0,0,0.5)",
                margin: 0,
              }}
            >
              {ov.title}
            </h2>
          </div>
        ))}

        {/* Barra de progreso */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 2,
            background: "rgba(255,255,255,0.07)",
            zIndex: 20,
          }}
        >
          <div
            ref={progressFillRef}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg,#ecb337,#f5d170)",
              transform: "scaleX(0)",
              transformOrigin: "left center",
              boxShadow: "0 0 10px rgba(236,179,55,0.55)",
            }}
          />
        </div>

        {/* Indicador de scroll */}
        <div
          ref={scrollIndRef}
          style={{
            position: "absolute",
            bottom: isMobile ? "2rem" : "3rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.45rem",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "0.52rem",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Scroll
          </span>
          <svg width="18" height="28" viewBox="0 0 18 28" fill="none" aria-hidden="true">
            <rect x="0.75" y="0.75" width="16.5" height="26.5" rx="8.25"
              stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <rect x="8" y="4.5" width="2" height="6" rx="1" fill="rgba(236,179,55,0.6)">
              <animate attributeName="y" values="4.5;13;4.5" dur="1.7s"
                repeatCount="indefinite" calcMode="ease" />
              <animate attributeName="opacity" values="1;0.2;1" dur="1.7s"
                repeatCount="indefinite" />
            </rect>
          </svg>
        </div>
      </div>
    </div>
  );
}
