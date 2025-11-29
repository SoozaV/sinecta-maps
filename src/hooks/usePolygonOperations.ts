import { useCallback, useContext } from 'react';
import { MapContext } from '../context';
import { usePolygonsStore } from '../stores/usePolygonsStore';
import polygonsApi from '../apis/polygonsApi';

export function usePolygonOperations() {
  const { updatePolygonProperties, updatePolygonsArray, deletePolygonFromArray, replacePolygons } = usePolygonsStore();
  const { draw } = useContext(MapContext);

  const createPolygon = useCallback(async (newPolygon: GeoJSON.Feature<GeoJSON.Polygon>) => {
    const polygonWithProps = updatePolygonProperties(newPolygon);
    
    // Generar ID temporal si no tiene uno (para mostrar inmediatamente)
    if (!polygonWithProps.id) {
      polygonWithProps.id = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }
    
    // OPTIMISTIC UPDATE: Agregar al store inmediatamente para mostrar en la UI
    // La geocodificación se hace en background dentro de updatePolygonsArray
    // No esperamos a que termine para mostrar el polígono inmediatamente
    updatePolygonsArray(polygonWithProps);
    
    // Obtener el polígono del store (puede no tener dirección aún si la geocodificación está en proceso)
    // Usamos el polígono con props como fallback si aún no está en el store
    const polygons = usePolygonsStore.getState().polygons;
    let processedPolygon = polygons.features.find(p => p.id === polygonWithProps.id);
    
    // Si no está en el store aún (puede pasar si updatePolygonsArray aún no terminó),
    // usar el polígono con props calculadas (área ya está calculada en updatePolygonProperties)
    if (!processedPolygon) {
      processedPolygon = polygonWithProps;
    }
    
    // Intentar guardar en el backend en background (no bloquea la UI)
    polygonsApi.post("/api/polygons", polygonWithProps)
      .then(({ data }) => {
        // Si el backend responde, actualizar el polígono con el ID real del backend
        const backendPolygon = data.data as GeoJSON.Feature<GeoJSON.Polygon>;
        const currentPolygons = usePolygonsStore.getState().polygons;
        const index = currentPolygons.features.findIndex(p => 
          p.id === processedPolygon.id || p.id === polygonWithProps.id
        );
        
        if (index !== -1) {
          // Actualizar el polígono en el store con los datos del backend
          const existingPolygon = currentPolygons.features[index];
          const updatedPolygon = {
            ...existingPolygon,
            id: backendPolygon.id,
            properties: {
              ...existingPolygon.properties,
              ...backendPolygon.properties,
            },
          };
          
          // Reemplazar el polígono temporal con el del backend
          const updatedFeatures = [...currentPolygons.features];
          updatedFeatures[index] = updatedPolygon;
          
          replacePolygons({
            ...currentPolygons,
            features: updatedFeatures,
          });
        }
      })
      .catch((error) => {
        console.warn("Backend no disponible, manteniendo polígono local:", error);
        // El polígono ya está en el store con ID temporal, no hacer nada
      });
    
    return processedPolygon;
  }, [updatePolygonProperties, updatePolygonsArray, replacePolygons]);

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
