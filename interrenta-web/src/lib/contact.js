/**
 * lib/contact.js — InterRenta
 * Canales de contacto, redes y aliados. Única fuente para la página /nosotros
 * y el menú; cambia un enlace aquí y se actualiza en todos lados.
 */

export const WHATSAPP_NUMBER = "573195227378";
export const PHONE_DISPLAY = "+57 319 522 7378";
export const EMAIL = "comercial@interrenta.com";

export const whatsappUrl = (
  message = "Hola, me gustaría obtener más información sobre propiedades en InterRenta.",
) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const INSTAGRAM_URL = "https://www.instagram.com/ivan_toro_interrenta/";
export const FACEBOOK_URL = "https://www.facebook.com/share/1F55adTVFh/";

export const ALLIES = [
  {
    name: "Metro Cuadrado",
    description: "Encuentra nuestros inmuebles publicados en el portal inmobiliario.",
    url: "https://www.metrocuadrado.com/inmobiliaria/inter-renta-propiedad-raiz/13187",
  },
];
