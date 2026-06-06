/**
 * assistant.service.js — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Cliente del asistente:
 *   • sendChat(): habla con la función serverless /api/chat.
 *   • saveLead(): guarda el lead en Supabase (tabla `leads`, insert anon).
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from "./supabase";

export async function sendChat(messages, filtros) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, filtros }),
  });

  if (!res.ok) {
    let fallback = false;
    try {
      const data = await res.json();
      fallback = Boolean(data.fallback);
    } catch {
      /* respuesta no-JSON */
    }
    const err = new Error(`chat ${res.status}`);
    err.fallback = fallback;
    throw err;
  }

  return res.json();
}

export async function saveLead(lead) {
  // Inserta el lead; requiere la política RLS de insert para `anon` (ver SQL).
  return supabase.from("leads").insert([{ ...lead, source: "chatbot" }]);
}
