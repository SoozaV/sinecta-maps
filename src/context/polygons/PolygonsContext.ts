import { createContext } from "react";

export interface PolygonsContextProps {
  polygons?: GeoJSON.FeatureCollection;
  updatePolygonsArray: (polygon: GeoJSON.Feature) => void;
  loadFirstPolygons: (polygons: GeoJSON.Feature[]) => void;
}

export const PolygonsContext = createContext<PolygonsContextProps>(
  {} as PolygonsContextProps
);
