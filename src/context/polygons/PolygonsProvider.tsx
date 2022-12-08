import { useReducer } from "react";
import { PolygonsContext } from "./PolygonsContext";
import { polygonsReducer } from "./polygonsReducer";

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

export function PolygonsProvider({ children }: Props) {
  const [state, dispatch] = useReducer(polygonsReducer, INITIAL_STATE);

  const updatePolygonsArray = (e: GeoJSON.Feature) => {
    dispatch({ type: "updatePolygonsArray", payload: e });
  };

  const loadFirstPolygons = (e: GeoJSON.Feature[]) => {
    e.forEach((polygon) => {
      dispatch({ type: "loadFirstPolygons", payload: polygon });
    });
  };

  return (
    <PolygonsContext.Provider
      value={{
        ...state,
        updatePolygonsArray,
        loadFirstPolygons,
      }}
    >
      {children}
    </PolygonsContext.Provider>
  );
}
