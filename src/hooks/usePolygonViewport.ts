import { useCallback, useContext } from 'react';
import { MapContext } from '../context';
import { polygon, bbox } from '@turf/turf';
import { LngLatBoundsLike } from 'mapbox-gl';
import { MAP_CONFIG } from '../constants/map.constants';

export function usePolygonViewport() {
  const { map } = useContext(MapContext);

  const centerPolygon = useCallback((feature?: GeoJSON.Feature) => {
    if (!map || !feature?.geometry) return;

    const coords = JSON.parse(JSON.stringify(feature.geometry));
    const polygonBbox = bbox(polygon(coords.coordinates)) as LngLatBoundsLike;
    
    map.fitBounds(polygonBbox, { padding: MAP_CONFIG.POLYGON_FIT_PADDING });
  }, [map]);

  return { centerPolygon };
}
