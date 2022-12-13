import { createContext } from "react";

export interface PolygonsContextProps {
  polygons?: GeoJSON.FeatureCollection;
  updatePolygonsArray: (polygon: GeoJSON.Feature<GeoJSON.Polygon>) => void;
  loadFirstPolygons: (polygons: GeoJSON.FeatureCollection) => void;
  deletePolygonFromArray: (polygon: GeoJSON.Feature, index: number) => void;
  updatePolygonProperties: (
    polygon: GeoJSON.Feature<GeoJSON.Polygon>
  ) => GeoJSON.Feature<GeoJSON.Polygon>;
}

export const PolygonsContext = createContext<PolygonsContextProps>(
  {} as PolygonsContextProps
);
