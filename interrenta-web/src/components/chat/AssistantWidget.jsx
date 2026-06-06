/**
 * AssistantWidget.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Burbuja flotante (estilo WhatsApp) que abre el asistente conversacional.
 *   • Bottom-left para no chocar con el botón de WhatsApp (bottom-right).
 *   • Escucha el evento global ASSISTANT_EVENT para abrirse y recibir consultas
 *     desde la barra "Describe lo que buscas" o el CTA de "Nosotros".
 *   • En desktop abre un panel anclado; en móvil ocupa el ancho disponible.
 *   • Se oculta en rutas admin/panel.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AssistantChat from "./AssistantChat";
import { ASSISTANT_EVENT } from "./assistantBus";

const HIDDEN_PREFIXES = ["/admin", "/panel"];

export default function AssistantWidget() {
  const { pathname } = useLocation();
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [externalQuery, setExternalQuery] = useState(null);
  const [showTip, setShowTip] = useState(false);

  // Aparece la burbuja tras un breve retardo (después del preloader)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1600);
    return () => clearTimeout(t);
  }, []);

  // Tooltip automático una vez
  useEffect(() => {
    if (!mounted) return;
    const a = setTimeout(() => setShowTip(true), 1200);
    const b = setTimeout(() => setShowTip(false), 6500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [mounted]);

  // Escucha el evento global para abrir + recibir consulta
  useEffect(() => {
    const onOpen = (e) => {
      setOpen(true);
      setShowTip(false);
      const text = e?.detail?.text;
      if (text) setExternalQuery({ text, nonce: Date.now() });
    };
    window.addEventListener(ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(ASSISTANT_EVENT, onOpen);
  }, []);

  if (hidden) return null;

  return (
    <>
      {/* Panel del chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="assistant-panel"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed z-[60] bottom-24 left-3 right-3 sm:left-6 sm:right-auto sm:w-[390px]"
            style={{ height: "min(72vh, 620px)", transformOrigin: "bottom left" }}
          >
            <div className="h-full">
              <AssistantChat externalQuery={externalQuery} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burbuja + tooltip */}
      <AnimatePresence>
        {mounted && (
          <div className="fixed bottom-6 left-6 z-[60] flex items-end gap-3">
            <motion.button
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => { setOpen((o) => !o); setShowTip(false); }}
              data-cursor="hover"
              aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
              className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #ecb337, #d7af4d)",
                color: "#161616",
                boxShadow: "0 6px 26px rgba(236, 179, 55, 0.45)",
              }}
            >
              {!open && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: "#ecb337" }}
                />
              )}
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.svg
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    className="w-6 h-6 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="chat"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    className="w-7 h-7 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l.8-4.2A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
              {showTip && !open && (
                <motion.div
                  initial={{ opacity: 0, x: -12, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -12, scale: 0.9 }}
                  className="mb-1 px-4 py-2 rounded-xl text-sm font-medium shadow-lg max-w-[210px]"
                  style={{
                    backgroundColor: "#262525",
                    color: "#e2e2e2",
                    border: "1px solid rgba(236,179,55,0.25)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  ✦ ¿Buscas algo? Pregúntame
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
