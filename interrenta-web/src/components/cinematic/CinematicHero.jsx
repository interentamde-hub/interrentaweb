/**
 * CinematicHero.jsx
 * ──────────────────────────────────────────────────────────────────────────────
 * UBICACIÓN SUGERIDA: src/components/cinematic/CinematicHero.jsx
 *
 * AJUSTA LAS RUTAS GLOB según tu estructura de carpetas.
 * Si tu Home.jsx está en src/pages/ y este archivo en src/components/cinematic/,
 * las rutas correctas son: '../../assets/FaseScroll1/...'
 *
 * Si pones este archivo junto a Home.jsx en src/pages/:
 * las rutas correctas son: '../assets/FaseScroll1/...'
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Importación de frames via Vite glob ───────────────────────────────────────
// ⚠ AJUSTA ESTAS RUTAS según donde coloques este componente
const fase1Raw = import.meta.glob(
  '../../assets/FaseScroll1/*.{jpg,jpeg,png,webp}',
  { eager: true }
)
const fase2Raw = import.meta.glob(
  '../../assets/FaseScroll2/*.{jpg,jpeg,png,webp}',
  { eager: true }
)

function sortedUrls(modules) {
  return Object.keys(modules)
    .sort() // ordena alfabéticamente → ezgif-frame-001, 002 ...
    .map((k) => modules[k]?.default)
    .filter(Boolean)
}

const FASE1 = sortedUrls(fase1Raw)   // 61 frames
const FASE2 = sortedUrls(fase2Raw)   // 76 frames
const ALL_FRAMES = [...FASE1, ...FASE2]
const TOTAL = ALL_FRAMES.length || 1

// ── Overlays de texto (ajusta start/end a gusto) ──────────────────────────────
const OVERLAYS = [
  {
    id: 'o1',
    start: 0,
    end: 18,
    title: 'Donde los sueños',
    sub: 'toman forma',
    align: 'center',
  },
  {
    id: 'o2',
    start: 22,
    end: 42,
    title: 'Construido con visión',
    sub: 'cada detalle importa',
    align: 'left',
  },
  {
    id: 'o3',
    start: 46,
    end: 61,
    title: 'La arquitectura',
    sub: 'como expresión de vida',
    align: 'right',
  },
  {
    id: 'o4',
    start: 65,
    end: 88,
    title: 'Bienvenido',
    sub: 'a tu nuevo hogar',
    align: 'center',
  },
  {
    id: 'o5',
    start: 95,
    end: 115,
    title: 'Cada espacio',
    sub: 'diseñado para vivir',
    align: 'left',
  },
  {
    id: 'o6',
    start: 125,
    end: TOTAL - 1,
    title: 'InterRenta',
    sub: 'Tu aliado en bienes raíces — Oriente Antioqueño',
    align: 'center',
  },
]

// px de scroll por frame — controla la velocidad de la "película"
const PX_PER_FRAME = 85

export default function CinematicHero({ logoSrc }) {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)
  const imagesRef    = useRef([])    // Image objects precargados
  const curFrameRef  = useRef(0)
  const rafRef       = useRef(null)
  const lastDrawRef  = useRef(-1)

  const [activeOverlay, setActiveOverlay] = useState(OVERLAYS[0])
  const [scrollPct, setScrollPct]         = useState(0)
  const [isAtStart, setIsAtStart]         = useState(true)

  // ── Dibujar frame en canvas ──────────────────────────────────────────────
  const drawFrame = useCallback((idx) => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (idx === lastDrawRef.current) return // evita re-renders innecesarios
    lastDrawRef.current = idx

    const img = imagesRef.current[idx]
    if (!img?.complete || !img.naturalWidth) return

    const ctx = canvas.getContext('2d', { alpha: false })
    const cw = canvas.width, ch = canvas.height
    const iw = img.naturalWidth, ih = img.naturalHeight

    // Cover: mantiene aspect ratio y rellena el canvas
    const scale  = Math.max(cw / iw, ch / ih)
    const sw = iw * scale, sh = ih * scale
    const sx = (cw - sw) / 2, sy = (ch - sh) / 2

    ctx.drawImage(img, sx, sy, sw, sh)
  }, [])

  // ── Preload de imágenes ──────────────────────────────────────────────────
  useEffect(() => {
    const imgs = ALL_FRAMES.map((src, i) => {
      const img = new window.Image()
      img.src = src
      // Dibuja el primer frame tan pronto cargue
      if (i === 0) img.onload = () => drawFrame(0)
      return img
    })
    imagesRef.current = imgs
  }, [drawFrame])

  // ── Resize canvas ─────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      lastDrawRef.current = -1
      drawFrame(curFrameRef.current)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [drawFrame])

  // ── Scroll → frame ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const el = containerRef.current
        if (!el) return

        const scrolled  = window.scrollY - el.offsetTop
        const maxScroll = el.offsetHeight - window.innerHeight

        if (maxScroll <= 0) return
        const clampedScroll = Math.max(0, Math.min(scrolled, maxScroll))

        const pct  = clampedScroll / maxScroll
        const fi   = Math.min(Math.round(pct * (TOTAL - 1)), TOTAL - 1)

        setScrollPct(pct)
        setIsAtStart(pct < 0.04)

        if (fi !== curFrameRef.current) {
          curFrameRef.current = fi
          drawFrame(fi)

          const ov = OVERLAYS.find((o) => fi >= o.start && fi <= o.end) ?? null
          setActiveOverlay(ov)
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [drawFrame])

  // Altura total del "carril de scroll"
  const totalH = TOTAL * PX_PER_FRAME + (typeof window !== 'undefined' ? window.innerHeight : 900)

  // Alineación horizontal del overlay
  const alignMap = {
    left:   { textAlign: 'left',   left: '8%',   right: 'auto', maxWidth: '50%' },
    right:  { textAlign: 'right',  left: 'auto',  right: '8%',  maxWidth: '50%' },
    center: { textAlign: 'center', left: 0,       right: 0,      maxWidth: '100%' },
  }

  return (
    <div ref={containerRef} style={{ height: totalH, position: 'relative' }}>
      {/* ── Viewport sticky ──────────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: '#0a0a0a',
        }}
      >
        {/* Canvas principal */}
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%' }}
          aria-hidden="true"
        />

        {/* Vignette: oscurece bordes para profundidad cinematográfica */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Gradiente inferior suave */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '35%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* ── Logo watermark ──────────────────────────────────────────── */}
        {logoSrc && (
          <div
            style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <img
              src={logoSrc}
              alt="InterRenta"
              style={{ height: 52, width: 'auto', filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.7))' }}
            />
          </div>
        )}

        {/* ── Text overlay ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeOverlay && (
            <motion.div
              key={activeOverlay.id}
              initial={{ opacity: 0, y: 36, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0,  filter: 'blur(0px)'  }}
              exit={{    opacity: 0, y: -22, filter: 'blur(10px)' }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                bottom: '14%',
                zIndex: 10,
                padding: '0 2rem',
                pointerEvents: 'none',
                ...alignMap[activeOverlay.align ?? 'center'],
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(2.6rem, 6.5vw, 5.8rem)',
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.93)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.01em',
                  textShadow: '0 4px 50px rgba(0,0,0,0.65)',
                  margin: 0,
                }}
              >
                {activeOverlay.title}
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                  fontSize: 'clamp(0.72rem, 1.6vw, 1rem)',
                  fontWeight: 300,
                  color: 'rgba(236,179,55,0.88)',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  marginTop: '0.9rem',
                  textShadow: '0 2px 24px rgba(0,0,0,0.6)',
                }}
              >
                {activeOverlay.sub}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Barra de progreso cinematográfica ────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: 2,
            background: 'rgba(255,255,255,0.08)',
            zIndex: 20,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${scrollPct * 100}%`,
              background: 'linear-gradient(90deg, #ecb337 0%, #f5d170 100%)',
              transition: 'width 0.06s linear',
              boxShadow: '0 0 10px rgba(236,179,55,0.6)',
            }}
          />
        </div>

        {/* ── Indicador de scroll (visible al inicio) ──────────────────── */}
        <AnimatePresence>
          {isAtStart && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1,  y: 0 }}
              exit={{    opacity: 0,  y: 10 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                bottom: '3.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.6rem',
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.38)',
                }}
              >
                Scroll
              </span>
              {/* Mouse icon animado */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 22,
                  height: 36,
                  borderRadius: 11,
                  border: '1.5px solid rgba(255,255,255,0.28)',
                  display: 'flex',
                  justifyContent: 'center',
                  paddingTop: 7,
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 7,
                    borderRadius: 2,
                    background: 'rgba(236,179,55,0.55)',
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Indicador fase (FaseScroll1 / FaseScroll2) ───────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '3.5rem',
            right: '1.5rem',
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.4rem',
          }}
        >
          {[
            { label: 'Construcción', frames: FASE1.length },
            { label: 'Recorrido',    frames: FASE2.length },
          ].map((phase, i) => {
            const phaseStart = i === 0 ? 0 : FASE1.length
            const phaseEnd   = phaseStart + phase.frames
            const active     = curFrameRef.current >= phaseStart && curFrameRef.current < phaseEnd
            return (
              <div
                key={phase.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: active ? 1 : 0.28,
                  transition: 'opacity 0.4s',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.6rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: active ? '#ecb337' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {phase.label}
                </span>
                <div
                  style={{
                    width: 24,
                    height: 1.5,
                    background: active
                      ? 'linear-gradient(90deg, #ecb337, #f5d170)'
                      : 'rgba(255,255,255,0.3)',
                    transition: 'background 0.4s',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}