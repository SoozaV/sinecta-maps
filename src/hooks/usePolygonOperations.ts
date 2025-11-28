import { useCallback, useContext } from 'react';
import { MapContext } from '../context';
import { usePolygonsStore } from '../stores/usePolygonsStore';
import polygonsApi from '../apis/polygonsApi';

export function usePolygonOperations() {
  const { updatePolygonProperties, updatePolygonsArray, deletePolygonFromArray } = usePolygonsStore();
  const { draw } = useContext(MapContext);

  const createPolygon = useCallback(async (newPolygon: GeoJSON.Feature<GeoJSON.Polygon>) => {
    const polygonWithProps = updatePolygonProperties(newPolygon);
    
    let createdPolygon = polygonWithProps;
    
    // Intentar guardar en el backend, pero continuar aunque falle
    try {
      const { data } = await polygonsApi.post("/api/polygons", polygonWithProps);
      createdPolygon = data.data as GeoJSON.Feature<GeoJSON.Polygon>;
    } catch (error) {
      console.warn("Backend no disponible, guardando polígono localmente:", error);
      // Generar un ID temporal si no tiene uno
      if (!createdPolygon.id) {
        createdPolygon.id = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      // Continuar con el polígono local aunque falle el backend
    }
    
    // Siempre agregar al store local (con o sin backend)
    await updatePolygonsArray(createdPolygon);
    
    // Obtener el polígono procesado del store (con área y dirección agregadas)
    const polygons = usePolygonsStore.getState().polygons;
    const processedPolygon = polygons.features[polygons.features.length - 1];
    
    return processedPolygon || createdPolygon;
  }, [updatePolygonProperties, updatePolygonsArray]);

  const deletePolygon = useCallback(async (polygon: GeoJSON.Feature, index: number) => {
    const polygonId = polygon.id as string;
    
    try {
      await polygonsApi.delete(`/api/polygons/${polygonId}`);
      deletePolygonFromArray(polygon, index);
      draw?.delete(polygonId);
    } catch (error) {
      console.error("Error deleting polygon:", error);
      throw error;
    }
  }, [deletePolygonFromArray, draw]);

  return { createPolygon, deletePolygon };
}
