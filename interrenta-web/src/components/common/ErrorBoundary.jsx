import { Component } from "react";

/**
 * Sin boundary, cualquier error de render (o un chunk que no carga) desmonta
 * toda la app y deja la pantalla en blanco. Con `fallback={null}` sirve para
 * aislar piezas opcionales, como el asistente: si falla, simplemente no sale.
 */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Error de render atrapado:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center"
        style={{ backgroundColor: "#161616", fontFamily: "'Inter', sans-serif" }}
      >
        <p style={{ color: "#e2e2e2", fontSize: "1.1rem" }}>No pudimos cargar esta página.</p>
        <p style={{ color: "#9aa0ad", fontSize: "0.9rem", maxWidth: 320 }}>
          Suele ser la conexión. Intenta de nuevo en un momento.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full px-6 py-3 font-semibold"
          style={{ backgroundColor: "#ecb337", color: "#161616" }}
        >
          Recargar
        </button>
      </div>
    );
  }
}
