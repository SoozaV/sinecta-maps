import * as turf from '@turf/turf';
import length from '@turf/length';
import { lineString } from '@turf/helpers';

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
 * Uses turf.length() to calculate the length of the polygon's outer ring as a LineString
 */
export const calculatePolygonPerimeter = (polygon: GeoJSON.Feature<GeoJSON.Polygon>): number => {
  const coords = getPolygonCoords(polygon);
  const outerRing = coords[0];
  
  // Convert the outer ring to a LineString
  const line = lineString(outerRing);
  
  // Calculate the length (perimeter) in meters
  return length(line, { units: 'meters' });
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