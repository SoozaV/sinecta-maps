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

/**
 * Calculates the perimeter of a polygon in meters
 */
export const calculatePolygonPerimeter = (polygon: GeoJSON.Feature<GeoJSON.Polygon>): number => {
  const coords = getPolygonCoords(polygon);
  const polygonFeature = turf.polygon(coords);
  
  // Calculate perimeter by summing distances between consecutive points
  let perimeter = 0;
  const outerRing = polygonFeature.geometry.coordinates[0];
  
  for (let i = 0; i < outerRing.length - 1; i++) {
    const point1 = turf.point(outerRing[i]);
    const point2 = turf.point(outerRing[i + 1]);
    const distance = turf.distance(point1, point2, { units: 'meters' });
    perimeter += distance;
  }
  
  return perimeter;
};

/**
 * Gets the total number of vertices in a polygon
 */
export const getVertexCount = (polygon: GeoJSON.Feature<GeoJSON.Polygon>): number => {
  const coords = getPolygonCoords(polygon);
  const outerRing = coords[0];
  
  // Subtract 1 because the last point is the same as the first (closed polygon)
  return Math.max(0, outerRing.length - 1);
};

/**
 * Formats a distance in meters to a human-readable string
 * Converts to kilometers if >= 1000m
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    const kilometers = meters / 1000;
    return `${kilometers.toLocaleString(undefined, { maximumFractionDigits: 2 })} km`;
  }
  return `${meters.toLocaleString(undefined, { maximumFractionDigits: 2 })} m`;
};