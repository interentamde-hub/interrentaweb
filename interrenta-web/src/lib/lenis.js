/**
 * lib/lenis.js — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Singleton del scroll suave (Lenis) + helpers que funcionan con o sin Lenis.
 *   • En mobile no se inicializa Lenis (scroll nativo) → los helpers caen al
 *     comportamiento nativo automáticamente.
 * ──────────────────────────────────────────────────────────────────────────────
 */

let _lenis = null;

export function setLenis(instance) {
  _lenis = instance;
}

export function getLenis() {
  return _lenis;
}

export function scrollToTop(immediate = true) {
  if (_lenis) {
    _lenis.scrollTo(0, { immediate });
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: immediate ? "auto" : "smooth" });
  }
}

export function scrollToEl(target, { offset = -80 } = {}) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;
  if (_lenis) {
    _lenis.scrollTo(el, { offset });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
