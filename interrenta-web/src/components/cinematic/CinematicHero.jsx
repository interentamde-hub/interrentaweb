/**
 * CinematicHero.jsx — InterRenta v11
 *
 * Fix scroll móvil:
 *   - totalH se fija UNA VEZ al montar (useLayoutEffect + DOM directo).
 *     La barra de dirección mobile no genera re-renders ni recálculo.
 *   - Canvas resize debounced 300ms — no dispara durante el scroll.
 *   - isMobile solo afecta CSS; nunca reconstruye ScrollTrigger.
 *
 * Overlays rediseñados:
 *   - Orden correcto: TÍTULO grande → regla dorada → eyebrow pequeño
 *   - Stagger por elemento: title entra primero, rule después, sub al final
 *   - letterSpacing se anima al entrar (0.08em → -0.02em) — efecto "snap"
 *   - Blur + scale suaves por elemento independiente
 */

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Config ───────────────────────────────────────────────────────────────────
const TOTAL      = 181;
const PX_DESKTOP = 52;   // recorrido más corto = scroll más rápido
const PX_MOBILE  = 30;

function makeUrls(base) {
  return Array.from(
    { length: TOTAL },
    (_, i) => `${base}/frame_${String(i + 1).padStart(4, "0")}.webp`,
  );
}
const DESKTOP_URLS = makeUrls("/frames/desktop");
const MOBILE_URLS  = makeUrls("/frames/mobile");

// ─── Overlays — ventanas CONTINUAS (siempre hay un mensaje; cross-fade) ──────
const OVERLAYS = [
  {
    id: "o1",
    start: 0.00, end: 0.22,
    title: "El espacio\nque mereces",
    sub: "Diseño · Confort · Vida",
    align: "center",
  },
  {
    id: "o2",
    start: 0.17, end: 0.42,
    title: "Construido\ncon visión",
    sub: "Cada detalle, una decisión",
    align: "left",
  },
  {
    id: "o3",
    start: 0.37, end: 0.62,
    title: "Arquitectura\nque inspira",
    sub: "Forma · Función · Elegancia",
    align: "right",
  },
  {
    id: "o4",
    start: 0.57, end: 0.82,
    title: "Tu hogar\nte espera",
    sub: "Oriente Antioqueño",
    align: "center",
  },
  {
    id: "o5",
    start: 0.77, end: 1.08, // termina más allá de 1 para quedarse visible al final
    title: "InterRenta",
    sub: "Bienes Raíces · Oriente Antioqueño",
    align: "center",
  },
];

const ALIGN_WRAP = {
  left:   { left: "clamp(1.5rem,8vw,7rem)",  right: "auto",                        maxWidth: "min(60%,580px)" },
  right:  { left: "auto",                     right: "clamp(1.5rem,8vw,7rem)",      maxWidth: "min(60%,580px)" },
  center: { left: "50%",                      transform: "translateX(-50%)",         maxWidth: "min(90%,720px)" },
};

// ─── Easing ───────────────────────────────────────────────────────────────────
function smoothstep(t) {
  const c = Math.max(0, Math.min(t, 1));
  return c * c * (3 - 2 * c);
}

