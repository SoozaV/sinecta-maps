import { describe, it, expect } from 'vitest';
import {
  getPolygonCoords,
  getPolygonCenter,
  calculatePolygonArea,
  formatArea,
  getPolygonBbox,
  calculatePolygonPerimeter,
  getVertexCount,
  formatDistance,
} from '../polygon.utils';
import { createTestPolygon } from '../../setupTests';

describe('polygon.utils', () => {
  describe('getPolygonCoords', () => {
    it('should extract coordinates from a polygon feature', () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      const coords = getPolygonCoords(polygon);
      
      expect(coords).toEqual([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
    });

    it('should handle polygons with multiple rings', () => {
      const polygon = createTestPolygon([
        [[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]],
        [[0.5, 0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5], [0.5, 0.5]],
      ]);
      const coords = getPolygonCoords(polygon);
      
      expect(coords).toHaveLength(2);
      expect(coords[0]).toHaveLength(5);
      expect(coords[1]).toHaveLength(5);
    });
  });

  describe('getPolygonCenter', () => {
    it('should calculate the centroid of a polygon', () => {
      const polygon = createTestPolygon([[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]);
      const center = getPolygonCenter(polygon);
      
      expect(center.type).toBe('Feature');
      expect(center.geometry.type).toBe('Point');
      expect(center.geometry.coordinates).toHaveLength(2);
      // Centroid of a square should be approximately at (1, 1)
      expect(center.geometry.coordinates[0]).toBeCloseTo(1, 1);
      expect(center.geometry.coordinates[1]).toBeCloseTo(1, 1);
    });
  });

  describe('calculatePolygonArea', () => {
    it('should calculate area in square meters', () => {
      // Simple square polygon: 1 degree x 1 degree
      // At equator, 1 degree ≈ 111km, so area ≈ 12,321 km²
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      const area = calculatePolygonArea(polygon);
      
      expect(area).toBeGreaterThan(0);
      expect(typeof area).toBe('number');
    });

    it('should return 0 for degenerate polygons', () => {
      const polygon = createTestPolygon([[[0, 0], [0, 0], [0, 0], [0, 0]]]);
      const area = calculatePolygonArea(polygon);
      
      expect(area).toBe(0);
    });
  });

  describe('formatArea', () => {
    it('should format area with locale and 2 decimal places', () => {
      const area = 1234.567;
      const formatted = formatArea(area);
      
      expect(formatted).toContain('1,234.57');
      expect(formatted).toContain('m²');
    });

    it('should handle large numbers', () => {
      const area = 1234567.89;
      const formatted = formatArea(area);
      
      expect(formatted).toContain('1,234,567.89');
      expect(formatted).toContain('m²');
    });

    it('should handle zero', () => {
      const formatted = formatArea(0);
      expect(formatted).toBe('0m²');
    });
  });

  describe('getPolygonBbox', () => {
    it('should calculate bounding box for a polygon', () => {
      const polygon = createTestPolygon([[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]);
      const bbox = getPolygonBbox(polygon);
      
      expect(bbox).toHaveLength(4);
      expect(bbox[0]).toBe(0); // minLng
      expect(bbox[1]).toBe(0); // minLat
      expect(bbox[2]).toBe(2); // maxLng
      expect(bbox[3]).toBe(2); // maxLat
    });

    it('should handle polygons with negative coordinates', () => {
      const polygon = createTestPolygon([[[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]]]);
      const bbox = getPolygonBbox(polygon);
      
      expect(bbox[0]).toBe(-1);
      expect(bbox[1]).toBe(-1);
      expect(bbox[2]).toBe(1);
      expect(bbox[3]).toBe(1);
    });
  });

  describe('calculatePolygonPerimeter', () => {
    it('should calculate perimeter in meters', () => {
      // Square polygon: 1 degree x 1 degree
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      const perimeter = calculatePolygonPerimeter(polygon);
      
      expect(perimeter).toBeGreaterThan(0);
      expect(typeof perimeter).toBe('number');
    });

    it('should return 0 for degenerate polygons', () => {
      const polygon = createTestPolygon([[[0, 0], [0, 0], [0, 0], [0, 0]]]);
      const perimeter = calculatePolygonPerimeter(polygon);
      
      expect(perimeter).toBe(0);
    });
  });

  describe('getVertexCount', () => {
    it('should count vertices correctly', () => {
      const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);
      const count = getVertexCount(polygon);
      
      // 4 vertices (last point is duplicate of first)
      expect(count).toBe(4);
    });

    it('should handle polygons with many vertices', () => {
      const polygon = createTestPolygon([[
        [0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [2, 1], [1, 1], [0, 1], [0, 0]
      ]]);
      const count = getVertexCount(polygon);
      
      expect(count).toBe(8);
    });

    it('should return 0 for invalid polygons', () => {
      const polygon = createTestPolygon([[[0, 0], [0, 0]]]);
      const count = getVertexCount(polygon);
      
      expect(count).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('should format meters for distances < 1000m', () => {
      const formatted = formatDistance(500);
      
      expect(formatted).toContain('500');
      expect(formatted).toContain(' m');
      expect(formatted).not.toContain('km');
    });

    it('should format kilometers for distances >= 1000m', () => {
      const formatted = formatDistance(1500);
      
      expect(formatted).toContain('1.5');
      expect(formatted).toContain(' km');
      expect(formatted).not.toContain(' m');
    });

    it('should handle large distances', () => {
      const formatted = formatDistance(12345.67);
      
      expect(formatted).toContain('12,345.67');
      expect(formatted).toContain(' km');
    });

    it('should handle zero', () => {
      const formatted = formatDistance(0);
      expect(formatted).toBe('0 m');
    });
  });
});

