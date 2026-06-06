/**
 * assistantBus.js — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Canal global para abrir el asistente (burbuja flotante) desde cualquier parte:
 *   • openAssistant()        → solo abre el panel
 *   • openAssistant("texto") → abre el panel e inyecta esa consulta al chat
 * El AssistantWidget escucha este evento.
 * ──────────────────────────────────────────────────────────────────────────────
 */

export const ASSISTANT_EVENT = "ir-assistant-open";

export function openAssistant(text) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ASSISTANT_EVENT, { detail: { text: text || null } }),
  );
}
