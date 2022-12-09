import { createContext } from "react";

export interface PolygonsContextProps {
  polygons?: GeoJSON.FeatureCollection;
  updatePolygonsArray: (polygon: GeoJSON.Feature) => void;
  loadFirstPolygons: (polygons: GeoJSON.Feature[]) => void;
  deletePolygonFromArray: (polygon: GeoJSON.Feature, index: number) => void;
}

export const PolygonsContext = createContext<PolygonsContextProps>(
  {} as PolygonsContextProps
);