// ─── Canvas cover draw ────────────────────────────────────────────────────────
function drawCover(ctx, img, cw, ch) {
  const iw = img.naturalWidth  || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(cw / iw, ch / ih);
  ctx.drawImage(img, (cw - iw * scale) / 2, (ch - ih * scale) / 2, iw * scale, ih * scale);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CinematicHero({ logoSrc }) {
  const wrapRef        = useRef(null);
  const canvasRef      = useRef(null);
  // Refs estructurados por overlay: { title, rule, sub }
  const partRefs       = useRef(OVERLAYS.map(() => ({})));
  const progressFillRef = useRef(null);
  const scrollIndRef   = useRef(null);
  const pool           = useRef([]);
  const lastFi         = useRef(-1);
  const isMobileRef    = useRef(false);

  const [firstReady, setFirstReady] = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);

  // ── Calcula y fija la altura UNA VEZ al montar ────────────────────────────
  // Nunca vuelve a correr — la barra del browser no genera re-renders.
  useLayoutEffect(() => {
    const isMob = window.innerWidth < 768;
    isMobileRef.current = isMob;
    setIsMobile(isMob);
    if (wrapRef.current) {
      const vh = window.innerHeight;
      wrapRef.current.style.height =
        `${TOTAL * (isMob ? PX_MOBILE : PX_DESKTOP) + vh}px`;
    }
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

  // ── Canvas = viewport (debounced para no disparar durante scroll) ─────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const prev = lastFi.current;
      if (prev >= 0) { lastFi.current = -1; drawFrame(prev); }
    };
    setSize();
    let tid;
    const onResize = () => { clearTimeout(tid); tid = setTimeout(setSize, 300); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(tid); };
  }, [drawFrame]);

  // ── Stagger de overlays — anima title/rule/sub por separado ─────────────
  const FADE = 0.06; // zona de cross-fade entre overlays (coincide con el solape)
  const updateScene = useCallback((progress) => {
    OVERLAYS.forEach(({ start, end }, i) => {
      const p = partRefs.current[i];
      if (!p) return;

      // t = visibilidad del overlay (0-1)
      let t = 0;
      if (progress > start && progress < end) {
        t = Math.min(
          smoothstep((progress - start) / FADE),
          smoothstep((end   - progress) / FADE),
        );
      }

      // Title — entra con letterSpacing animado + scale (sin blur: más fluido)
      if (p.title) {
        const ls = t < 1 ? `${(0.08 * (1 - t) - 0.02 * t).toFixed(3)}em` : "-0.02em";
        gsap.set(p.title, {
          opacity: t,
          y:      28 * (1 - t),
          scale:  1 + 0.04 * (1 - t),
          letterSpacing: ls,
        });
      }

      // Rule — aparece cuando t > 0.35 (después del título)
      if (p.rule) {
        const tR = smoothstep(Math.max(0, (t - 0.35) / 0.65));
        gsap.set(p.rule, { scaleX: tR, opacity: tR });
      }

      // Sub — aparece cuando t > 0.55 (última en llegar)
      if (p.sub) {
        const tS = smoothstep(Math.max(0, (t - 0.55) / 0.45));
        gsap.set(p.sub, { opacity: tS, y: 12 * (1 - tS) });
      }
    });

    if (progressFillRef.current)
      gsap.set(progressFillRef.current, { scaleX: progress, transformOrigin: "left center" });
    if (scrollIndRef.current)
      gsap.set(scrollIndRef.current, { opacity: progress < 0.04 ? 1 : 0 });
  }, []);

  // ── Carga frames con new Image() ──────────────────────────────────────────
  useEffect(() => {
    pool.current   = new Array(TOTAL).fill(null);
    lastFi.current = -1;
    setFirstReady(false);

    const urls = isMobileRef.current ? MOBILE_URLS : DESKTOP_URLS;

    function loadOne(i) {
      return new Promise((resolve) => {
        const img = new Image();
        pool.current[i] = img;
        img.onload  = () => { if (i === 0) { drawFrame(0); setFirstReady(true); } resolve(); };
        img.onerror = resolve;
        img.src     = urls[i];
      });
    }

    let next = 10;
    function runNext() {
      if (next >= TOTAL) return;
      loadOne(next++).then(runNext);
    }
    Promise.all(
      Array.from({ length: Math.min(10, TOTAL) }, (_, i) => loadOne(i)),
    ).then(() => { for (let c = 0; c < 4; c++) runNext(); });
  }, [drawFrame]); // no depende de isMobile — se fija en mount

  // ── GSAP ScrollTrigger ────────────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const st = ScrollTrigger.create({
      id: "cinematic-hero",
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      scrub: isMobileRef.current ? 0.4 : 0.5,
      onUpdate: ({ progress }) => {
        drawFrame(Math.floor(progress * (TOTAL - 1)));
        updateScene(progress);
      },
    });
    updateScene(0);
    return () => st.kill();
  }, [drawFrame, updateScene]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    // altura se inyecta en useLayoutEffect via DOM directo
    <div ref={wrapRef} style={{ position: "relative" }}>

      {/* Sticky viewport */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",       // svh = viewport sin address bar (fallback: 100vh)
          overflow: "hidden",
          background: "#050505",
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
            transition: "opacity 0.6s ease",
          }}
        />

        {/* Vignette radial */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
            background:
              "radial-gradient(ellipse 140% 120% at 50% 55%, transparent 25%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Fade inferior */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: isMobile ? "30%" : "35%", zIndex: 2, pointerEvents: "none",
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
          }}
        />

        {/* Logo */}
        {logoSrc && (
          <div style={{
            position: "absolute",
            top:  isMobile ? "0.75rem" : "1.5rem",
            left: isMobile ? "0.75rem" : "1.5rem",
            zIndex: 20, pointerEvents: "none",
          }}>
            <img
              src={logoSrc}
              alt="InterRenta"
              style={{
                height: isMobile ? 30 : 46,
                width: "auto",
                filter: "drop-shadow(0 2px 20px rgba(0,0,0,0.95))",
              }}
            />
          </div>
        )}

        {/* ── Overlays ──────────────────────────────────────────────────────
            Cada overlay tiene su posición fija; GSAP anima title/rule/sub.
            El wrapper NO tiene transform propio (evita conflictos con GSAP).
        ─────────────────────────────────────────────────────────────────── */}
        {OVERLAYS.map((ov, i) => (
          <div
            key={ov.id}
            style={{
              position: "absolute",
              bottom: isMobile ? "11%" : "13%",
              zIndex: 10,
              pointerEvents: "none",
              ...ALIGN_WRAP[ov.align],
            }}
          >
            {/* TÍTULO principal — serif grande */}
            <h2
              ref={(el) => { partRefs.current[i].title = el; }}
              style={{
                fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif",
                fontSize: isMobile
                  ? "clamp(2.1rem,8.5vw,2.9rem)"
                  : "clamp(3.2rem,5.5vw,6.2rem)",
                fontWeight: 300,
                fontStyle: "normal",
                color: "#ffffff",
                lineHeight: 1.04,
                letterSpacing: "0.08em",
                textShadow:
                  "0 2px 50px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.6)",
                margin: 0,
                whiteSpace: "pre-line",
                opacity: 0,
                willChange: "opacity, transform, filter, letter-spacing",
                textAlign: ov.align === "right" ? "right"
                         : ov.align === "left"  ? "left"
                         : "center",
              }}
            >
              {ov.title}
            </h2>

            {/* REGLA decorativa dorada */}
            <div
              ref={(el) => { partRefs.current[i].rule = el; }}
              style={{
                height: 1,
                background: "linear-gradient(90deg, transparent, #ecb337 30%, #f5d170 50%, #ecb337 70%, transparent)",
                margin: isMobile ? "0.7rem 0" : "1rem 0",
                opacity: 0,
                transform: "scaleX(0)",
                transformOrigin: ov.align === "right"  ? "right center"
                               : ov.align === "left"   ? "left center"
                               : "center center",
                willChange: "opacity, transform",
              }}
            />

            {/* EYEBROW — pequeño, uppercase, dorado */}
            <p
              ref={(el) => { partRefs.current[i].sub = el; }}
              style={{
                fontFamily: "'Inter','Helvetica Neue',sans-serif",
                fontSize: isMobile ? "0.58rem" : "clamp(0.6rem,0.95vw,0.78rem)",
                fontWeight: 500,
                color: "rgba(236,179,55,0.9)",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                textShadow: "0 1px 16px rgba(0,0,0,0.95)",
                margin: 0,
                opacity: 0,
                willChange: "opacity, transform, filter",
                textAlign: ov.align === "right" ? "right"
                         : ov.align === "left"  ? "left"
                         : "center",
              }}
            >
              {ov.sub}
            </p>
          </div>
        ))}

        {/* Barra de progreso */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: 2, zIndex: 20,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <div
            ref={progressFillRef}
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg,#ecb337,#f5d170)",
              transform: "scaleX(0)",
              transformOrigin: "left center",
              boxShadow: "0 0 12px rgba(236,179,55,0.6)",
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
          <span style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "0.5rem",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
          }}>
            Scroll
          </span>
          <svg width="18" height="28" viewBox="0 0 18 28" fill="none" aria-hidden="true">
            <rect x="0.75" y="0.75" width="16.5" height="26.5" rx="8.25"
              stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <rect x="8" y="4.5" width="2" height="6" rx="1" fill="rgba(236,179,55,0.5)">
              <animate attributeName="y" values="4.5;13;4.5" dur="1.8s"
                repeatCount="indefinite" calcMode="ease" />
              <animate attributeName="opacity" values="0.9;0.15;0.9" dur="1.8s"
                repeatCount="indefinite" />
            </rect>
          </svg>
        </div>
      </div>
    </div>
  );
}
