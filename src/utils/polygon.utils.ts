import * as turf from '@turf/turf';

export const getPolygonCoords = (polygon: GeoJSON.Feature) => {
  const coords = JSON.parse(JSON.stringify(polygon.geometry));
  return coords.coordinates;
};

export const getPolygonCenter = (polygon: GeoJSON.Feature<GeoJSON.Polygon>) =>
  turf.centroid(polygon);

export const calculatePolygonArea = (polygon: GeoJSON.Feature<GeoJSON.Polygon>): number => {
  return turf.area(polygon);
};

export const formatArea = (area: number): string => {
  return `${area.toLocaleString(undefined, { maximumFractionDigits: 2 })}m²`;
};

export const getPolygonBbox = (polygon: GeoJSON.Feature<GeoJSON.Polygon>) => {
  const coords = getPolygonCoords(polygon);
  return turf.bbox(turf.polygon(coords));
};
