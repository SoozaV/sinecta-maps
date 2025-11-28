import { useLayoutEffect, useEffect, useContext } from 'react';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MapContext } from '../context';
import { usePolygonsStore } from '../stores/usePolygonsStore';

export function usePolygonMapEvents(onMapClick: () => void, onDrawCreate: (e: MapboxDraw.DrawCreateEvent) => Promise<void>) {
  const { map, isMapReady, draw } = useContext(MapContext);
  const { loadFirstPolygons } = usePolygonsStore();

  useLayoutEffect(() => {
    if (!isMapReady || !map || !draw) return;

    const handleMapLoad = async () => {
      try {
        await loadFirstPolygons();
        const loadedPolygons = usePolygonsStore.getState().polygons;
        if (loadedPolygons.features.length > 0) {
          draw.set(loadedPolygons);
        }
      } catch (error) {
        console.error("Error loading polygons:", error);
      }
    };

    map.on("load", handleMapLoad);
    
    return () => {
      map.off("load", handleMapLoad);
    };
  }, [isMapReady, map, draw, loadFirstPolygons]);

  useEffect(() => {
    if (!map) return;
    
    map.on("click", onMapClick);
    map.on("draw.create", onDrawCreate);
    
    return () => {
      map.off("click", onMapClick);
      map.off("draw.create", onDrawCreate);
    };
  }, [map, onMapClick, onDrawCreate]);
}
