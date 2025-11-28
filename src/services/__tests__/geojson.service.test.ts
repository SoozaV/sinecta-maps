import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateGeoJSON, exportToFile, importFromFile } from '../geojson.service';
import { createTestPolygon, createTestFeatureCollection } from '../../setupTests';

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock document.createElement and appendChild/removeChild
const mockLink = {
  href: '',
  download: '',
  click: vi.fn(),
};

const originalCreateElement = document.createElement;
beforeEach(() => {
  document.createElement = vi.fn((tagName: string) => {
    if (tagName === 'a') {
      return mockLink as any;
    }
    return originalCreateElement.call(document, tagName);
  });
  document.body.appendChild = vi.fn();
  document.body.removeChild = vi.fn();
  vi.clearAllMocks();
});

describe('geojson.service', () => {
  describe('validateGeoJSON', () => {
    it('should validate a valid FeatureCollection', () => {
      const validFC = createTestFeatureCollection([
        createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]),
      ]);

      expect(validateGeoJSON(validFC)).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(validateGeoJSON(null)).toBe(false);
      expect(validateGeoJSON(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(validateGeoJSON('string')).toBe(false);
      expect(validateGeoJSON(123)).toBe(false);
      expect(validateGeoJSON([])).toBe(false);
    });

    it('should reject if type is not FeatureCollection', () => {
      const invalid = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
      };

      expect(validateGeoJSON(invalid)).toBe(false);
    });

    it('should reject if features is not an array', () => {
      const invalid = {
        type: 'FeatureCollection',
        features: 'not-an-array',
      };

      expect(validateGeoJSON(invalid)).toBe(false);
    });

    it('should reject features with invalid structure', () => {
      const invalid = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'NotAFeature',
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      };

      expect(validateGeoJSON(invalid)).toBe(false);
    });

    it('should reject features without geometry', () => {
      const invalid = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
          },
        ],
      };

      expect(validateGeoJSON(invalid)).toBe(false);
    });

    it('should reject non-Polygon geometries', () => {
      const invalid = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
            properties: {},
          },
        ],
      };

      expect(validateGeoJSON(invalid)).toBe(false);
    });

    it('should validate FeatureCollection with empty features array', () => {
      const emptyFC = createTestFeatureCollection([]);
      expect(validateGeoJSON(emptyFC)).toBe(true);
    });
  });

  describe('exportToFile', () => {
    it('should create and download a GeoJSON file', () => {
      const featureCollection = createTestFeatureCollection([
        createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]),
      ]);

      exportToFile(featureCollection);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toMatch(/^sinecta-polygons-.*\.geojson$/);
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should throw error on export failure', () => {
      const invalidFC = null as any;

      expect(() => exportToFile(invalidFC)).toThrow('Failed to export GeoJSON');
    });
  });

  describe('importFromFile', () => {
    it('should import a valid GeoJSON file', async () => {
      const featureCollection = createTestFeatureCollection([
        createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]),
      ]);

      const file = new File([JSON.stringify(featureCollection)], 'test.geojson', {
        type: 'application/geo+json',
      });

      const result = await importFromFile(file);

      expect(result).toEqual(featureCollection);
      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
    });

    it('should reject non-GeoJSON files', async () => {
      const file = new File(['not geojson'], 'test.txt', { type: 'text/plain' });

      await expect(importFromFile(file)).rejects.toThrow(
        'File must be a GeoJSON file (.geojson or .json)'
      );
    });

    it('should reject invalid JSON', async () => {
      const file = new File(['invalid json {'], 'test.geojson', {
        type: 'application/geo+json',
      });

      await expect(importFromFile(file)).rejects.toThrow('Invalid JSON format');
    });

    it('should reject invalid GeoJSON structure', async () => {
      const invalidData = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
      };

      const file = new File([JSON.stringify(invalidData)], 'test.geojson', {
        type: 'application/geo+json',
      });

      await expect(importFromFile(file)).rejects.toThrow(
        'Invalid GeoJSON format. Expected FeatureCollection with Polygon features.'
      );
    });

    it('should accept .json files', async () => {
      const featureCollection = createTestFeatureCollection([
        createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]),
      ]);

      const file = new File([JSON.stringify(featureCollection)], 'test.json', {
        type: 'application/json',
      });

      const result = await importFromFile(file);

      expect(result).toEqual(featureCollection);
    });

    it('should handle file read errors', async () => {
      const file = new File(['test'], 'test.geojson', { type: 'application/geo+json' });
      
      // Mock FileReader to simulate error
      const originalFileReader = global.FileReader;
      global.FileReader = class {
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
        readAsText() {
          if (this.onerror) {
            this.onerror(new ProgressEvent('error'));
          }
        }
      } as any;

      await expect(importFromFile(file)).rejects.toThrow('Failed to read file');

      global.FileReader = originalFileReader;
    });
  });
});

