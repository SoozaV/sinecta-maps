import { useState, useCallback, useContext } from 'react';
import { MapContext } from '../context';
import { usePolygonsStore } from '../stores/usePolygonsStore';

interface ActivePolygon {
  feature: GeoJSON.Feature;
  polygonId: string;
  index: number;
}

export function usePolygonSelection() {
  const [activePolygon, setActivePolygon] = useState<ActivePolygon | null>(null);
  const { draw } = useContext(MapContext);

  const selectPolygon = useCallback((polygon: GeoJSON.Feature, index: number) => {
    setActivePolygon({
      feature: polygon,
      polygonId: polygon.id as string,
      index,
    });
  }, []);

  const selectPolygonFromMap = useCallback(() => {
    if (!draw) return;
    
    const selectedPolygonId = draw.getSelectedIds()[0];
    if (!selectedPolygonId) return;
    
    const selectedPolygon = draw.get(selectedPolygonId as string);
    const polygons = usePolygonsStore.getState().polygons;
    const index = polygons.features.findIndex((f) => f.id === selectedPolygonId);
    
    if (index !== -1 && selectedPolygon) {
      selectPolygon(selectedPolygon, index);
    }
  }, [draw, selectPolygon]);

  return { activePolygon, selectPolygon, selectPolygonFromMap };
}
