import type { Map } from "mapbox-gl";
import { createContext } from "react";
import type MapboxDrawModule from "@mapbox/mapbox-gl-draw";

type MapboxDrawInstance = InstanceType<typeof MapboxDrawModule>;

interface MapContextProps {
  isMapReady: boolean;
  map?: Map;
  draw?: MapboxDrawInstance;
  setMap: (map: Map) => void;
}

export const MapContext = createContext({} as MapContextProps);
