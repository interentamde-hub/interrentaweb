/**
 * CinematicHero.jsx — InterRenta v9
 * Canvas + GSAP ScrollTrigger — scroll scrubbing cinematográfico.
 * Down = forward, up = reverse.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Config ───────────────────────────────────────────────────────────────────
const TOTAL = 181;
const PX_PER_FRAME = 72;

function makeUrls(base) {
  return Array.from(
    { length: TOTAL },
    (_, i) => `${base}/frame_${String(i + 1).padStart(4, "0")}.webp`,
  );
}

const DESKTOP_URLS = makeUrls("/frames/desktop");
const MOBILE_URLS = makeUrls("/frames/mobile");

// ─── Overlays — título + subtítulo por ventana de progreso ───────────────────
const OVERLAYS = [
  {
    id: "o1",
    start: 0.0,
    end: 0.16,
    title: "Donde los sueños",
    sub: "toman forma",
    align: "center",
  },
  {
    id: "o2",
    start: 0.2,
    end: 0.38,
    title: "Construido con visión",
    sub: "cada detalle importa",
    align: "left",
  },
  {
    id: "o3",
    start: 0.42,
    end: 0.6,
    title: "La arquitectura",
    sub: "como expresión de vida",
    align: "right",
  },
  {
    id: "o4",
    start: 0.63,
    end: 0.8,
    title: "Bienvenido",
    sub: "a tu nuevo hogar",
    align: "center",
  },
  {
    id: "o5",
    start: 0.84,
    end: 1.0,
    title: "InterRenta",
    sub: "Tu aliado en bienes raíces · Oriente Antioqueño",
    align: "center",
  },
];

// ─── Layout — todos los overlays usan left:0/right:0; text-align posiciona ───
const ALIGN = {
  left: { textAlign: "left", paddingLeft: "clamp(1.5rem,8vw,7rem)" },
  right: { textAlign: "right", paddingRight: "clamp(1.5rem,8vw,7rem)" },
  center: { textAlign: "center" },
};

// ─── Easing suavizado para el fade ───────────────────────────────────────────
function smoothstep(t) {
  const c = Math.max(0, Math.min(t, 1));
  return c * c * (3 - 2 * c);
}

// ─── Dibuja bitmap cubriendo el canvas (equiv a object-fit: cover) ────────────
function drawCover(ctx, bitmap, cw, ch) {
  const scale = Math.max(cw / bitmap.width, ch / bitmap.height);
  const dw = bitmap.width * scale;
  const dh = bitmap.height * scale;
  ctx.drawImage(bitmap, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CinematicHero({ logoSrc }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRefs = useRef([]);
  const progressFillRef = useRef(null);
  const scrollIndRef = useRef(null);
  const bitmaps = useRef(new Array(TOTAL).fill(null));
  const lastFi = useRef(-1);

  const [firstReady, setFirstReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ── Detect mobile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Draw one frame on canvas ──────────────────────────────────────────────
  const drawFrame = useCallback((fi) => {
    const i = Math.max(0, Math.min(fi, TOTAL - 1));
    if (i === lastFi.current) return;
    lastFi.current = i;
    const bmp = bitmaps.current[i];
    if (!bmp) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    drawCover(ctx, bmp, canvas.width, canvas.height);
  }, []);

  // ── Animate overlays + progress bar (pure DOM via GSAP) ───────────────────
  const FADE = 0.04;
  const updateScene = useCallback(
    (progress) => {
      // Overlays
      overlayRefs.current.forEach((el, i) => {
        if (!el) return;
        const { start, end } = OVERLAYS[i];
        let t = 0;
        if (progress > start && progress < end) {
          t = Math.min(
            smoothstep((progress - start) / FADE),
            smoothstep((end - progress) / FADE),
          );
        }
        gsap.set(el, {
          opacity: t,
          y: 26 * (1 - t),
          filter: t < 0.98 ? `blur(${(10 * (1 - t)).toFixed(1)}px)` : "none",
        });
      });

      // Progress bar
      if (progressFillRef.current) {
        gsap.set(progressFillRef.current, {
          scaleX: progress,
          transformOrigin: "left center",
        });
      }

      // Scroll indicator fade-out
      if (scrollIndRef.current) {
        gsap.set(scrollIndRef.current, { opacity: progress < 0.04 ? 1 : 0 });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Canvas size = viewport ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const currentFi = lastFi.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (currentFi >= 0) {
        lastFi.current = -1; // reset so drawFrame repaints after resize clears canvas
        drawFrame(currentFi);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  // ── Load frames ───────────────────────────────────────────────────────────
  useEffect(() => {
    bitmaps.current = new Array(TOTAL).fill(null);
    lastFi.current = -1;
    setFirstReady(false);

    const urls = isMobile ? MOBILE_URLS : DESKTOP_URLS;

    async function loadFrame(i) {
      try {
        const res = await fetch(urls[i]);
        const blob = await res.blob();
        const bmp = await createImageBitmap(blob);
        bitmaps.current[i] = bmp;
        if (i === 0) {
          drawFrame(0);
          setFirstReady(true);
        }
      } catch {
        // silent: missing frame shows previous
      }
    }

    // Load first 12 frames as priority
    const priority = Array.from({ length: Math.min(12, TOTAL) }, (_, i) =>
      loadFrame(i),
    );

    Promise.all(priority).then(() => {
      // 6 concurrent loaders for the rest
      let next = 12;
      function loadNext() {
        if (next >= TOTAL) return;
        loadFrame(next++).then(loadNext);
      }
      for (let c = 0; c < 6; c++) loadNext();
    });
  }, [isMobile, drawFrame]);

  // ── GSAP ScrollTrigger — scroll scrubs frames forward & backward ──────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const st = ScrollTrigger.create({
      id: "cinematic-hero",
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.9,
      onUpdate: ({ progress }) => {
        drawFrame(Math.floor(progress * (TOTAL - 1)));
        updateScene(progress);
      },
    });

    updateScene(0);

    return () => st.kill();
  }, [drawFrame, updateScene]);

  const totalH = TOTAL * PX_PER_FRAME + window.innerHeight;

  return (
    <div ref={wrapRef} style={{ height: totalH, position: "relative" }}>
      {/* Sticky viewport — se queda en top:0 mientras se scrollea el wrapper */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#0a0a0a",
        }}
      >
        {/* ── Canvas principal ─────────────────────────────────────────── */}
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

        {/* Vignette radial */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 130% 110% at 50% 50%, transparent 30%, rgba(0,0,0,0.52) 100%)",
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
            height: isMobile ? "24%" : "32%",
            zIndex: 2,
            pointerEvents: "none",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)",
          }}
        />

        {/* Logo */}
        {logoSrc && (
          <div
            style={{
              position: "absolute",
              top: isMobile ? "0.75rem" : "1.5rem",
              left: isMobile ? "0.75rem" : "1.5rem",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            <img
              src={logoSrc}
              alt="InterRenta"
              style={{
                height: isMobile ? 34 : 50,
                width: "auto",
                filter: "drop-shadow(0 2px 16px rgba(0,0,0,0.9))",
              }}
            />
          </div>
        )}

        {/* ── Overlay titles ────────────────────────────────────────────── */}
        {OVERLAYS.map((ov, i) => (
          <div
            key={ov.id}
            ref={(el) => (overlayRefs.current[i] = el)}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: isMobile ? "10%" : "13%",
              padding: "0 clamp(1.5rem,5vw,4rem)",
              zIndex: 10,
              pointerEvents: "none",
              opacity: 0,
              willChange: "opacity, transform, filter",
              ...ALIGN[ov.align],
            }}
          >
            {/* Subtítulo dorado encima */}
            <p
              style={{
                fontFamily: "'Inter','Helvetica Neue',sans-serif",
                fontSize: isMobile
                  ? "0.56rem"
                  : "clamp(0.6rem,1vw,0.78rem)",
                fontWeight: 400,
                color: "rgba(236,179,55,0.88)",
                letterSpacing: "0.34em",
                textTransform: "uppercase",
                marginBottom: isMobile ? "0.45rem" : "0.75rem",
                textShadow: "0 1px 14px rgba(0,0,0,0.75)",
              }}
            >
              {ov.sub}
            </p>

            {/* Título principal serif */}
            <h2
              style={{
                fontFamily:
                  "'Cormorant Garamond','Playfair Display',Georgia,serif",
                fontSize: isMobile
                  ? "clamp(2rem,8vw,2.8rem)"
                  : "clamp(3rem,5.5vw,6rem)",
                fontWeight: 300,
                color: "rgba(255,255,255,0.96)",
                lineHeight: 1.04,
                letterSpacing: "-0.015em",
                textShadow: "0 4px 64px rgba(0,0,0,0.8)",
                margin: 0,
              }}
            >
              {ov.title}
            </h2>
          </div>
        ))}

        {/* ── Barra de progreso ─────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
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
              background: "linear-gradient(90deg, #ecb337, #f5d170)",
              transform: "scaleX(0)",
              transformOrigin: "left center",
              boxShadow: "0 0 10px rgba(236,179,55,0.55)",
            }}
          />
        </div>

        {/* ── Indicador de scroll ───────────────────────────────────────── */}
        <div
          ref={scrollIndRef}
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
              fontSize: "0.53rem",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Scroll
          </span>
          {/* Mouse SVG con animación CSS */}
          <svg
            width="19"
            height="30"
            viewBox="0 0 19 30"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="0.75"
              y="0.75"
              width="17.5"
              height="28.5"
              rx="8.75"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
            />
            <rect
              x="8.5"
              y="5"
              width="2"
              height="7"
              rx="1"
              fill="rgba(236,179,55,0.55)"
            >
              <animate
                attributeName="y"
                values="5;14;5"
                dur="1.7s"
                repeatCount="indefinite"
                calcMode="ease"
              />
              <animate
                attributeName="opacity"
                values="1;0.2;1"
                dur="1.7s"
                repeatCount="indefinite"
              />
            </rect>
          </svg>
        </div>
      </div>
    </div>
  );
}
