/**
 * CustomCursor.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Cursor personalizado (solo desktop con puntero fino):
 *   • Punto dorado que sigue el mouse al instante.
 *   • Anillo que persigue con lerp (rezago suave, sensación premium).
 *   • Sobre elementos interactivos el anillo crece y se rellena.
 *   • Se desactiva en rutas admin/panel (no estorbar formularios).
 *   • En touch / sin mouse no renderiza nada y no oculta el cursor nativo.
 *
 * El ocultado del cursor nativo se hace vía la clase body.ir-cursor (ver index.css).
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

const HIDDEN_PREFIXES = ["/admin", "/panel"];
const INTERACTIVE =
  "a, button, [role='button'], [data-cursor='hover'], .cursor-pointer, input, textarea, select, label";

export default function CustomCursor() {
  const { pathname } = useLocation();
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  // Se deriva en render (sin setState-in-effect): puntero fino y fuera de admin.
  const enabled = useMemo(() => {
    const fine =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: fine)").matches;
    const onAdmin = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
    return Boolean(fine) && !onAdmin;
  }, [pathname]);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove("ir-cursor");
      return;
    }
    document.body.classList.add("ir-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let raf;

    const show = () => {
      if (visible) return;
      visible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };
    const hide = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      show();
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      const interactive = e.target.closest ? e.target.closest(INTERACTIVE) : null;
      targetScale = interactive ? 1.85 : 1;
      ring.style.backgroundColor = interactive
        ? "rgba(236, 179, 55, 0.12)"
        : "transparent";
      ring.style.borderColor = interactive
        ? "rgba(236, 179, 55, 0.9)"
        : "rgba(236, 179, 55, 0.55)";
    };

    const onDown = () => {
      targetScale *= 0.8;
    };
    const onUp = () => {
      targetScale = Math.abs(targetScale) < 1.3 ? 1 : 1.85;
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      scale += (targetScale - scale) * 0.2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale.toFixed(
        3,
      )})`;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", hide);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", hide);
      document.body.classList.remove("ir-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1.5px solid rgba(236, 179, 55, 0.55)",
          backgroundColor: "transparent",
          pointerEvents: "none",
          zIndex: 100000,
          opacity: 0,
          transition:
            "opacity 0.3s ease, background-color 0.25s ease, border-color 0.25s ease",
          willChange: "transform",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "#ecb337",
          boxShadow: "0 0 10px rgba(236, 179, 55, 0.8)",
          pointerEvents: "none",
          zIndex: 100001,
          opacity: 0,
          transition: "opacity 0.3s ease",
          willChange: "transform",
        }}
      />
    </>
  );
}
