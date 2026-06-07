/**
 * AssistantChat.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Asistente conversacional híbrido (chips guiados + texto libre + IA).
 *   • Saludo inicial sin llamar a la API (ahorra costo).
 *   • Cada turno llama a /api/chat → OpenAI interpreta y Supabase devuelve
 *     las propiedades reales que se muestran como tarjetas dentro del chat.
 *   • Tras recomendar, ofrece dejar datos (lead → Supabase) + WhatsApp.
 *   • Si la API no está disponible, cae con gracia a un CTA de WhatsApp.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { sendChat, saveLead } from "../../services/assistant.service";

const WA_NUMBER = "573195227378";
const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Inter', sans-serif";

const GREETING =
  "¡Hola! 👋 Soy el asistente de InterRenta. Te ayudo a encontrar tu próximo hogar en el Oriente Antioqueño. ¿Buscas arrendar o comprar?";

const OPERACION_CHIPS = [
  { label: "🏠 Arrendar", text: "Quiero arrendar" },
  { label: "🏷️ Comprar", text: "Quiero comprar" },
];
const ZONA_CHIPS = ["Rionegro", "Envigado", "El Retiro", "San Vicente"].map((z) => ({
  label: z,
  text: `En ${z}`,
}));
const BUDGET_ARRIENDO = [
  { label: "Hasta $1.000.000", text: "Mi presupuesto es hasta $1.000.000 mensuales" },
  { label: "$1M – $2M", text: "Mi presupuesto es alrededor de $2.000.000 mensuales" },
  { label: "$2M – $4M", text: "Mi presupuesto es alrededor de $4.000.000 mensuales" },
  { label: "Más de $4M", text: "Mi presupuesto es más de $4.000.000 mensuales" },
];
const BUDGET_VENTA = [
  { label: "Hasta $200M", text: "Mi presupuesto de compra es hasta $200.000.000" },
  { label: "$200M – $400M", text: "Mi presupuesto de compra es alrededor de $400.000.000" },
  { label: "$400M – $700M", text: "Mi presupuesto de compra es alrededor de $700.000.000" },
  { label: "Más de $700M", text: "Mi presupuesto de compra es más de $700.000.000" },
];

function getSuggestions(filtros) {
  if (!filtros.operacion) return OPERACION_CHIPS;
  if (!filtros.presupuesto)
    return filtros.operacion === "venta" ? BUDGET_VENTA : BUDGET_ARRIENDO;
  if (!filtros.zona) return ZONA_CHIPS;
  return [];
}

const fmt = (n) => "$" + Number(n || 0).toLocaleString("es-CO");

// ─── Tarjeta mini de propiedad dentro del chat ───────────────────────────────
function MiniProperty({ p }) {
  const wa = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hola, me interesa la propiedad ${p.code}: ${p.title}.`,
  )}`;
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "#161616", border: "1px solid rgba(236,179,55,0.18)" }}
    >
      <div className="relative h-28">
        {p.cover_url ? (
          <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#262525" }}>
            <span className="text-3xl opacity-40">🏠</span>
          </div>
        )}
        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold"
          style={{ backgroundColor: "rgba(22,22,22,0.85)", color: "#ecb337" }}
        >
          {p.code}
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold line-clamp-1" style={{ color: "#e2e2e2", fontFamily: SANS }}>
          {p.title}
        </p>
        <p className="text-[11px] mb-1.5 line-clamp-1" style={{ color: "#9aa0ad", fontFamily: SANS }}>
          {[p.sector, p.subsector].filter(Boolean).join(", ") || "Oriente Antioqueño"}
        </p>
        <div className="flex items-center gap-2 mb-2 text-[11px]" style={{ color: "#b8bcc8" }}>
          {p.bedrooms ? <span>🛏️ {p.bedrooms}</span> : null}
          {p.bathrooms ? <span>🚿 {p.bathrooms}</span> : null}
          {p.area ? <span>📐 {p.area}m²</span> : null}
        </div>
        <div className="flex items-end justify-between">
          <span className="font-bold" style={{ color: "#ecb337", fontFamily: SERIF, fontSize: "1.05rem" }}>
            {fmt(p.price)}
            {p.contract_type === "arriendo" && (
              <span className="text-[10px] font-normal" style={{ color: "#9aa0ad" }}> /mes</span>
            )}
          </span>
        </div>
        <div className="flex gap-2 mt-2">
          <Link
            to={`/propiedades/${p.code}`}
            data-cursor="hover"
            className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ backgroundColor: "rgba(236,179,55,0.14)", color: "#ecb337", fontFamily: SANS }}
          >
            Ver
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
            style={{ backgroundColor: "#25D366", fontFamily: SANS }}
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

let _id = 0;
const nextId = () => ++_id;

export default function AssistantChat({ externalQuery }) {
  const [messages, setMessages] = useState([
    { id: nextId(), role: "assistant", content: GREETING, propiedades: [] },
  ]);
  const [filtros, setFiltros] = useState({
    operacion: null,
    presupuesto: null,
    zona: null,
    alcobas: null,
    tipo: null,
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [fallback, setFallback] = useState(false);

  const [lead, setLead] = useState({ nombre: "", telefono: "" });
  const [leadState, setLeadState] = useState("idle"); // idle | sending | done

  const scrollRef = useRef(null);
  const sendRef = useRef(null);
  const lastExternal = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, searched]);

  // Mantiene la referencia a la última versión de send().
  useEffect(() => {
    sendRef.current = send;
  });

  // Consulta inyectada desde la barra "Describe lo que buscas".
  useEffect(() => {
    if (externalQuery && externalQuery.text && externalQuery.nonce !== lastExternal.current) {
      lastExternal.current = externalQuery.nonce;
      sendRef.current?.(externalQuery.text);
    }
  }, [externalQuery]);

  const suggestions = !loading && !fallback ? getSuggestions(filtros) : [];

  async function send(text) {
    const clean = (text || "").trim();
    if (!clean || loading) return;

    const userMsg = { id: nextId(), role: "user", content: clean };
    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setFallback(false);

    try {
      const data = await sendChat(history, filtros);
      if (data.filtros) setFiltros((f) => ({ ...f, ...data.filtros }));
      const hasProps = Array.isArray(data.propiedades) && data.propiedades.length > 0;
      if (hasProps) setSearched(true);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: data.reply || "Cuéntame un poco más para ayudarte mejor.",
          propiedades: hasProps ? data.propiedades : [],
        },
      ]);
    } catch (err) {
      setFallback(true);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content:
            "Ahora mismo no puedo procesar tu solicitud aquí, pero con gusto te atendemos directo por WhatsApp 👇",
          propiedades: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function submitLead(e) {
    e.preventDefault();
    if (!lead.nombre.trim() || !lead.telefono.trim() || leadState === "sending") return;
    setLeadState("sending");
    try {
      await saveLead({
        nombre: lead.nombre.trim(),
        telefono: lead.telefono.trim(),
        operacion: filtros.operacion,
        presupuesto: filtros.presupuesto,
        zona: filtros.zona,
        alcobas: filtros.alcobas,
        tipo: filtros.tipo,
        mensaje: "Solicitud desde el asistente web",
      });
    } catch {
      /* aunque falle el guardado, igual lo mandamos a WhatsApp */
    }
    setLeadState("done");
  }

  const waLeadUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hola, soy ${lead.nombre || "un cliente"}. Busco ${filtros.operacion || "una propiedad"}` +
      `${filtros.zona ? ` en ${filtros.zona}` : ""}` +
      `${filtros.presupuesto ? ` con presupuesto de ${fmt(filtros.presupuesto)}` : ""}.`,
  )}`;
  const waGenericUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "Hola, me gustaría recibir asesoría para encontrar una propiedad.",
  )}`;

  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col w-full"
      style={{
        backgroundColor: "#1b1b1b",
        border: "1px solid rgba(236,179,55,0.18)",
        height: "100%",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ background: "linear-gradient(135deg, #262525, #1a1a1a)", borderBottom: "1px solid rgba(236,179,55,0.15)" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(236,179,55,0.14)", border: "1px solid rgba(236,179,55,0.3)" }}
        >
          <span style={{ fontSize: "1.2rem" }}>✦</span>
        </div>
        <div>
          <p className="font-semibold leading-tight" style={{ color: "#e2e2e2", fontFamily: SANS }}>
            Asistente InterRenta
          </p>
          <p className="text-xs flex items-center gap-1.5" style={{ color: "#8a8f9c", fontFamily: SANS }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#10b981" }} />
            En línea · responde al instante
          </p>
        </div>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} data-lenis-prevent className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {messages.map((m) => (
          <div key={m.id}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[82%] px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  fontFamily: SANS,
                  backgroundColor: m.role === "user" ? "#ecb337" : "#262525",
                  color: m.role === "user" ? "#161616" : "#e2e2e2",
                  borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                }}
              >
                {m.content}
              </div>
            </motion.div>

            {/* Tarjetas de propiedad */}
            {m.propiedades && m.propiedades.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
              >
                {m.propiedades.map((p) => (
                  <MiniProperty key={p.id || p.code} p={p} />
                ))}
              </motion.div>
            )}
          </div>
        ))}

        {/* Typing */}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: "#262525" }}>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#ecb337" }}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fallback WhatsApp */}
        {fallback && (
          <div className="flex justify-start">
            <a
              href={waGenericUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "#25D366", fontFamily: SANS }}
            >
              💬 Continuar por WhatsApp
            </a>
          </div>
        )}

        {/* Formulario de lead */}
        <AnimatePresence>
          {searched && leadState !== "done" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-4 mt-2"
              style={{ backgroundColor: "#262525", border: "1px solid rgba(236,179,55,0.2)" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "#e2e2e2", fontFamily: SANS }}>
                ¿Quieres que un asesor te contacte?
              </p>
              <p className="text-xs mb-3" style={{ color: "#9aa0ad", fontFamily: SANS }}>
                Déjanos tus datos y te escribimos con las mejores opciones.
              </p>
              <form onSubmit={submitLead} className="space-y-2">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={lead.nombre}
                  onChange={(e) => setLead((l) => ({ ...l, nombre: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ backgroundColor: "#1b1b1b", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e2e2", fontFamily: SANS, fontSize: "16px" }}
                />
                <input
                  type="tel"
                  placeholder="Tu teléfono / WhatsApp"
                  value={lead.telefono}
                  onChange={(e) => setLead((l) => ({ ...l, telefono: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ backgroundColor: "#1b1b1b", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e2e2", fontFamily: SANS, fontSize: "16px" }}
                />
                <button
                  type="submit"
                  disabled={leadState === "sending"}
                  data-cursor="hover"
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{ backgroundColor: "#ecb337", color: "#161616", fontFamily: SANS }}
                >
                  {leadState === "sending" ? "Enviando..." : "Quiero que me contacten"}
                </button>
              </form>
            </motion.div>
          )}

          {leadState === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 mt-2 text-center"
              style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: "#e2e2e2", fontFamily: SANS }}>
                ¡Listo, {lead.nombre.split(" ")[0]}! 🎉 Te contactaremos pronto.
              </p>
              <a
                href={waLeadUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#25D366", fontFamily: SANS }}
              >
                💬 O escríbenos ya por WhatsApp
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chips de sugerencia */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => send(s.text)}
              data-cursor="hover"
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: "rgba(236,179,55,0.1)",
                color: "#ecb337",
                border: "1px solid rgba(236,179,55,0.3)",
                fontFamily: SANS,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#161616" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe lo que buscas..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-full text-sm focus:outline-none disabled:opacity-60"
          style={{ backgroundColor: "#262525", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e2e2", fontFamily: SANS, fontSize: "16px" }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          data-cursor="hover"
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40"
          style={{ backgroundColor: "#ecb337", color: "#161616" }}
          aria-label="Enviar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}
