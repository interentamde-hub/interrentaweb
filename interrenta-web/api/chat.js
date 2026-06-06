/**
 * api/chat.js — Función serverless de Vercel (Node.js runtime)
 * ──────────────────────────────────────────────────────────────────────────────
 * Asistente conversacional de InterRenta. Flujo:
 *   1. Recibe el historial de la conversación + filtros reunidos.
 *   2. OpenAI (gpt-4o-mini, structured outputs) extrae/combina filtros,
 *      redacta una respuesta cálida y decide si ya puede buscar.
 *   3. Si está listo, se consultan las propiedades REALES en Supabase
 *      (la IA nunca inventa propiedades ni precios).
 *   4. Devuelve { reply, filtros, listo_para_buscar, propiedades }.
 *
 * Seguridad:
 *   - La OPENAI_API_KEY vive SOLO aquí (variable de entorno en Vercel).
 *   - Supabase se consulta con la anon key (mismas vars del build).
 *   - Validación de entrada + límites de longitud para controlar costo/abuso.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";

const MODEL = "gpt-4o-mini";
const MAX_MESSAGES = 16; // recorta historial para controlar tokens
const MAX_CHARS = 600; // máximo por mensaje del usuario
const MUNICIPIOS = ["Rionegro", "Envigado", "El Retiro", "San Vicente"];

const SYSTEM_PROMPT = `Eres el asistente virtual de InterRenta, una inmobiliaria del Oriente Antioqueño (Colombia).
Tu objetivo es ayudar a clientes a encontrar propiedades en ARRIENDO o VENTA según su presupuesto y preferencias.
Tono: cálido, breve, profesional y cercano. Respondes en español. Máximo 2 frases por respuesta.
Solo hablas de bienes raíces e InterRenta; si preguntan otra cosa, redirige amablemente al tema.
Municipios que cubrimos: ${MUNICIPIOS.join(", ")}.
NUNCA inventes propiedades, precios ni disponibilidad: las propiedades reales se buscan en la base de datos.
Reúne progresivamente: operación (arriendo/venta), presupuesto (en pesos colombianos, número entero), zona/municipio, número de alcobas y tipo de inmueble.
El presupuesto puede venir como "2 millones", "2M" o "$1.500.000" → conviértelo a entero (ej: 2000000).
Cuando tengas al menos la OPERACIÓN y (PRESUPUESTO o ZONA), marca listo_para_buscar = true.
Si listo_para_buscar es true, tu "reply" debe ser una frase breve de transición (ej: "¡Perfecto! Mira estas opciones que encajan contigo:") SIN mencionar precios ni cantidades concretas, porque las tarjetas reales se muestran aparte.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" },
    listo_para_buscar: { type: "boolean" },
    filtros: {
      type: "object",
      additionalProperties: false,
      properties: {
        operacion: { type: ["string", "null"] },
        presupuesto: { type: ["integer", "null"] },
        zona: { type: ["string", "null"] },
        alcobas: { type: ["integer", "null"] },
        tipo: { type: ["string", "null"] },
      },
      required: ["operacion", "presupuesto", "zona", "alcobas", "tipo"],
    },
  },
  required: ["reply", "listo_para_buscar", "filtros"],
};

// ─── Selección de propiedades (relajación progresiva de filtros) ─────────────
function pickProperties(all, f) {
  const norm = (s) => (s || "").toString().toLowerCase();
  const matchZona = (p) =>
    !f.zona ||
    [p.sector, p.subsector, p.address].some((x) => norm(x).includes(norm(f.zona)));
  const matchTipo = (p) => !f.tipo || norm(p.property_type).includes(norm(f.tipo));
  const matchAlc = (p) => !f.alcobas || (p.bedrooms || 0) >= f.alcobas;
  const matchBudget = (p) => !f.presupuesto || (p.price || 0) <= f.presupuesto * 1.15;

  const tiers = [
    (p) => matchZona(p) && matchTipo(p) && matchAlc(p) && matchBudget(p),
    (p) => matchZona(p) && matchAlc(p) && matchBudget(p),
    (p) => matchZona(p) && matchBudget(p),
    (p) => matchBudget(p),
    (p) => matchZona(p),
    () => true,
  ];

  let chosen = [];
  for (const t of tiers) {
    chosen = all.filter(t);
    if (chosen.length) break;
  }

  chosen = [...chosen].sort((a, b) => {
    if (f.presupuesto) {
      return Math.abs((a.price || 0) - f.presupuesto) - Math.abs((b.price || 0) - f.presupuesto);
    }
    return (a.price || 0) - (b.price || 0);
  });

  return chosen.slice(0, 3);
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "OPENAI_API_KEY no configurada", fallback: true });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const prevFiltros = body.filtros || {};

    // Saneamiento del historial
    const history = rawMessages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

    if (history.length === 0) {
      return res.status(400).json({ error: "Sin mensajes" });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: `Filtros reunidos hasta ahora (combínalos con lo nuevo, no los pierdas): ${JSON.stringify(prevFiltros)}`,
      },
      ...history,
    ];

    // ── Llamada a OpenAI ──────────────────────────────────────────────────
    const oaRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 320,
        messages,
        response_format: {
          type: "json_schema",
          json_schema: { name: "recomendacion", strict: true, schema: SCHEMA },
        },
      }),
    });

    if (!oaRes.ok) {
      const detail = await oaRes.text();
      console.error("OpenAI error:", oaRes.status, detail);
      return res.status(502).json({ error: "Error del modelo", fallback: true });
    }

    const data = await oaRes.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    const filtros = { ...prevFiltros, ...(parsed.filtros || {}) };

    // Normaliza operación
    if (filtros.operacion) {
      const op = filtros.operacion.toLowerCase();
      filtros.operacion = op.includes("vent") ? "venta" : op.includes("arr") ? "arriendo" : null;
    }

    let propiedades = [];
    if (parsed.listo_para_buscar) {
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY,
      );
      let query = supabase.from("properties").select("*").eq("status", "disponible");
      if (filtros.operacion) query = query.eq("contract_type", filtros.operacion);

      const { data: props, error } = await query;
      if (error) {
        console.error("Supabase error:", error.message);
      } else {
        propiedades = pickProperties(props || [], filtros);
      }
    }

    return res.status(200).json({
      reply: parsed.reply || "¿En qué puedo ayudarte?",
      listo_para_buscar: Boolean(parsed.listo_para_buscar),
      filtros,
      propiedades,
    });
  } catch (err) {
    console.error("chat handler error:", err);
    return res.status(500).json({ error: "Error interno", fallback: true });
  }
}
