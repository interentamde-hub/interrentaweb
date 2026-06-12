/**
 * api/sitemap.js — Función serverless de Vercel (Node.js runtime)
 * ──────────────────────────────────────────────────────────────────────────────
 * Genera el sitemap.xml dinámicamente:
 *   • Páginas estáticas (home + municipios).
 *   • TODAS las propiedades reales desde Supabase, con su lastmod.
 *
 * El rewrite en vercel.json mapea /sitemap.xml → /api/sitemap, así Google
 * siempre recibe un sitemap actualizado sin redeployar.
 * Se cachea en el edge 1 hora (s-maxage) para no golpear Supabase por visita.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://www.interrenta.com";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/rionegro", priority: "0.9", changefreq: "weekly" },
  { path: "/envigado", priority: "0.9", changefreq: "weekly" },
  { path: "/el-retiro", priority: "0.9", changefreq: "weekly" },
  { path: "/san-vicente", priority: "0.9", changefreq: "weekly" },
];

const xmlEscape = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[c]);

const urlEntry = ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : ""}${priority ? `\n    <priority>${priority}</priority>` : ""}
  </url>`;

export default async function handler(req, res) {
  const today = new Date().toISOString().slice(0, 10);

  // ── Páginas estáticas ──────────────────────────────────────────────────────
  const entries = STATIC_PAGES.map((p) =>
    urlEntry({
      loc: `${SITE_URL}${p.path}`,
      lastmod: today,
      changefreq: p.changefreq,
      priority: p.priority,
    }),
  );

  // ── Propiedades desde Supabase ─────────────────────────────────────────────
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
    );
    const { data: properties, error } = await supabase
      .from("properties")
      .select("code, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    for (const p of properties || []) {
      if (!p.code) continue;
      entries.push(
        urlEntry({
          loc: `${SITE_URL}/propiedades/${encodeURIComponent(p.code)}`,
          lastmod: p.created_at ? p.created_at.slice(0, 10) : undefined,
          changefreq: "weekly",
          priority: "0.8",
        }),
      );
    }
  } catch (err) {
    // Si Supabase falla, igual servimos las páginas estáticas
    console.error("sitemap: error consultando propiedades:", err.message);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(xml);
}
