import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolygonViewport } from '../usePolygonViewport';
import { MapContext } from '../../context';
import { createTestPolygon } from '../../setupTests';

// Mock MAP_CONFIG
vi.mock('../../constants/map.constants', () => ({
  MAP_CONFIG: {
    POLYGON_FIT_PADDING: 50,
  },
}));

describe('usePolygonViewport', () => {
  const mockFitBounds = vi.fn();
  const mockMap = {
    fitBounds: mockFitBounds,
  } as any;

  const mockContextValue = {
    isMapReady: true,
    map: mockMap,
    draw: {} as any,
    setMap: vi.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MapContext.Provider value={mockContextValue}>
      {children}
    </MapContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should center polygon on map with fitBounds', () => {
    const polygon = createTestPolygon([[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]);
    
    const { result } = renderHook(() => usePolygonViewport(), { wrapper });
    
    act(() => {
      result.current.centerPolygon(polygon);
    });
    
    expect(mockFitBounds).toHaveBeenCalledWith(
      expect.arrayContaining([0, 0, 2, 2]),
      { padding: 50 }
    );
  });

  it('should not center polygon when map is null', () => {
    const contextWithoutMap = {
      ...mockContextValue,
      map: undefined,
    };
    
    const wrapperWithoutMap = ({ children }: { children: React.ReactNode }) => (
      <MapContext.Provider value={contextWithoutMap}>
        {children}
      </MapContext.Provider>
    );
    
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
    const { result } = renderHook(() => usePolygonViewport(), { wrapper: wrapperWithoutMap });
    
    act(() => {
      result.current.centerPolygon(polygon);
    });
    
    expect(mockFitBounds).not.toHaveBeenCalled();
  });

  it('should not center polygon when feature is undefined', () => {
    const { result } = renderHook(() => usePolygonViewport(), { wrapper });
    
    act(() => {
      result.current.centerPolygon(undefined);
    });
    
    expect(mockFitBounds).not.toHaveBeenCalled();
  });

  it('should not center polygon when feature has no geometry', () => {
    const featureWithoutGeometry = {
      type: 'Feature' as const,
      properties: {},
    } as GeoJSON.Feature;
    
    const { result } = renderHook(() => usePolygonViewport(), { wrapper });
    
    act(() => {
      result.current.centerPolygon(featureWithoutGeometry);
    });
    
    expect(mockFitBounds).not.toHaveBeenCalled();
  });

  it('should pass a valid LngLatBoundsLike array to fitBounds', () => {
    const polygon = createTestPolygon([[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]);
    
    const { result } = renderHook(() => usePolygonViewport(), { wrapper });
    
    act(() => {
      result.current.centerPolygon(polygon);
    });
    
    // Verificar que fitBounds fue llamado
    expect(mockFitBounds).toHaveBeenCalled();
    
    // Verificar que el primer argumento es un array válido de 4 números (LngLatBoundsLike)
    const bounds = mockFitBounds.mock.calls[0][0];
    expect(Array.isArray(bounds)).toBe(true);
    expect(bounds).toHaveLength(4);
    expect(bounds.every((n: any) => typeof n === 'number')).toBe(true);
    
    // Verificar que el segundo argumento tiene padding
    const options = mockFitBounds.mock.calls[0][1];
    expect(options).toEqual({ padding: 50 });
  });
});

