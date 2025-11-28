import { lazy, Suspense } from "react";
import { MapProvider, PlacesProvider } from "./context";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Loading } from "./components/Loading";

import "./styles.css";
//import "mapbox-gl/dist/mapbox-gl.css";
//import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

const HomeScreen = lazy(() => import("./screens/HomeScreen").then(m => ({ default: m.HomeScreen })));

export default function MapsApp() {
  return (
    <ErrorBoundary>
      <PlacesProvider>
        <MapProvider>
          <Suspense fallback={<Loading />}>
            <HomeScreen />
          </Suspense>
        </MapProvider>
      </PlacesProvider>
    </ErrorBoundary>
  );
}
