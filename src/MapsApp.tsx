import { MapProvider, PlacesProvider, PolygonsProvider } from "./context";
import { HomeScreen } from "./screens";

import "./styles.css";
//import "mapbox-gl/dist/mapbox-gl.css";
//import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

export default function MapsApp() {
  return (
    <PlacesProvider>
      <MapProvider>
        <PolygonsProvider>
          <HomeScreen />
        </PolygonsProvider>
      </MapProvider>
    </PlacesProvider>
  );
}
