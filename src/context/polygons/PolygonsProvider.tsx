import { useReducer } from "react";
import { PolygonsContext } from "./PolygonsContext";
import { polygonsReducer } from "./polygonsReducer";

import geocodingApi from "../../apis/geocodingApi";

import turf from "turf";
import polygonsApi from "../../apis/polygonsApi";

export interface Polygon {
  polygon: GeoJSON.Feature;
}

export interface PolygonsState {
  polygons?: GeoJSON.FeatureCollection;
}

const INITIAL_STATE: PolygonsState = {
  polygons: {
    type: "FeatureCollection",
    features: [],
  },
};

interface Props {
  children: JSX.Element | JSX.Element[];
}

const getPolygonCoords = (polygon: GeoJSON.Feature) => {
  const coords = JSON.parse(JSON.stringify(polygon.geometry));
  return coords.coordinates;
};

const getPolygonCenter = (polygon: GeoJSON.Feature<GeoJSON.Polygon>) =>
  turf.centroid(polygon);

const setPolygonAdress = async (polygon: GeoJSON.Feature<GeoJSON.Polygon>) => {
  const polygonCenter = getPolygonCenter(polygon);
  const lng = polygonCenter.geometry.coordinates[0];
  const lat = polygonCenter.geometry.coordinates[1];
  return await geocodingApi.get(`/${lng},${lat}.json`).then((res) => {
    polygon.properties = {
      ...polygon.properties,
      place_name: res.data.features[0].place_name,
    };
    return polygon;
  });
};

const setPolygonArea = (polygon: GeoJSON.Feature<GeoJSON.Polygon>) => {
  if (polygon.properties && polygon.properties.area) return polygon;
  const coords = getPolygonCoords(polygon);

  const currentPolygon = turf.polygon(coords);
  const polygonArea = turf.area(currentPolygon);
  polygon.properties = {
    ...polygon.properties,
    area: polygonArea,
  };
  return polygon;
};

export function PolygonsProvider({ children }: Props) {
  const [state, dispatch] = useReducer(polygonsReducer, INITIAL_STATE);

  const updatePolygonProperties = (
    polygon: GeoJSON.Feature<GeoJSON.Polygon>,
    name?: string
  ) => {
    if (!polygon.properties) polygon.properties = {};
    name
      ? (polygon.properties.name = name)
      : (polygon.properties.name = "Title Placeholder");
    if (!polygon.properties.area) polygon = setPolygonArea(polygon);
    return polygon;
  };

  const updatePolygonsArray = (e: GeoJSON.Feature<GeoJSON.Polygon>) => {
    setPolygonAdress(e).then((polygon) => {
      dispatch({
        type: "updatePolygonsArray",
        payload: setPolygonArea(polygon),
      });
    });
  };

  const loadFirstPolygons = async () => {
    const { data } = await polygonsApi.get("/api/polygons");

    const fc = data.data[0][0].json_build_object as GeoJSON.FeatureCollection;

    fc.features.forEach((polygon) => {
      setPolygonAdress(polygon as GeoJSON.Feature<GeoJSON.Polygon>).then(
        (polygon) => {
          dispatch({
            type: "loadFirstPolygons",
            payload: setPolygonArea(polygon),
          });
        }
      );
    });
  };

  const deletePolygonFromArray = (e: GeoJSON.Feature, index: number) => {
    e.properties! = { index };
    dispatch({ type: "deletePolygon", payload: e });
  };

  return (
    <PolygonsContext.Provider
      value={{
        ...state,
        updatePolygonProperties,
        updatePolygonsArray,
        loadFirstPolygons,
        deletePolygonFromArray,
      }}
    >
      {children}
    </PolygonsContext.Provider>
  );
}
