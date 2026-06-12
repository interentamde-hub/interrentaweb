/**
 * CinematicHero.jsx — InterRenta v12
 *
 * Scrollytelling con los frames del recorrido de la casa (housevideo, 16:9).
 *
 * SOLO DESKTOP / PANTALLAS PANORÁMICAS:
 *   - El clip es 16:9; en viewports angostos o verticales (móvil, tablet
 *     vertical) el recorte de `cover` destruye la composición. Ahí se
 *     renderiza <StaticHero>: primer frame fijo + entrada animada del texto.
 *   - La decisión se toma UNA VEZ al montar (igual que antes con isMobile):
 *     width >= 768 y aspecto >= 4:3.
 *
 * Animación de overlays (v12):
 *   - Entrada/salida asimétrica: el texto entra subiendo y SALE hacia arriba
 *     (antes "retrocedía" al salir, rompía la dirección del scroll).
 *   - Desenfoque que se resuelve al entrar (blur 6px → 0).
 *   - Deriva vertical continua mientras el overlay está visible (parallax).
 *   - Regla dorada y eyebrow en cascada sobre la fase de ENTRADA (no sobre la
 *     visibilidad simétrica), con tracking que se asienta (0.45em → 0.32em).
 */

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Config ───────────────────────────────────────────────────────────────────
// ⚠️ /public/frames/desktop contiene exactamente FRAMES_TOTAL archivos
//    (frame_0001 … frame_0213) extraídos de housevideo.mov (16:9, 1276×718)
//    con: ffmpeg -vf "select='gte(n,17)'" -vsync 0 -c:v libwebp -q:v 92
const FRAMES_TOTAL = 213;
const PX_PER_FRAME = 46; // px de scroll por frame (~9 900 px de recorrido)

const FRAME_URLS = Array.from(
  { length: FRAMES_TOTAL },
  (_, i) => `/frames/desktop/frame_${String(i + 1).padStart(4, "0")}.webp`,
);

// El clip es 16:9 → solo viewports anchos. Tablet/móvil vertical usa StaticHero.
const supportsCinematic = () =>
  window.innerWidth >= 768 && window.innerWidth / window.innerHeight >= 4 / 3;

// ─── Overlays — ventanas CONTINUAS sincronizadas con la narrativa del clip ───
//   0.00–0.20  fachada nocturna estable (apertura)
//   0.16–0.42  recorrido lateral del exterior
//   0.38–0.62  patio / transición al interior
//   0.58–0.82  cocina y espacios interiores
//   0.78–fin   sala luminosa (cierre de marca)
const OVERLAYS = [
  {
    id: "o1",
    start: 0.0, end: 0.2,
    title: "El espacio\nque mereces",
    sub: "Diseño · Confort · Vida",
    align: "center",
  },
  {
    id: "o2",
    start: 0.16, end: 0.42,
    title: "Construido\ncon visión",
    sub: "Cada detalle, una decisión",
    align: "left",
  },
  {
    id: "o3",
    start: 0.38, end: 0.62,
    title: "Arquitectura\nque inspira",
    sub: "Forma · Función · Elegancia",
    align: "right",
  },
  {
    id: "o4",
    start: 0.58, end: 0.82,
    title: "Tu hogar\nte espera",
    sub: "Oriente Antioqueño",
    align: "left",
  },
  {
    id: "o5",
    start: 0.78, end: 1.08, // termina más allá de 1 para quedarse visible al final
    title: "InterRenta",
    sub: "Bienes Raíces · Oriente Antioqueño",
    align: "center",
  },
];

