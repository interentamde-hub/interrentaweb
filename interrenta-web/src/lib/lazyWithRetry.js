import { lazy } from "react";

const RELOAD_KEY = "ir_chunk_reload_at";
const RELOAD_COOLDOWN_MS = 10_000;

/**
 * lazy() que reintenta la descarga del chunk. En datos móviles un import()
 * puede fallar por un corte momentáneo, y después de un deploy los chunks
 * viejos dan 404. Sin esto React desmonta la app entera: pantalla en blanco.
 *
 * Reintenta dos veces; si sigue fallando recarga la página (trae el index.html
 * nuevo con los nombres de chunk vigentes). Como máximo una recarga cada 10 s,
 * para no entrar en bucle si el fallo es persistente; entonces el error sube al
 * ErrorBoundary, que ofrece recargar a mano.
 */
export function lazyWithRetry(factory, retries = 2) {
  return lazy(async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await factory();
      } catch (error) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          continue;
        }
        const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
        if (Date.now() - last > RELOAD_COOLDOWN_MS) {
          sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
          window.location.reload();
          return new Promise(() => {});
        }
        throw error;
      }
    }
  });
}
