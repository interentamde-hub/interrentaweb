/**
 * Nosotros.jsx — InterRenta
 * Página tipo Linktree: canales de contacto, redes y aliados. Es la que se
 * comparte en las bios de redes (/perfil redirige aquí).
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Building2, Handshake } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Seo from "../components/common/Seo";
import avatar from "../assets/perfil-asesor.webp";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "../components/ui/BrandIcons";
import {
  ALLIES,
  EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  whatsappUrl,
} from "../lib/contact";

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Inter', sans-serif";

const LINKS = [
  {
    href: whatsappUrl(),
    icon: WhatsAppIcon,
    title: "WhatsApp",
    subtitle: `${PHONE_DISPLAY} · Respuesta rápida`,
    primary: true,
  },
  {
    href: INSTAGRAM_URL,
    icon: InstagramIcon,
    title: "Instagram",
    subtitle: "Propiedades nuevas y recorridos",
  },
  {
    href: FACEBOOK_URL,
    icon: FacebookIcon,
    title: "Facebook",
    subtitle: "Síguenos y comparte",
  },
  {
    to: "/#propiedades",
    icon: Building2,
    title: "Ver propiedades",
    subtitle: "Inmuebles disponibles en arriendo y venta",
  },
];

const rise = (i) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay: 0.1 + i * 0.07, ease: "easeOut" },
});

function LinkCard({ href, to, icon: Icon, title, subtitle, primary }) {
  const className = `group flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 ${
    primary
      ? "bg-[#ecb337] text-[#161616] shadow-[0_12px_40px_-12px_rgba(236,179,55,0.55)] hover:bg-[#f5d170]"
      : "border border-[#ecb337]/15 bg-[#1f1f1f] text-[#e2e2e2] hover:border-[#ecb337]/50 hover:bg-[#242424]"
  }`;

  const content = (
    <>
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          primary ? "bg-[#161616]/10" : "bg-[#ecb337]/10 text-[#ecb337]"
        }`}
      >
        <Icon className="w-[22px] h-[22px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold" style={{ fontFamily: SANS }}>
          {title}
        </span>
        <span
          className={`block truncate text-[13px] ${primary ? "text-[#161616]/70" : "text-[#9aa0ad]"}`}
          style={{ fontFamily: SANS }}
        >
          {subtitle}
        </span>
      </span>
      <ArrowUpRight
        size={20}
        className={`shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
          primary ? "" : "text-[#6b7280] group-hover:text-[#ecb337]"
        }`}
      />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className} data-cursor="hover">
        {content}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} data-cursor="hover">
      {content}
    </a>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ecb337]/30" />
      <span className="text-[11px] uppercase tracking-[0.3em] text-[#ecb337]" style={{ fontFamily: SANS }}>
        {children}
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ecb337]/30" />
    </div>
  );
}

export default function Nosotros() {
  return (
    <div className="relative min-h-screen overflow-x-clip" style={{ backgroundColor: "#161616" }}>
      <Seo
        title="Nosotros — InterRenta | Contacto, redes y aliados"
        description="Habla con InterRenta por WhatsApp, síguenos en Instagram y Facebook, y conoce a nuestros aliados. Arriendo y venta de inmuebles."
        path="/nosotros"
      />
      <Navbar />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(236,179,55,0.16), transparent 70%)",
        }}
      />

      <main className="relative mx-auto flex w-full max-w-[460px] flex-col px-5 pt-28 pb-20 lg:pt-24">
        <motion.header {...rise(0)} className="text-center">
          <div className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-[#f5d170] via-[#ecb337] to-[#9c7419] p-[3px] shadow-[0_18px_50px_-18px_rgba(236,179,55,0.6)]">
            <img
              src={avatar}
              alt="Asesor de InterRenta"
              width={128}
              height={128}
              className="h-full w-full rounded-full border-[3px] border-[#161616] object-cover"
            />
          </div>
          <h1
            className="mt-6 text-[2.1rem] leading-[1.1] text-[#e2e2e2]"
            style={{ fontFamily: SERIF, fontWeight: 400 }}
          >
            Te acompañamos de la búsqueda <span className="text-[#ecb337]">al cierre.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-[#9aa0ad]" style={{ fontFamily: SANS }}>
            Arriendo y venta de inmuebles con transparencia y acompañamiento real. Escríbenos por el
            canal que prefieras.
          </p>
        </motion.header>

        <nav className="mt-10 flex flex-col gap-3" aria-label="Canales de contacto">
          {LINKS.map((link, i) => (
            <motion.div key={link.title} {...rise(i + 1)}>
              <LinkCard {...link} />
            </motion.div>
          ))}
        </nav>

        <motion.section {...rise(LINKS.length + 1)} className="mt-12" aria-labelledby="aliados">
          <h2 id="aliados" className="sr-only">
            Aliados
          </h2>
          <SectionLabel>Aliados</SectionLabel>
          <div className="mt-5 flex flex-col gap-3">
            {ALLIES.map((ally) => (
              <a
                key={ally.name}
                href={ally.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className="group flex items-center gap-4 rounded-2xl border border-[#ecb337]/15 bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] px-5 py-5 transition-colors hover:border-[#ecb337]/50"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#ecb337]/25 text-[#ecb337]">
                  <Handshake size={22} strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1.35rem] leading-tight text-[#e2e2e2]" style={{ fontFamily: SERIF }}>
                    {ally.name}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-[#9aa0ad]" style={{ fontFamily: SANS }}>
                    {ally.description}
                  </span>
                </span>
                <span
                  className="shrink-0 text-[12px] font-medium text-[#ecb337] transition-transform group-hover:translate-x-0.5"
                  style={{ fontFamily: SANS }}
                >
                  Ver perfil
                </span>
              </a>
            ))}
          </div>
        </motion.section>

        <motion.footer {...rise(LINKS.length + 2)} className="mt-14 text-center" style={{ fontFamily: SANS }}>
          <a href={`mailto:${EMAIL}`} className="text-[13px] text-[#9aa0ad] transition-colors hover:text-[#ecb337]">
            {EMAIL}
          </a>
          <p className="mt-2 text-xs text-[#6b7280]">© {new Date().getFullYear()} InterRenta</p>
        </motion.footer>
      </main>
    </div>
  );
}
