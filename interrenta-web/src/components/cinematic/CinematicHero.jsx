/**
 * CinematicHero.jsx — InterRenta v4 DEFINITIVO
 * ─────────────────────────────────────────────
 * UBICACIÓN: src/components/cinematic/CinematicHero.jsx
 *
 * Frames en:  public/frames/fase1/ezgif-frame-001.jpg  ... 061
 *             public/frames/fase2/ezgif-frame-001.jpg  ... 076
 *
 * CAMBIOS v4:
 *  - Sin import.meta.glob (usamos URLs directas desde /public)
 *  - drawFrame ahora espera a que la imagen cargue y redibuja
 *  - Panel DEBUG visible en pantalla (quitar cuando todo funcione)
 *  - pendingFrameRef: si scroll llegó a un frame antes de que cargue,
 *    lo dibuja en cuanto la imagen esté lista
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
// Ajusta 'ext' si tus frames no son .jpg
const EXT        = 'jpg'
const FASE1_N    = 61
const FASE2_N    = 76
const PX_PER_FRAME = 85

// Genera URLs: /frames/fase1/ezgif-frame-001.jpg etc.
function urls(base, n) {
  return Array.from({ length: n }, (_, i) =>
    `${base}/ezgif-frame-${String(i + 1).padStart(3, '0')}.${EXT}`
  )
}

const F1    = urls('/frames/fase1', FASE1_N)
const F2    = urls('/frames/fase2', FASE2_N)
const ALL   = [...F1, ...F2]
const TOTAL = ALL.length  // siempre 137

const TOTAL_H = () => TOTAL * PX_PER_FRAME + window.innerHeight

// ─── Overlays ─────────────────────────────────────────────────────────────────
const OVS = [
  { id:'o1', s:0,   e:18,      title:'Donde los sueños',     sub:'toman forma',                align:'center' },
  { id:'o2', s:22,  e:42,      title:'Construido con visión', sub:'cada detalle importa',       align:'left'   },
  { id:'o3', s:46,  e:60,      title:'La arquitectura',       sub:'como expresión de vida',     align:'right'  },
  { id:'o4', s:65,  e:88,      title:'Bienvenido',            sub:'a tu nuevo hogar',           align:'center' },
  { id:'o5', s:95,  e:115,     title:'Cada espacio cuenta',   sub:'diseñado para vivir',        align:'left'   },
  { id:'o6', s:120, e:TOTAL-1, title:'InterRenta',            sub:'Tu aliado en bienes raíces', align:'center' },
]

const A = {
  left:   { textAlign:'left',   left:'8%',  right:'auto', maxWidth:'50%' },
  right:  { textAlign:'right',  left:'auto', right:'8%', maxWidth:'50%' },
  center: { textAlign:'center', left:0,      right:0,     maxWidth:'100%' },
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CinematicHero({ logoSrc }) {
  const wrapRef    = useRef(null)   // div exterior (scroll rail)
  const canvasRef  = useRef(null)
  const imgs       = useRef([])     // Image[]
  const curFi      = useRef(0)
  const pendingFi  = useRef(-1)     // frame pedido antes de que cargue
  const rafId      = useRef(null)
  const topCache   = useRef(0)
  const hCache     = useRef(0)

  const [ov,      setOv]      = useState(OVS[0])
  const [pct,     setPct]     = useState(0)
  const [showInd, setShowInd] = useState(true)

  // ── DEBUG: muestra info en pantalla ─────────────────────────────────────
  // Cambia a false cuando todo funcione
  const DEBUG = true
  const [loaded,   setLoaded]   = useState(0)
  const [debugFi,  setDebugFi]  = useState(0)

  // ── Actualiza el canvas ──────────────────────────────────────────────────
  const paint = useCallback((fi) => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0) return
    const img = imgs.current[fi]
    if (!img) return

    if (img.complete && img.naturalWidth > 0) {
      const ctx = canvas.getContext('2d', { alpha: false })
      const { width: cw, height: ch } = canvas
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      ctx.drawImage(
        img,
        (cw - img.naturalWidth  * scale) / 2,
        (ch - img.naturalHeight * scale) / 2,
        img.naturalWidth  * scale,
        img.naturalHeight * scale
      )
    } else {
      // imagen aún no cargó → marca como pendiente
      // onload la dibujará cuando esté lista
      pendingFi.current = fi
    }
  }, [])

  // ── Preload ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let count = 0
    imgs.current = ALL.map((src, i) => {
      const img = new window.Image()
      img.src   = src
      img.onload = () => {
        count++
        setLoaded(count)
        // si este frame fue pedido antes de cargar, dibújalo ahora
        if (pendingFi.current === i || (i === 0 && count === 1)) {
          pendingFi.current = -1
          paint(i)
        }
      }
      img.onerror = () => {
        // URL incorrecta → lo sabremos por loaded < TOTAL en debug
        count++
        setLoaded(count)
      }
      return img
    })
  }, [paint])

  // ── Resize canvas ────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current
      if (!c) return
      c.width  = window.innerWidth
      c.height = window.innerHeight
      paint(curFi.current)
      // Re-cachea dimensiones
      const el = wrapRef.current
      if (el) { topCache.current = el.offsetTop; hCache.current = el.offsetHeight }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [paint])

  // ── Cachea offsetTop / offsetHeight del contenedor ───────────────────────
  useEffect(() => {
    const cache = () => {
      const el = wrapRef.current
      if (!el) return
      // Recorre offsetParent para obtener top real respecto al documento
      let top = 0, node = el
      while (node) { top += node.offsetTop || 0; node = node.offsetParent }
      topCache.current = top
      hCache.current   = el.offsetHeight
    }
    // Primer cache después de que el DOM esté estable
    const t = setTimeout(cache, 200)
    return () => clearTimeout(t)
  }, [])

  // ── Scroll → frame ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        // Cachea en caliente si aún no está listo
        if (hCache.current === 0) {
          const el = wrapRef.current
          if (el) {
            let top = 0, node = el
            while (node) { top += node.offsetTop || 0; node = node.offsetParent }
            topCache.current = top
            hCache.current   = el.offsetHeight
          }
        }

        const scrolled  = window.scrollY - topCache.current
        const maxScroll = hCache.current - window.innerHeight
        if (maxScroll <= 0) return

        const p  = Math.max(0, Math.min(scrolled / maxScroll, 1))
        const fi = Math.min(Math.round(p * (TOTAL - 1)), TOTAL - 1)

        if (fi !== curFi.current || p === 0) {
          curFi.current = fi
          paint(fi)
          setDebugFi(fi)
          setPct(p)
          setShowInd(p < 0.04)
          setOv(OVS.find(o => fi >= o.s && fi <= o.e) ?? null)
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [paint])

  const totalH = TOTAL_H()

  return (
    <div ref={wrapRef} style={{ height: totalH, position: 'relative' }}>

      {/* ── Sticky viewport ──────────────────────────────────────────── */}
      <div style={{ position:'sticky', top:0, height:'100vh', overflow:'hidden', background:'#0a0a0a' }}>

        <canvas ref={canvasRef} aria-hidden="true"
          style={{ display:'block', width:'100%', height:'100%' }} />

        {/* Vignette */}
        <div aria-hidden="true" style={{
          position:'absolute', inset:0, pointerEvents:'none',
          background:'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}/>

        {/* Fade inferior */}
        <div aria-hidden="true" style={{
          position:'absolute', bottom:0, left:0, right:0, height:'35%',
          pointerEvents:'none',
          background:'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 100%)',
        }}/>

        {/* Logo */}
        {logoSrc && (
          <div style={{ position:'absolute', top:'1.5rem', left:'1.5rem', zIndex:10, pointerEvents:'none' }}>
            <img src={logoSrc} alt="InterRenta"
              style={{ height:52, width:'auto', filter:'drop-shadow(0 2px 12px rgba(0,0,0,.7))' }}/>
          </div>
        )}

        {/* ── PANEL DEBUG (visible en pantalla) ── quitar cuando funcione ─ */}
        {DEBUG && (
          <div style={{
            position:'absolute', top:'1rem', right:'1rem', zIndex:999,
            background:'rgba(0,0,0,0.82)', border:'1px solid #ecb337',
            borderRadius:8, padding:'0.6rem 0.9rem',
            fontFamily:'monospace', fontSize:'0.72rem', color:'#ecb337',
            lineHeight:1.7, pointerEvents:'none',
          }}>
            <div>TOTAL frames : <b>{TOTAL}</b></div>
            <div>Cargadas     : <b style={{ color: loaded >= TOTAL ? '#4ade80' : '#ecb337' }}>{loaded}</b></div>
            <div>Frame actual : <b>{debugFi}</b></div>
            <div>Scroll %     : <b>{Math.round(pct * 100)}</b></div>
            <div>Altura rail  : <b>{Math.round(totalH)}</b>px</div>
            <div style={{ marginTop:'0.3rem', color: loaded > 0 ? '#4ade80' : '#f87171' }}>
              {loaded > 0 ? `✓ ${loaded} imágenes OK` : '✗ Sin imágenes — revisa /public/frames/'}
            </div>
          </div>
        )}

        {/* Text overlay */}
        <AnimatePresence mode="wait">
          {ov && (
            <motion.div key={ov.id}
              initial={{ opacity:0, y:36, filter:'blur(14px)' }}
              animate={{ opacity:1, y:0,  filter:'blur(0px)'  }}
              exit={{    opacity:0, y:-22, filter:'blur(10px)' }}
              transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
              style={{ position:'absolute', bottom:'14%', zIndex:10, padding:'0 2rem', pointerEvents:'none', ...A[ov.align] }}
            >
              <h2 style={{
                fontFamily:"'Cormorant Garamond','Playfair Display',Georgia,serif",
                fontSize:'clamp(2.6rem,6.5vw,5.8rem)', fontWeight:300,
                color:'rgba(255,255,255,0.93)', lineHeight:1.08, letterSpacing:'-0.01em',
                textShadow:'0 4px 50px rgba(0,0,0,0.65)', margin:0,
              }}>{ov.title}</h2>
              <p style={{
                fontFamily:"'Inter','Helvetica Neue',sans-serif",
                fontSize:'clamp(0.72rem,1.6vw,1rem)', fontWeight:300,
                color:'rgba(236,179,55,0.88)', letterSpacing:'0.28em',
                textTransform:'uppercase', marginTop:'0.9rem',
                textShadow:'0 2px 24px rgba(0,0,0,0.6)',
              }}>{ov.sub}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de progreso */}
        <div aria-hidden="true" style={{
          position:'absolute', bottom:0, left:0, right:0,
          height:2, background:'rgba(255,255,255,0.08)', zIndex:20,
        }}>
          <div style={{
            height:'100%', width:`${pct * 100}%`,
            background:'linear-gradient(90deg,#ecb337,#f5d170)',
            transition:'width 0.06s linear',
            boxShadow:'0 0 10px rgba(236,179,55,0.6)',
          }}/>
        </div>

        {/* Scroll mouse */}
        <AnimatePresence>
          {showInd && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{
                position:'absolute', bottom:'3.5rem', left:'50%',
                transform:'translateX(-50%)', display:'flex',
                flexDirection:'column', alignItems:'center', gap:'0.6rem',
                pointerEvents:'none', zIndex:10,
              }}
            >
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:'0.6rem', letterSpacing:'0.35em', textTransform:'uppercase', color:'rgba(255,255,255,0.38)' }}>Scroll</span>
              <motion.div animate={{ y:[0,6,0] }} transition={{ duration:1.6, repeat:Infinity, ease:'easeInOut' }}
                style={{ width:22, height:36, borderRadius:11, border:'1.5px solid rgba(255,255,255,0.28)', display:'flex', justifyContent:'center', paddingTop:7 }}>
                <div style={{ width:3, height:7, borderRadius:2, background:'rgba(236,179,55,0.55)' }}/>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicadores de fase */}
        <div aria-hidden="true" style={{
          position:'absolute', bottom:'3.5rem', right:'1.5rem',
          zIndex:10, pointerEvents:'none',
          display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.4rem',
        }}>
          {[
            { label:'Construcción', s:0,       e:FASE1_N },
            { label:'Recorrido',    s:FASE1_N,  e:TOTAL  },
          ].map(ph => {
            const active = debugFi >= ph.s && debugFi < ph.e
            return (
              <div key={ph.label} style={{ display:'flex', alignItems:'center', gap:'0.5rem', opacity:active?1:0.3, transition:'opacity 0.4s' }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', color:active?'#ecb337':'rgba(255,255,255,0.5)' }}>{ph.label}</span>
                <div style={{ width:24, height:1.5, background:active?'linear-gradient(90deg,#ecb337,#f5d170)':'rgba(255,255,255,0.3)', transition:'background 0.4s' }}/>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}