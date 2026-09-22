/**
 * Nosotros.jsx — InterRenta
 * Perfil tipo Linktree del asesor. Entra por "la casa" (el techo, la chimenea
 * y la llama del logo): se toca la puerta, se abre y la cámara entra. Adentro,
 * un bento con WhatsApp, redes, propiedades disponibles en vivo y aliados.
 * /perfil redirige aquí; es la página del QR.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import Seo from "../components/common/Seo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "../components/ui/BrandIcons";
import { getLenis } from "../lib/lenis";
import {
  ALLIES,
  EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  whatsappUrl,
} from "../lib/contact";
import { getLatestAvailable } from "../services/property.service";
import retrato from "../assets/retrato-asesor.webp";
import logoLight from "../assets/logo-interrenta-light.png";
import "./nosotros.css";

const AGENT_NAME = "Iván Toro";
// La casa vuelve a salir si pasó media hora: en Android una pestaña conserva la
// sesión por días, y "una vez por sesión" la dejaba sin verse casi nunca.
const INTRO_SEEN_KEY = "ir_casa_vista_at";
const INTRO_REPEAT_MS = 30 * 60 * 1000;
const AUTO_OPEN_MS = 3500;
const INSTAGRAM_HANDLE = `@${INSTAGRAM_URL.split("/").filter(Boolean).pop()}`;

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

// Los sectores vienen como se escribieron en el admin ("MEDELLIN", "El Retiro Antioquia").
const tidy = (s) =>
  (s || "")
    .replace(/\bantioquia\b/gi, "")
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase());

function propertyLines(p) {
  const where = [tidy(p.subsector), tidy(p.sector)].filter(Boolean).join(" · ");
  const specs = [
    tidy(p.property_type),
    p.bedrooms ? `${p.bedrooms} hab` : null,
    p.area ? `${p.area} m²` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return { where, specs };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ─── Entrada: la casa ────────────────────────────────────────────────────────
function introDue() {
  const last = Number(localStorage.getItem(INTRO_SEEN_KEY) || 0);
  return Date.now() - last > INTRO_REPEAT_MS;
}

/**
 * calm = prefers-reduced-motion: la casa sale ya dibujada y al entrar solo se
 * desvanece, sin puerta girando ni zoom.
 */
