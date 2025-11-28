import { MapProvider, PlacesProvider } from "./context";
import { HomeScreen } from "./screens";
import { ErrorBoundary } from "./components/ErrorBoundary";

import "./styles.css";
//import "mapbox-gl/dist/mapbox-gl.css";
//import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

export default function MapsApp() {
  return (
    <ErrorBoundary>
      <PlacesProvider>
        <MapProvider>
          <HomeScreen />
        </MapProvider>
      </PlacesProvider>
    </ErrorBoundary>
  );
}
