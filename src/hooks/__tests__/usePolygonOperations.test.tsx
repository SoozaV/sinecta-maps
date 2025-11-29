import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolygonOperations } from '../usePolygonOperations';
import { MapContext } from '../../context';
import { createTestPolygon } from '../../setupTests';
import polygonsApi from '../../apis/polygonsApi';

// Mock polygonsApi
vi.mock('../../apis/polygonsApi', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock usePolygonsStore con simulación real de estado mutable
const { 
  mockUpdatePolygonProperties, 
  mockUpdatePolygonsArray, 
  mockDeletePolygonFromArray, 
  getMockStoreState,
  resetMockStoreState 
} = vi.hoisted(() => {
  // Estado mutable que simula el store real de Zustand
  let storeState = {
    polygons: {
      type: 'FeatureCollection' as const,
      features: [] as GeoJSON.Feature<GeoJSON.Polygon>[],
    },
  };

  // Mock de updatePolygonProperties que replica la lógica real del store
  // Lógica real: name || properties.name || 'Title Placeholder'
  const mockUpdatePolygonProperties = vi.fn((polygon: GeoJSON.Feature<GeoJSON.Polygon>, name?: string) => {
    const properties = polygon.properties || {};
    const updatedPolygon = {
      ...polygon,
      properties: {
        ...properties,
        name: name || properties.name || 'Title Placeholder',
        // Simular que se agrega área (como en setPolygonArea del store real)
        area: properties.area || 1000, // Valor mock para área
      },
    };
    return updatedPolygon;
  });

  // Mock de updatePolygonsArray que REALMENTE modifica el estado
  // Esto simula el comportamiento real: agregar polígono al array del store
  const mockUpdatePolygonsArray = vi.fn(async (polygon: GeoJSON.Feature<GeoJSON.Polygon>) => {
    // Simular el comportamiento real del store: agregar área y dirección
    const polygonWithArea = {
      ...polygon,
      properties: {
        ...polygon.properties,
        area: polygon.properties?.area || 1000,
        place_name: polygon.properties?.place_name || 'Mock Address',
      },
    };
    
    // REALMENTE agregar al array (como hace el store real con set())
    storeState.polygons.features.push(polygonWithArea);
  });

  const mockDeletePolygonFromArray = vi.fn((_polygon: GeoJSON.Feature, index: number) => {
    // REALMENTE eliminar del array (como hace el store real)
    storeState.polygons.features = storeState.polygons.features.filter((_, i) => i !== index);
  });

  // Función para obtener el estado actual (para getState())
  const getMockStoreState = () => ({
    ...storeState,
    updatePolygonProperties: mockUpdatePolygonProperties,
    updatePolygonsArray: mockUpdatePolygonsArray,
    deletePolygonFromArray: mockDeletePolygonFromArray,
  });

  // Función para resetear el estado entre tests
  const resetMockStoreState = () => {
    storeState = {
      polygons: {
        type: 'FeatureCollection' as const,
        features: [],
      },
    };
  };

  return { 
    mockUpdatePolygonProperties, 
    mockUpdatePolygonsArray, 
    mockDeletePolygonFromArray, 
    getMockStoreState,
    resetMockStoreState,
  };
});

vi.mock('../../stores/usePolygonsStore', () => {
  // Función que simula el hook de Zustand
  const mockUsePolygonsStoreFn = (selector?: (state: ReturnType<typeof getMockStoreState>) => any) => {
    const state = getMockStoreState();
    return selector ? selector(state) : state;
  };
  
  // Zustand stores tienen getState como propiedad del hook
  Object.assign(mockUsePolygonsStoreFn, {
    getState: () => getMockStoreState(),
  });
  
  return {
    usePolygonsStore: mockUsePolygonsStoreFn,
  };
});

describe('usePolygonOperations', () => {
  const mockDraw = {
    delete: vi.fn(),
  };

  const mockContextValue = {
    isMapReady: true,
    map: {} as any,
    draw: mockDraw as any,
    setMap: vi.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MapContext.Provider value={mockContextValue}>
      {children}
    </MapContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    // Resetear el estado del store mock entre tests
    resetMockStoreState();
  });

  describe('createPolygon', () => {
    it('should create a polygon with properties', async () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      (polygonsApi.post as any).mockResolvedValue({
        data: { data: polygon },
      });

      const { result } = renderHook(() => usePolygonOperations(), { wrapper });

      let returnedPolygon: any;
      await act(async () => {
        returnedPolygon = await result.current.createPolygon(polygon);
      });

      // Verificar que se llamaron las funciones correctas
      expect(mockUpdatePolygonProperties).toHaveBeenCalledWith(polygon);
      expect(polygonsApi.post).toHaveBeenCalledWith('/api/polygons', expect.any(Object));
      expect(mockUpdatePolygonsArray).toHaveBeenCalled();
      
      // CRÍTICO: Verificar que se retorna el polígono procesado del store (no el original)
      // El código real hace: polygons.features[polygons.features.length - 1]
      const storeState = getMockStoreState();
      expect(storeState.polygons.features).toHaveLength(1);
      expect(returnedPolygon).toEqual(storeState.polygons.features[0]);
      
      // Verificar que el polígono retornado tiene área y dirección agregadas
      expect(returnedPolygon.properties?.area).toBeDefined();
      expect(returnedPolygon.properties?.place_name).toBeDefined();
    });

    it('should handle backend error gracefully and continue locally', async () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      (polygonsApi.post as any).mockRejectedValue(new Error('Backend unavailable'));

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => usePolygonOperations(), { wrapper });

      let createdPolygon: any;
      await act(async () => {
        createdPolygon = await result.current.createPolygon(polygon);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Backend no disponible, guardando polígono localmente:',
        expect.any(Error)
      );
      expect(mockUpdatePolygonsArray).toHaveBeenCalled();
      
      // Verificar que el polígono se agregó al store incluso sin backend
      const storeState = getMockStoreState();
      expect(storeState.polygons.features).toHaveLength(1);
      
      // CRÍTICO: Verificar que se retorna el polígono procesado del store
      expect(createdPolygon).toEqual(storeState.polygons.features[0]);
      expect(createdPolygon).toBeDefined();
      expect(createdPolygon.properties?.area).toBeDefined();
      expect(createdPolygon.properties?.place_name).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should generate temporary ID when backend fails and polygon has no ID', async () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      delete polygon.id;
      (polygonsApi.post as any).mockRejectedValue(new Error('Backend unavailable'));

      const { result } = renderHook(() => usePolygonOperations(), { wrapper });

      await act(async () => {
        await result.current.createPolygon(polygon);
      });

      // Verificar que se generó un ID temporal con el formato correcto
      expect(mockUpdatePolygonsArray).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^temp-\d+-[a-z0-9]{6,}$/i),
          geometry: expect.any(Object),
        })
      );
      
      // Verificar que el polígono con ID temporal se agregó al store
      const storeState = getMockStoreState();
      expect(storeState.polygons.features).toHaveLength(1);
      expect(storeState.polygons.features[0].id).toMatch(/^temp-\d+-[a-z0-9]{6,}$/i);
    });

    it('should return processed polygon from store with area and address', async () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      // Eliminar place_name del polígono original para que el mock lo agregue
      if (polygon.properties) {
        delete polygon.properties.place_name;
      }
      (polygonsApi.post as any).mockResolvedValue({
        data: { data: polygon },
      });

      const { result } = renderHook(() => usePolygonOperations(), { wrapper });

      let returnedPolygon: any;
      await act(async () => {
        returnedPolygon = await result.current.createPolygon(polygon);
      });

      // CRÍTICO: Verificar que el polígono retornado es el del store (procesado)
      // NO el polígono original que se pasó
      const storeState = getMockStoreState();
      const processedPolygon = storeState.polygons.features[0];
      
      expect(returnedPolygon).toBe(processedPolygon);
      expect(returnedPolygon.properties?.area).toBe(1000); // Valor mock agregado
      // Verificar que tiene place_name (agregado por el mock, o preservado si ya existía)
      expect(returnedPolygon.properties?.place_name).toBeDefined();
    });
  });

  describe('deletePolygon', () => {
    it('should delete a polygon from store and map', async () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
      (polygonsApi.delete as any).mockResolvedValue({});

      // Primero agregar un polígono al store para poder eliminarlo
      const storeState = getMockStoreState();
      storeState.polygons.features.push(polygon);

      const { result } = renderHook(() => usePolygonOperations(), { wrapper });

      await act(async () => {
        await result.current.deletePolygon(polygon, 0);
      });

      expect(polygonsApi.delete).toHaveBeenCalledWith('/api/polygons/polygon-1');
      expect(mockDeletePolygonFromArray).toHaveBeenCalledWith(polygon, 0);
      expect(mockDraw.delete).toHaveBeenCalledWith('polygon-1');
      
      // Verificar que el polígono fue REALMENTE eliminado del store
      const finalState = getMockStoreState();
      expect(finalState.polygons.features).toHaveLength(0);
    });

    it('should throw error when API delete fails', async () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
      const apiError = new Error('Delete failed');
      (polygonsApi.delete as any).mockRejectedValue(apiError);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => usePolygonOperations(), { wrapper });

      await act(async () => {
        await expect(result.current.deletePolygon(polygon, 0)).rejects.toThrow();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error deleting polygon:', apiError);
      expect(mockDeletePolygonFromArray).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
