/**
 * lib/seo.js — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Constantes y utilidades de SEO compartidas (el componente vive en
 * components/common/Seo.jsx; aquí va lo que no es React para no romper
 * el fast refresh).
 * ──────────────────────────────────────────────────────────────────────────────
 */

export const SITE_URL = "https://www.interrenta.com";
export const SITE_NAME = "InterRenta";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/** Recorta un texto a `max` caracteres sin partir palabras (para descriptions). */
export function truncate(text, max = 155) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/** BreadcrumbList de schema.org a partir de [{ name, path }]. */
export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
