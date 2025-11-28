import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Mapbox GL JS
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      off: vi.fn(),
      fitBounds: vi.fn(),
      getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
      getZoom: vi.fn(() => 10),
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      remove: vi.fn(),
    })),
    Marker: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    Popup: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setHTML: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
    })),
    accessToken: '',
  },
}));

// Mock Mapbox Draw
vi.mock('@mapbox/mapbox-gl-draw', () => ({
  default: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(() => ({
      type: 'FeatureCollection',
      features: [],
    })),
    getSelectedIds: vi.fn(() => []),
    set: vi.fn(),
    changeMode: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

// Helper function to create test GeoJSON features
export const createTestPolygon = (
  coordinates: number[][][] = [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
  id?: string | number
): GeoJSON.Feature<GeoJSON.Polygon> => ({
  type: 'Feature',
  id: id || 'test-polygon-1',
  geometry: {
    type: 'Polygon',
    coordinates,
  },
  properties: {
    name: 'Test Polygon',
    area: 1000,
    place_name: 'Test Location',
  },
});

export const createTestFeatureCollection = (
  features: GeoJSON.Feature[] = []
): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features,
});

