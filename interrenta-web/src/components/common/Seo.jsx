/**
 * Seo.jsx — InterRenta
 * ──────────────────────────────────────────────────────────────────────────────
 * Componente central de SEO. Inyecta en <head> (vía react-helmet-async):
 *   • <title> + meta description
 *   • Canonical
 *   • Open Graph completo (og:image, og:url, og:locale, og:site_name)
 *   • Twitter Cards
 *   • Datos estructurados JSON-LD (schema.org) — uno o varios bloques
 *
 * Uso:
 *   <Seo
 *     title="Propiedades en Rionegro – InterRenta"
 *     description="..."
 *     path="/rionegro"
 *     image="https://..."          // opcional, cae al og-image por defecto
 *     jsonLd={[{...}, {...}]}      // opcional, objetos schema.org
 *   />
 *
 * Las constantes y helpers (SITE_URL, truncate, breadcrumbJsonLd) viven en
 * src/lib/seo.js.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { Helmet } from "react-helmet-async";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "../../lib/seo";

export default function Seo({
  title,
  description,
  path = "/",
  image,
  type = "website",
  jsonLd = [],
}) {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_OG_IMAGE;
  const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="es_CO" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Datos estructurados (schema.org) */}
      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
