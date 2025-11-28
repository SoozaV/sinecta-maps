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

// Mock usePolygonsStore
const mockUpdatePolygonProperties = vi.fn((polygon) => ({
  ...polygon,
  properties: { ...polygon.properties, name: 'Test Polygon' },
}));

const mockUpdatePolygonsArray = vi.fn();
const mockDeletePolygonFromArray = vi.fn();

const mockState = {
  updatePolygonProperties: mockUpdatePolygonProperties,
  updatePolygonsArray: mockUpdatePolygonsArray,
  deletePolygonFromArray: mockDeletePolygonFromArray,
  polygons: {
    type: 'FeatureCollection' as const,
    features: [],
  },
};

vi.mock('../../stores/usePolygonsStore', () => ({
  usePolygonsStore: Object.assign(
    vi.fn((selector) => {
      return selector ? selector(mockState) : mockState;
    }),
    {
      getState: () => mockState,
    }
  ),
}));

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
  });

  describe('createPolygon', () => {
    it('should create a polygon with properties', async () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      (polygonsApi.post as any).mockResolvedValue({
        data: { data: polygon },
      });
      mockUpdatePolygonsArray.mockResolvedValue(undefined);

      const { result } = renderHook(() => usePolygonOperations(), { wrapper });

      await act(async () => {
        await result.current.createPolygon(polygon);
      });

      expect(mockUpdatePolygonProperties).toHaveBeenCalledWith(polygon);
      expect(polygonsApi.post).toHaveBeenCalledWith('/api/polygons', expect.any(Object));
      expect(mockUpdatePolygonsArray).toHaveBeenCalled();
    });

    it('should handle backend error gracefully and continue locally', async () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      (polygonsApi.post as any).mockRejectedValue(new Error('Backend unavailable'));
      mockUpdatePolygonsArray.mockResolvedValue(undefined);

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
      expect(createdPolygon).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should generate temporary ID when backend fails and polygon has no ID', async () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      delete polygon.id;
      (polygonsApi.post as any).mockRejectedValue(new Error('Backend unavailable'));
      mockUpdatePolygonsArray.mockResolvedValue(undefined);

      const { result } = renderHook(() => usePolygonOperations(), { wrapper });

      await act(async () => {
        await result.current.createPolygon(polygon);
      });

      expect(mockUpdatePolygonsArray).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^temp-/),
        })
      );
    });
  });

  describe('deletePolygon', () => {
    it('should delete a polygon from store and map', async () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
      (polygonsApi.delete as any).mockResolvedValue({});

      const { result } = renderHook(() => usePolygonOperations(), { wrapper });

      await act(async () => {
        await result.current.deletePolygon(polygon, 0);
      });

      expect(polygonsApi.delete).toHaveBeenCalledWith('/api/polygons/polygon-1');
      expect(mockDeletePolygonFromArray).toHaveBeenCalledWith(polygon, 0);
      expect(mockDraw.delete).toHaveBeenCalledWith('polygon-1');
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

