import { useReducer } from "react";
import { PolygonsContext } from "./PolygonsContext";
import { polygonsReducer } from "./polygonsReducer";

import turf from "turf";

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

const setPolygonArea = (polygon: GeoJSON.Feature) => {
  let coords = JSON.parse(JSON.stringify(polygon.geometry));
  coords = coords.coordinates;

  const currentPolygon = turf.polygon(coords);
  const polygonArea = turf.area(currentPolygon);
  polygon.properties = {
    ...polygon.properties,
    area: polygonArea.toLocaleString(undefined, { maximumFractionDigits: 2 }),
  };

  return polygon;
};

export function PolygonsProvider({ children }: Props) {
  const [state, dispatch] = useReducer(polygonsReducer, INITIAL_STATE);

  const updatePolygonsArray = (e: GeoJSON.Feature) => {
    dispatch({ type: "updatePolygonsArray", payload: setPolygonArea(e) });
  };

  const loadFirstPolygons = (e: GeoJSON.Feature[]) => {
    e.forEach((polygon) => {
      dispatch({ type: "loadFirstPolygons", payload: setPolygonArea(polygon) });
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
        updatePolygonsArray,
        loadFirstPolygons,
        deletePolygonFromArray,
      }}
    >
      {children}
    </PolygonsContext.Provider>
  );
}
