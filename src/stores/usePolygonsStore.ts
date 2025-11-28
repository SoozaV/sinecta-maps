import { create } from 'zustand';
import geocodingApi from '../apis/geocodingApi';
import polygonsApi from '../apis/polygonsApi';
import * as turf from '@turf/turf';

interface PolygonsState {
  polygons: GeoJSON.FeatureCollection;
  updatePolygonProperties: (
    polygon: GeoJSON.Feature<GeoJSON.Polygon>,
    name?: string
  ) => GeoJSON.Feature<GeoJSON.Polygon>;
  updatePolygonsArray: (polygon: GeoJSON.Feature<GeoJSON.Polygon>) => void;
  loadFirstPolygons: () => Promise<void>;
  deletePolygonFromArray: (polygon: GeoJSON.Feature, index: number) => void;
  replacePolygons: (featureCollection: GeoJSON.FeatureCollection) => void;
}

const getPolygonCoords = (polygon: GeoJSON.Feature) => {
  const coords = JSON.parse(JSON.stringify(polygon.geometry));
  return coords.coordinates;
};

const getPolygonCenter = (polygon: GeoJSON.Feature<GeoJSON.Polygon>) =>
  turf.centroid(polygon);

const setPolygonAddress = async (polygon: GeoJSON.Feature<GeoJSON.Polygon>) => {
  const polygonCenter = getPolygonCenter(polygon);
  const lng = polygonCenter.geometry.coordinates[0];
  const lat = polygonCenter.geometry.coordinates[1];
  try {
    const res = await geocodingApi.get(`/${lng},${lat}.json`);
    return {
      ...polygon,
      properties: {
        ...polygon.properties,
        place_name: res.data.features[0].place_name,
      },
    };
  } catch (error) {
    console.error('Error geocoding polygon:', error);
    return polygon;
  }
};

const setPolygonArea = (polygon: GeoJSON.Feature<GeoJSON.Polygon>) => {
  if (polygon.properties && polygon.properties.area) return polygon;
  const coords = getPolygonCoords(polygon);
  const currentPolygon = turf.polygon(coords);
  const polygonArea = turf.area(currentPolygon);
  return {
    ...polygon,
    properties: {
      ...polygon.properties,
      area: polygonArea,
    },
  };
};

export const usePolygonsStore = create<PolygonsState>((set, get) => ({
  polygons: {
    type: 'FeatureCollection',
    features: [],
  },

  updatePolygonProperties: (
    polygon: GeoJSON.Feature<GeoJSON.Polygon>,
    name?: string
  ) => {
    const properties = polygon.properties || {};
    const updatedPolygon = {
      ...polygon,
      properties: {
        ...properties,
        name: name || properties.name || 'Title Placeholder',
      },
    };
    return setPolygonArea(updatedPolygon);
  },

  updatePolygonsArray: async (polygon: GeoJSON.Feature<GeoJSON.Polygon>) => {
    const polygonWithArea = setPolygonArea(polygon);
    const polygonWithAddress = await setPolygonAddress(polygonWithArea);
    set((state) => ({
      polygons: {
        ...state.polygons,
        features: [...state.polygons.features, polygonWithAddress],
      },
    }));
  },

  loadFirstPolygons: async () => {
    try {
      const { data } = await polygonsApi.get('/api/polygons');
      
      // Validar estructura de respuesta del backend
      // Estructura esperada: data.data = [[{ json_build_object: {...} }]]
      if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.warn('No polygons data received from backend');
        set({
          polygons: {
            type: 'FeatureCollection',
            features: [],
          },
        });
        return;
      }

      const firstRow = data.data[0];
      if (!firstRow || !Array.isArray(firstRow) || firstRow.length === 0) {
        console.warn('Empty polygons array from backend');
        set({
          polygons: {
            type: 'FeatureCollection',
            features: [],
          },
        });
        return;
      }

      const jsonBuildObject = firstRow[0]?.json_build_object;
      if (!jsonBuildObject || !jsonBuildObject.features) {
        console.warn('Invalid polygon data structure from backend');
        set({
          polygons: {
            type: 'FeatureCollection',
            features: [],
          },
        });
        return;
      }

      const fc = jsonBuildObject as GeoJSON.FeatureCollection;

      // Validar que features existe y es un array
      if (!fc.features || !Array.isArray(fc.features) || fc.features.length === 0) {
        set({
          polygons: {
            type: 'FeatureCollection',
            features: [],
          },
        });
        return;
      }

      const polygonsWithData = await Promise.all(
        fc.features.map(async (polygon) => {
          const polygonWithId = {
            ...polygon,
            id: polygon.properties?.id || polygon.id,
          } as GeoJSON.Feature<GeoJSON.Polygon>;
          const polygonWithAddress = await setPolygonAddress(polygonWithId);
          return setPolygonArea(polygonWithAddress);
        })
      );

      set({
        polygons: {
          type: 'FeatureCollection',
          features: polygonsWithData,
        },
      });
    } catch (error) {
      console.error('Error loading polygons:', error);
      // Asegurar que el estado tenga una estructura válida incluso si hay error
      set({
        polygons: {
          type: 'FeatureCollection',
          features: [],
        },
      });
    }
  },

  deletePolygonFromArray: (polygon: GeoJSON.Feature, index: number) => {
    set((state) => ({
      polygons: {
        ...state.polygons,
        features: state.polygons.features.filter((_, i) => i !== index),
      },
    }));
  },

  replacePolygons: (featureCollection: GeoJSON.FeatureCollection) => {
    set({
      polygons: featureCollection,
    });
  },
}));

// Selectores optimizados para evitar re-renders innecesarios
export const selectPolygons = (state: PolygonsState) => state.polygons;
export const selectPolygonFeatures = (state: PolygonsState) => state.polygons.features;
export const selectPolygonById = (id: string) => (state: PolygonsState) =>
  state.polygons.features.find((f) => f.id === id);
export const selectPolygonCount = (state: PolygonsState) => state.polygons.features.length;
