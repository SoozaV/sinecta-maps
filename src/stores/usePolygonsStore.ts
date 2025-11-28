import { create } from 'zustand';
import geocodingApi from '../apis/geocodingApi';
import polygonsApi from '../apis/polygonsApi';
import turf from 'turf';

interface PolygonsState {
  polygons: GeoJSON.FeatureCollection;
  updatePolygonProperties: (
    polygon: GeoJSON.Feature<GeoJSON.Polygon>,
    name?: string
  ) => GeoJSON.Feature<GeoJSON.Polygon>;
  updatePolygonsArray: (polygon: GeoJSON.Feature<GeoJSON.Polygon>) => void;
  loadFirstPolygons: () => Promise<void>;
  deletePolygonFromArray: (polygon: GeoJSON.Feature, index: number) => void;
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
      const fc = data.data[0][0].json_build_object as GeoJSON.FeatureCollection;

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
}));

