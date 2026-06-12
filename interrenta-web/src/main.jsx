import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'

// Los meta tags estáticos de index.html son solo fallback para crawlers sin JS
// (WhatsApp, Facebook). Con JS activo los elimina para que react-helmet-async
// inyecte los de cada página sin duplicados.
document.querySelectorAll('head [data-static-seo]').forEach((el) => el.remove())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)