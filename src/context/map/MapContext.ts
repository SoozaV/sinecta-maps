import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Map } from "mapbox-gl";
import { createContext } from "react";

interface MapContextProps {
  isMapReady: boolean;
  map?: Map;
  draw?: MapboxDraw;
  setMap: (map: Map) => void;
}

export const MapContext = createContext({} as MapContextProps);
