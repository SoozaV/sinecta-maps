import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolygonSelection } from '../usePolygonSelection';
import { MapContext } from '../../context';
import { createTestPolygon, createTestFeatureCollection } from '../../setupTests';

// Mock usePolygonsStore
vi.mock('../../stores/usePolygonsStore', () => ({
  usePolygonsStore: {
    getState: vi.fn(() => ({
      polygons: createTestFeatureCollection([
        createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1'),
        createTestPolygon([[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]], 'polygon-2'),
      ]),
    })),
  },
}));

describe('usePolygonSelection', () => {
  const mockDraw = {
    getSelectedIds: vi.fn(() => []),
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
  });

  it('should not select polygon from map when no polygon is selected', () => {
    mockDraw.getSelectedIds.mockReturnValue([]);
    
    const { result } = renderHook(() => usePolygonSelection(), { wrapper });
    
    act(() => {
      result.current.selectPolygonFromMap();
    });
    
    expect(result.current.activePolygon).toBeNull();
  });
});