const ALIGN_WRAP = {
  left:   { left: "clamp(1.5rem,8vw,7rem)",  right: "auto",                   maxWidth: "min(60%,580px)" },
  right:  { left: "auto",                    right: "clamp(1.5rem,8vw,7rem)", maxWidth: "min(60%,580px)" },
  center: { left: "50%",                     transform: "translateX(-50%)",   maxWidth: "min(90%,720px)" },
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

// ─── Tipografías compartidas por ambos heros ─────────────────────────────────
const TITLE_STYLE = {
  fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  fontWeight: 300,
  color: "#ffffff",
  lineHeight: 1.04,
  margin: 0,
  whiteSpace: "pre-line",
};
const RULE_BG =
  "linear-gradient(90deg, transparent, #ecb337 30%, #f5d170 50%, #ecb337 70%, transparent)";
const SUB_STYLE = {
  fontFamily: "'Inter','Helvetica Neue',sans-serif",
  fontWeight: 500,
  color: "rgba(236,179,55,0.9)",
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  textShadow: "0 1px 12px rgba(0,0,0,0.95)",
  margin: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hero ESTÁTICO — móvil y pantallas verticales (sin scrollytelling)
// ─────────────────────────────────────────────────────────────────────────────
function StaticHero({ logoSrc }) {
  const titleRef = useRef(null);
  const ruleRef  = useRef(null);
  const subRef   = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 34, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, delay: 0.35 },
    )
      .fromTo(
        ruleRef.current,
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.8 },
        "-=0.55",
      )
      .fromTo(
        subRef.current,
        { opacity: 0, y: 14, letterSpacing: "0.45em" },
        { opacity: 1, y: 0, letterSpacing: "0.32em", duration: 0.8 },
        "-=0.45",
      );
    return () => tl.kill();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100svh",
        overflow: "hidden",
        background: "#050505",
      }}
    >
      <img
        src={FRAME_URLS[0]}
        alt="Casa moderna — InterRenta, bienes raíces en el Oriente Antioqueño"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      {/* Vignette + fade inferior (legibilidad) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background:
            "radial-gradient(ellipse 140% 120% at 50% 55%, transparent 25%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "45%", pointerEvents: "none",
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
        }}
      />

      {/* Logo */}
      {logoSrc && (
        <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", zIndex: 20, pointerEvents: "none" }}>
          <img
            src={logoSrc}
            alt="InterRenta"
            style={{ height: 30, width: "auto", filter: "drop-shadow(0 2px 20px rgba(0,0,0,0.95))" }}
          />
        </div>
      )}

      {/* Texto de marca */}
      <div
        style={{
          position: "absolute",
          bottom: "13%",
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "min(90%,720px)",
          textAlign: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <h2
          ref={titleRef}
          style={{
            ...TITLE_STYLE,
            fontSize: "clamp(2.3rem,9vw,3.4rem)",
            letterSpacing: "0.01em",
            textShadow: "0 1px 14px rgba(0,0,0,0.92)",
            opacity: 0,
          }}
        >
          {"El espacio\nque mereces"}
        </h2>
        <div
          ref={ruleRef}
          style={{ height: 1, background: RULE_BG, margin: "0.8rem 0", opacity: 0, transform: "scaleX(0)" }}
        />
        <p ref={subRef} style={{ ...SUB_STYLE, fontSize: "0.6rem", opacity: 0 }}>
          Diseño · Confort · Vida
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero CINEMATOGRÁFICO — scrollytelling (solo pantallas panorámicas)
// ─────────────────────────────────────────────────────────────────────────────
function ScrollyHero({ logoSrc }) {
  const wrapRef         = useRef(null);
  const canvasRef       = useRef(null);
  // Refs estructurados por overlay: { title, rule, sub }
  const partRefs        = useRef(OVERLAYS.map(() => ({})));
  const progressFillRef = useRef(null);
  const scrollIndRef    = useRef(null);
  const pool            = useRef([]);
  const lastFi          = useRef(-1);
  const introTl         = useRef(null);
  const introDone       = useRef(false);

  const [firstReady, setFirstReady] = useState(false);

  // ── Calcula y fija la altura UNA VEZ al montar ────────────────────────────
  useLayoutEffect(() => {
    if (wrapRef.current) {
      wrapRef.current.style.height =
        `${FRAMES_TOTAL * PX_PER_FRAME + window.innerHeight}px`;
    }
  }, []);

  // ── Dibuja un frame ───────────────────────────────────────────────────────
  const drawFrame = useCallback((fi) => {
    const i = Math.max(0, Math.min(fi, FRAMES_TOTAL - 1));
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

  // ── Animación de overlays (v12: entrada/salida asimétrica + blur + drift) ─
  const FADE_IN  = 0.05; // fase de entrada (fracción del progreso total)
  const FADE_OUT = 0.06; // fase de salida
  const updateScene = useCallback((progress) => {
    OVERLAYS.forEach(({ start, end }, i) => {
      const p = partRefs.current[i];
      if (!p) return;

      // El overlay 0 nace "pre-entrado": la entrada la anima el timeline de
      // intro al cargar; por scroll solo le queda la salida. Mientras la intro
      // no termine (y no se haya scrolleado), no lo toques.
      if (i === 0) {
        if (!introDone.current) {
          if (progress < 0.002) return;
          introTl.current?.kill();
          introDone.current = true;
        }
      }
      const inside = i === 0 ? progress < end : progress > start && progress < end;
      const tIn  = !inside ? 0 : i === 0 ? 1 : smoothstep((progress - start) / FADE_IN);
      const tOut = inside ? smoothstep((end - progress)   / FADE_OUT) : 0;
      const t = Math.min(tIn, tOut); // visibilidad
      // posición dentro de la ventana (0-1) → deriva continua
      const w = inside ? (progress - start) / (end - start) : 0;

      if (p.title) {
        const yEnter = 36 * (1 - tIn);  // entra subiendo
        const yExit  = -28 * (1 - tOut); // sale SIGUIENDO hacia arriba
        const ls = (0.1 * (1 - tIn) - 0.02).toFixed(3);
        gsap.set(p.title, {
          opacity: t,
          y: yEnter + yExit - 10 * w,
          scale: 1 + 0.05 * (1 - tIn),
          letterSpacing: `${ls}em`,
          filter: t < 1 ? `blur(${(6 * (1 - t)).toFixed(1)}px)` : "blur(0px)",
        });
      }

      // Regla — se dibuja en cascada tras el título (sobre la fase de entrada)
      if (p.rule) {
        const tR = smoothstep(Math.max(0, (tIn - 0.3) / 0.7)) * tOut;
        gsap.set(p.rule, { scaleX: tR, opacity: tR });
      }

      // Eyebrow — último en llegar; el tracking se asienta al aparecer
      if (p.sub) {
        const tS = smoothstep(Math.max(0, (tIn - 0.5) / 0.5)) * tOut;
        gsap.set(p.sub, {
          opacity: tS,
          y: 16 * (1 - tS) - 17 * (1 - tOut) - 6 * w,
          letterSpacing: `${(0.45 - 0.13 * tS).toFixed(3)}em`,
        });
      }
    });

    if (progressFillRef.current)
      gsap.set(progressFillRef.current, { scaleX: progress, transformOrigin: "left center" });
    if (scrollIndRef.current)
      gsap.set(scrollIndRef.current, { opacity: progress < 0.04 ? 1 : 0 });
  }, []);

  // ── Carga frames con new Image() ──────────────────────────────────────────
  useEffect(() => {
    pool.current   = new Array(FRAMES_TOTAL).fill(null);
    lastFi.current = -1;
    setFirstReady(false);

    function loadOne(i) {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        pool.current[i] = img;
        img.onload  = () => { if (i === 0) { drawFrame(0); setFirstReady(true); } resolve(); };
        img.onerror = resolve;
        img.src     = FRAME_URLS[i];
      });
    }

    let next = 8;
    function runNext() {
      if (next >= FRAMES_TOTAL) return;
      loadOne(next++).then(runNext);
    }
    Promise.all(
      Array.from({ length: Math.min(8, FRAMES_TOTAL) }, (_, i) => loadOne(i)),
    ).then(() => { for (let c = 0; c < 4; c++) runNext(); });
  }, [drawFrame]);

  // ── Intro: entrada animada del primer overlay al cargar ──────────────────
  useEffect(() => {
    if (!firstReady || introDone.current) return;
    const p = partRefs.current[0];
    if (!p?.title) return;
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => { introDone.current = true; },
    });
    tl.fromTo(
      p.title,
      { opacity: 0, y: 36, scale: 1.05, letterSpacing: "0.1em", filter: "blur(6px)" },
      { opacity: 1, y: 0, scale: 1, letterSpacing: "-0.02em", filter: "blur(0px)", duration: 1.2, delay: 0.3 },
    )
      .fromTo(p.rule, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.9 }, "-=0.6")
      .fromTo(
        p.sub,
        { opacity: 0, y: 16, letterSpacing: "0.45em" },
        { opacity: 1, y: 0, letterSpacing: "0.32em", duration: 0.8 },
        "-=0.5",
      );
    introTl.current = tl;
    return () => tl.kill();
  }, [firstReady]);

  // ── GSAP ScrollTrigger ────────────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const st = ScrollTrigger.create({
      id: "cinematic-hero",
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: ({ progress }) => {
        drawFrame(Math.floor(progress * (FRAMES_TOTAL - 1)));
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
            height: "35%", zIndex: 2, pointerEvents: "none",
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
          }}
        />

        {/* Logo */}
        {logoSrc && (
          <div style={{
            position: "absolute",
            top: "1.5rem",
            left: "1.5rem",
            zIndex: 20, pointerEvents: "none",
          }}>
            <img
              src={logoSrc}
              alt="InterRenta"
              style={{
                height: 46,
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
              bottom: "13%",
              zIndex: 10,
              pointerEvents: "none",
              ...ALIGN_WRAP[ov.align],
            }}
          >
            {/* TÍTULO principal — serif grande */}
            <h2
              ref={(el) => { partRefs.current[i].title = el; }}
              style={{
                ...TITLE_STYLE,
                fontSize: "clamp(3.2rem,5.5vw,6.2rem)",
                letterSpacing: "0.08em",
                textShadow: "0 2px 50px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.6)",
                opacity: 0,
                willChange: "opacity, transform, letter-spacing, filter",
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
                background: RULE_BG,
                margin: "1rem 0",
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
                ...SUB_STYLE,
                fontSize: "clamp(0.6rem,0.95vw,0.78rem)",
                opacity: 0,
                willChange: "opacity, transform, letter-spacing",
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
            bottom: "3rem",
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

// ─────────────────────────────────────────────────────────────────────────────
export default function CinematicHero({ logoSrc }) {
  // Se decide UNA VEZ al montar (rotar el teléfono no reconstruye el hero)
  const [cinematic] = useState(() => supportsCinematic());
  return cinematic ? <ScrollyHero logoSrc={logoSrc} /> : <StaticHero logoSrc={logoSrc} />;
}
