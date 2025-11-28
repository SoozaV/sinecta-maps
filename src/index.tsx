import mapboxgl from "mapbox-gl";
import ReactDOM from "react-dom/client";
import MapsApp from "./MapsApp";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN!;

// Desactivar eventos de analítica/telemetría de Mapbox
// Esto previene que se envíen eventos a events.mapbox.com
if (typeof window !== 'undefined') {
  // Interceptar peticiones a events.mapbox.com y cancelarlas
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0]?.toString() || '';
    if (url.includes('events.mapbox.com')) {
      return Promise.reject(new Error('Mapbox events blocked'));
    }
    return originalFetch.apply(this, args);
  };
}

if (!navigator.geolocation) {
  alert("Tu navegador no tiene opción de Geolocation");
  throw new Error("Tu navegador no tiene opción de Geolocation");
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(

    <MapsApp />
);