function HouseIntro({ calm, onReveal, onDone }) {
  const [phase, setPhase] = useState("");
  const [door, setDoor] = useState(null);
  const houseRef = useRef(null);
  const busy = useRef(false);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const leave = useCallback(() => {
    onReveal();
    setPhase((p) => `${p} is-gone`);
    later(onDone, 650);
  }, [onReveal, onDone]);

  const enter = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    if (calm) {
      leave();
      return;
    }
    // La luz se expande desde la puerta real en pantalla, no desde el centro.
    const r = houseRef.current?.getBoundingClientRect();
    if (r) setDoor({ x: r.left + r.width * 0.5, y: r.top + r.height * 0.7955 });
    setPhase("is-opening");
    later(() => setPhase("is-opening is-zooming"), 650);
    // El contenido aparece mientras la luz termina de cubrir: sin corte seco.
    later(leave, 1500);
  }, [calm, leave]);

  const skip = () => {
    if (busy.current) return;
    busy.current = true;
    leave();
  };

  // Quien llega por el QR viene a algo concreto: si no toca, la puerta se abre sola.
  useEffect(() => {
    later(enter, AUTO_OPEN_MS);
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, [enter]);

  return (
    <section
      className={`ir-intro ${calm ? "is-calm" : ""} ${phase}`}
      aria-label="Entrada"
      style={door ? { "--door-x": `${door.x}px`, "--door-y": `${door.y}px` } : undefined}
    >
      <button ref={houseRef} type="button" className="ir-house" onClick={enter} aria-label="Abrir la puerta y entrar">
        <svg viewBox="0 0 360 330" aria-hidden="true">
          <defs>
            <linearGradient id="ir-flame-grad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#9c7419" />
              <stop offset=".55" stopColor="#ecb337" />
              <stop offset="1" stopColor="#f5d170" />
            </linearGradient>
          </defs>
          <rect className="ir-window" x="100" y="190" width="44" height="44" rx="3" />
          <rect className="ir-window ir-window-2" x="216" y="190" width="44" height="44" rx="3" />
          {/* Techo a dos aguas y chimenea: los del logo */}
          <path className="ir-draw" pathLength="1" d="M40 164 L180 50 L320 164" />
          <path className="ir-draw ir-d2" pathLength="1" d="M238 97 V68 H262 V116" />
          <path className="ir-draw" pathLength="1" d="M78 150 V310 M282 150 V310 M22 310 H338" />
          <path className="ir-draw ir-d3" pathLength="1" d="M100 190 h44 v44 h-44 Z M122 190 v44 M100 212 h44" />
          <path className="ir-draw ir-d3" pathLength="1" d="M216 190 h44 v44 h-44 Z M238 190 v44 M216 212 h44" />
          <path className="ir-draw ir-d2" pathLength="1" d="M155 310 V215 H205 V310 M168 310 L152 330 M192 310 L208 330" />
          <path
            className="ir-flame"
            fill="url(#ir-flame-grad)"
            d="M250 22 C259 36 266 44 262 55 C259 64 241 64 238 55 C234 44 242 38 250 22 Z"
          />
          <path
            className="ir-flame ir-flame-inner"
            fill="#fff4d6"
            d="M250 38 C255 46 257 50 255 56 C253 61 247 61 245 56 C243 50 246 46 250 38 Z"
          />
        </svg>
        <span className="ir-door-box">
          <span className="ir-door-light" />
          <span className="ir-door-leaf" />
        </span>
      </button>

      <div className="ir-intro-text">
        <div className="ir-intro-brand">InterRenta</div>
        <div className="ir-intro-cta">
          <span aria-hidden="true">↑</span>Toca la puerta para entrar
        </div>
      </div>
      <button type="button" className="ir-skip" onClick={skip}>
        Entrar directo
      </button>
      <div className="ir-glow" aria-hidden="true" />
    </section>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────
export default function Nosotros() {
  const [calm] = useState(prefersReducedMotion);
  const [introOn, setIntroOn] = useState(introDue);
  const [shown, setShown] = useState(!introOn);
  const [introKey, setIntroKey] = useState(0);
  const [listing, setListing] = useState({ items: [], count: 0 });

  useEffect(() => {
    getLatestAvailable(3).then(({ data, count, error }) => {
      if (!error) setListing({ items: data || [], count: count || 0 });
    });
  }, []);

  // El <body> del sitio es oscuro; aquí el rebote del scroll debe verse marfil.
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#faf8f4";
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);

  // Sin scroll mientras la casa está delante (Lenis en escritorio, nativo en móvil).
  useEffect(() => {
    if (!introOn) return;
    const lenis = getLenis();
    window.scrollTo(0, 0);
    lenis?.stop();
    document.body.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [introOn]);

  const reveal = useCallback(() => {
    localStorage.setItem(INTRO_SEEN_KEY, String(Date.now()));
    setShown(true);
  }, []);
  const finishIntro = useCallback(() => setIntroOn(false), []);

  const replay = () => {
    setShown(false);
    setIntroKey((k) => k + 1);
    setIntroOn(true);
  };

  const hasListing = listing.count > 0;
  const ally = ALLIES[0];

  return (
    <div className="ir-perfil">
      <Seo
        title={`${AGENT_NAME} · InterRenta — WhatsApp, redes y propiedades`}
        description={`Habla con ${AGENT_NAME} de InterRenta por WhatsApp, síguelo en Instagram y Facebook y mira las propiedades disponibles en arriendo y venta.`}
        path="/nosotros"
      />

      {introOn && <HouseIntro key={introKey} calm={calm} onReveal={reveal} onDone={finishIntro} />}

      <main className={`ir-inside ${shown ? "is-shown" : "is-waiting"}`}>
        <div className="ir-topbar ir-rise" style={{ animationDelay: "0.05s" }}>
          <Link to="/" aria-label="InterRenta — inicio">
            <img src={logoLight} alt="InterRenta" />
          </Link>
          <div className="ir-topbar-actions">
            <button type="button" className="ir-pill" onClick={replay}>
              ↺ Ver la entrada
            </button>
            <Link to="/" className="ir-pill">
              Sitio web
            </Link>
          </div>
        </div>

        <section className="ir-hero">
          <div className="ir-portrait ir-rise" style={{ animationDelay: "0.1s" }}>
            <img src={retrato} alt={`${AGENT_NAME}, asesor inmobiliario de InterRenta`} width={600} height={800} />
            <div className="ir-badge">
              <span className="ir-dot" />
              Disponible hoy
            </div>
          </div>
          <div className="ir-rise" style={{ animationDelay: "0.2s" }}>
            <div className="ir-eyebrow">InterRenta · Bienes raíces</div>
            <h1>{AGENT_NAME}</h1>
            <p>
              Te acompaño a encontrar, arrendar o vender tu inmueble —{" "}
              <em>de la búsqueda al cierre.</em>
            </p>
          </div>
        </section>

        <div className={`ir-bento ${hasListing ? "" : "no-props"}`}>
          <a className="ir-tile ir-wa ir-rise" style={{ animationDelay: "0.3s" }} href={whatsappUrl()} target="_blank" rel="noopener noreferrer" data-cursor="hover">
            <WhatsAppIcon className="w-[58px] h-[58px]" />
            <span className="ir-arrow"><ArrowUpRight size={16} /></span>
            <div>
              <h2>
                Escríbeme por
                <br />
                WhatsApp
              </h2>
              <div className="ir-wa-meta">
                <span>{PHONE_DISPLAY}</span>
                <span>· Respuesta en minutos</span>
              </div>
            </div>
          </a>

          {hasListing && (
            <Link className="ir-tile ir-stat ir-rise" style={{ animationDelay: "0.36s" }} to="/#propiedades" data-cursor="hover">
              <div className="ir-live">
                <span className="ir-dot" />
                En vivo
              </div>
              <div>
                <div className="ir-stat-num">{listing.count}</div>
                <div className="ir-title" style={{ fontWeight: 500 }}>
                  {listing.count === 1 ? "propiedad disponible" : "propiedades"}
                  <br />
                  {listing.count === 1 ? "hoy" : "disponibles hoy"}
                </div>
              </div>
            </Link>
          )}

          <a className="ir-tile ir-ig ir-rise" style={{ animationDelay: "0.42s" }} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" data-cursor="hover">
            <InstagramIcon className="ir-social-icon" />
            <span className="ir-arrow"><ArrowUpRight size={16} /></span>
            <div className="ir-label">Instagram</div>
            <div className="ir-title">{INSTAGRAM_HANDLE}</div>
          </a>

          <a className="ir-tile ir-fb ir-rise" style={{ animationDelay: "0.48s" }} href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" data-cursor="hover">
            <FacebookIcon className="ir-social-icon" />
            <span className="ir-arrow"><ArrowUpRight size={16} /></span>
            <div className="ir-label">Facebook</div>
            <div className="ir-title">InterRenta</div>
          </a>

          {hasListing && (
            <section className="ir-tile ir-props ir-rise" style={{ animationDelay: "0.54s" }}>
              <div className="ir-props-head">
                <h3>Disponibles ahora</h3>
                <Link to="/#propiedades" data-cursor="hover">
                  Ver las {listing.count} →
                </Link>
              </div>
              <div className="ir-props-grid">
                {listing.items.map((p) => {
                  const { where, specs } = propertyLines(p);
                  const rent = p.contract_type === "arriendo";
                  return (
                    <Link key={p.code} className="ir-prop" to={`/propiedades/${p.code}`} data-cursor="hover">
                      <div className="ir-prop-img">
                        {p.cover_url && <img src={p.cover_url} alt={p.title || p.code} loading="lazy" />}
                        <span className="ir-chip">
                          {p.code} · {rent ? "Arriendo" : "Venta"}
                        </span>
                      </div>
                      <div className="ir-price">
                        {cop.format(p.price)} {rent && <small>/ mes</small>}
                      </div>
                      {where && <div className="ir-where">{where}</div>}
                      {specs && <div className="ir-specs">{specs}</div>}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <a className="ir-tile ir-m2 ir-rise" style={{ animationDelay: "0.6s" }} href={ally.url} target="_blank" rel="noopener noreferrer" data-cursor="hover">
            <div className="ir-m2-mark">m²</div>
            <div>
              <div className="ir-label">Aliado</div>
              <div className="ir-m2-name">{ally.name}</div>
            </div>
            <span className="ir-arrow"><ArrowUpRight size={16} /></span>
          </a>

          <a className="ir-tile ir-mail ir-rise" style={{ animationDelay: "0.66s" }} href={`mailto:${EMAIL}`} data-cursor="hover">
            <div className="ir-label">Correo</div>
            <div className="ir-title">{EMAIL}</div>
          </a>
        </div>

        <footer className="ir-footer">© {new Date().getFullYear()} InterRenta</footer>
      </main>
    </div>
  );
}
