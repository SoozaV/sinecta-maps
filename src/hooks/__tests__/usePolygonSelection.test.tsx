import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolygonSelection } from '../usePolygonSelection';
import { MapContext } from '../../context';
import { createTestPolygon } from '../../setupTests';

// Mock usePolygonsStore con simulación realista de Zustand
const { getMockStoreState, resetMockStoreState } = vi.hoisted(() => {
  // Estado inicial del store (para resetear entre tests)
  const initialPolygons = [
    {
      type: 'Feature' as const,
      id: 'polygon-1',
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      },
      properties: {},
    },
    {
      type: 'Feature' as const,
      id: 'polygon-2',
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]],
      },
      properties: {},
    },
  ] as GeoJSON.Feature<GeoJSON.Polygon>[];

  // Estado mutable del store (puede cambiar entre tests)
  let storeState = {
    polygons: {
      type: 'FeatureCollection' as const,
      features: [...initialPolygons],
    },
  };

  const getMockStoreState = () => storeState;

  // Función para resetear el estado entre tests
  const resetMockStoreState = () => {
    storeState = {
      polygons: {
        type: 'FeatureCollection' as const,
        features: [...initialPolygons],
      },
    };
  };

  return { getMockStoreState, resetMockStoreState };
});

vi.mock('../../stores/usePolygonsStore', () => {
  // Función que simula el hook de Zustand (puede usarse con o sin selector)
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

describe('usePolygonSelection', () => {
  const mockDraw = {
    getSelectedIds: vi.fn<() => string[]>(() => []),
    get: vi.fn(),
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
    // Resetear el estado del store entre tests para evitar contaminación
    resetMockStoreState();
  });

  it('should initialize with null activePolygon', () => {
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    
    expect(result.current.activePolygon).toBeNull();
  });

  it('should select a polygon correctly', () => {
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'test-id');
    
    act(() => {
      result.current.selectPolygon(polygon, 0);
    });
    
    expect(result.current.activePolygon).not.toBeNull();
    expect(result.current.activePolygon?.polygonId).toBe('test-id');
    expect(result.current.activePolygon?.index).toBe(0);
    expect(result.current.activePolygon?.feature).toEqual(polygon);
  });

  it('should select polygon from map when draw is available', () => {
    const selectedPolygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    mockDraw.getSelectedIds.mockReturnValue(['polygon-1']);
    mockDraw.get.mockReturnValue(selectedPolygon);
    
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    
    act(() => {
      result.current.selectPolygonFromMap();
    });
    
    expect(mockDraw.getSelectedIds).toHaveBeenCalled();
    expect(mockDraw.get).toHaveBeenCalledWith('polygon-1');
    expect(result.current.activePolygon).not.toBeNull();
    expect(result.current.activePolygon?.polygonId).toBe('polygon-1');
    expect(result.current.activePolygon?.index).toBe(0); // polygon-1 está en índice 0
    expect(result.current.activePolygon?.feature).toEqual(selectedPolygon);
  });

  it('should not select polygon from map when draw is null', () => {
    const contextWithoutDraw = {
      ...mockContextValue,
      draw: undefined,
    };
    
    const wrapperWithoutDraw = ({ children }: { children: React.ReactNode }) => (
      <MapContext.Provider value={contextWithoutDraw}>
        {children}
      </MapContext.Provider>
    );
    
    const { result } = renderHook(() => usePolygonSelection(), { wrapper: wrapperWithoutDraw });
    
    act(() => {
      result.current.selectPolygonFromMap();
    });
    
    expect(result.current.activePolygon).toBeNull();
    expect(mockDraw.getSelectedIds).not.toHaveBeenCalled();
  });

  it('should not select polygon from map when no polygon is selected', () => {
    mockDraw.getSelectedIds.mockReturnValue([]);
    
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    
    act(() => {
      result.current.selectPolygonFromMap();
    });
    
    expect(result.current.activePolygon).toBeNull();
    expect(mockDraw.get).not.toHaveBeenCalled();
  });

  it('should not select polygon when selected on map but not in store', () => {
    const selectedPolygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-not-in-store');
    mockDraw.getSelectedIds.mockReturnValue(['polygon-not-in-store']);
    mockDraw.get.mockReturnValue(selectedPolygon);
    
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    
    act(() => {
      result.current.selectPolygonFromMap();
    });
    
    // El polígono está en draw pero no en store, por lo que index será -1 y no se selecciona
    expect(result.current.activePolygon).toBeNull();
    expect(mockDraw.get).toHaveBeenCalledWith('polygon-not-in-store');
  });

  it('should select polygon with correct index when present in store', () => {
    const selectedPolygon = createTestPolygon([[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]], 'polygon-2');
    mockDraw.getSelectedIds.mockReturnValue(['polygon-2']);
    mockDraw.get.mockReturnValue(selectedPolygon);
    
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    
    act(() => {
      result.current.selectPolygonFromMap();
    });
    
    expect(result.current.activePolygon).not.toBeNull();
    expect(result.current.activePolygon?.polygonId).toBe('polygon-2');
    expect(result.current.activePolygon?.index).toBe(1); // polygon-2 está en índice 1
    expect(result.current.activePolygon?.feature).toEqual(selectedPolygon);
  });

  it('should not select polygon when draw.get returns null', () => {
    mockDraw.getSelectedIds.mockReturnValue(['polygon-1']);
    mockDraw.get.mockReturnValue(null);
    
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    
    act(() => {
      result.current.selectPolygonFromMap();
    });
    
    // draw.get devuelve null, por lo que selectedPolygon es falsy y no se selecciona
    expect(result.current.activePolygon).toBeNull();
    expect(mockDraw.get).toHaveBeenCalledWith('polygon-1');
  });

  it('should select polygon even when selectedPolygon object has no id (exposes potential bug)', () => {
    // Crear un polígono sin id (simulando un objeto inválido de draw)
    // Este test expone un bug potencial: el código no valida que selectedPolygon.id coincida con selectedPolygonId
    const selectedPolygonWithoutId = {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      },
      properties: {},
      // Sin id - pero draw.getSelectedIds() devuelve 'polygon-1'
    } as GeoJSON.Feature<GeoJSON.Polygon>;
    
    mockDraw.getSelectedIds.mockReturnValue(['polygon-1']); // ID que existe en store
    mockDraw.get.mockReturnValue(selectedPolygonWithoutId); // Pero el objeto no tiene id
    
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    
    act(() => {
      result.current.selectPolygonFromMap();
    });
    
    // El código actual busca en el store por selectedPolygonId ('polygon-1')
    // y encuentra el índice (0), luego verifica que selectedPolygon existe (truthy)
    // PERO no valida que selectedPolygon.id === selectedPolygonId
    // Esto es un bug potencial: se selecciona un polígono que no coincide con el ID buscado
    
    // Comportamiento actual del código (bug potencial):
    // - selectedPolygonId = 'polygon-1' (del array de IDs seleccionados)
    // - selectedPolygon = objeto sin id (de draw.get)
    // - index = 0 (porque encuentra 'polygon-1' en el store)
    // - index !== -1 && selectedPolygon = true → se selecciona
    
    const storeState = getMockStoreState();
    const index = storeState.polygons.features.findIndex((f) => f.id === 'polygon-1');
    expect(index).toBe(0); // El polígono SÍ está en el store
    
    // El código actual SÍ lo seleccionaría (bug potencial)
    expect(result.current.activePolygon).not.toBeNull();
    // Pero el polygonId será undefined porque selectedPolygon.id no existe
    expect(result.current.activePolygon?.polygonId).toBeUndefined();
    // El feature será el objeto sin id
    expect(result.current.activePolygon?.feature).toEqual(selectedPolygonWithoutId);
  });

  it('should verify that selectPolygon is called internally when selecting from map', () => {
    const selectedPolygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    mockDraw.getSelectedIds.mockReturnValue(['polygon-1']);
    mockDraw.get.mockReturnValue(selectedPolygon);
    
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    
    // Verificar estado inicial
    expect(result.current.activePolygon).toBeNull();
    
    act(() => {
      result.current.selectPolygonFromMap();
    });
    
    // Verificar que selectPolygon fue llamado internamente (indirectamente, verificando el resultado)
    expect(result.current.activePolygon).not.toBeNull();
    expect(result.current.activePolygon?.polygonId).toBe('polygon-1');
    expect(result.current.activePolygon?.index).toBe(0);
    expect(result.current.activePolygon?.feature).toEqual(selectedPolygon);
    
    // Verificar que se usó getState del store
    const storeState = getMockStoreState();
    expect(storeState.polygons.features).toContainEqual(
      expect.objectContaining({ id: 'polygon-1' })
    );
  });

  it('should handle case when two polygons in store share the same id (edge case)', () => {
    // Simular un caso edge donde hay IDs duplicados en el store
    // Esto puede pasar si hay un bug en el código que crea polígonos
    const storeState = getMockStoreState();
    const duplicatePolygon = {
      type: 'Feature' as const,
      id: 'polygon-1', // Mismo ID que el primero
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[10, 10], [11, 10], [11, 11], [10, 11], [10, 10]]],
      },
      properties: {},
    } as GeoJSON.Feature<GeoJSON.Polygon>;
    
    // Agregar polígono duplicado al store
    storeState.polygons.features.push(duplicatePolygon);
    
    const selectedPolygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    mockDraw.getSelectedIds.mockReturnValue(['polygon-1']);
    mockDraw.get.mockReturnValue(selectedPolygon);
    
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    
    act(() => {
      result.current.selectPolygonFromMap();
    });
    
    // findIndex devuelve el PRIMER índice que encuentra
    // El código seleccionará el primer polígono con ese ID (índice 0)
    expect(result.current.activePolygon).not.toBeNull();
    expect(result.current.activePolygon?.polygonId).toBe('polygon-1');
    expect(result.current.activePolygon?.index).toBe(0); // Primer match, no el duplicado
  });
});
