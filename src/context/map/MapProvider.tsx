import { useReducer } from "react";
import { Map } from "mapbox-gl";
import { MapContext } from "./MapContext";
import { mapReducer } from "./mapReducer";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

const polygonsData = require("../../polygons");

export interface MapState {
  isMapReady: boolean;
  map?: Map;
}

type Props = {
  children: JSX.Element | JSX.Element[];
};

const INITIAL_STATE: MapState = {
  isMapReady: false,
  map: undefined,
};

export const MapProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(mapReducer, INITIAL_STATE);

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
    //defaultMode: "draw_polygon",
  });

  const setMap = (map: Map) => {
    map.on("load", () => {
      draw.set(polygonsData as GeoJSON.FeatureCollection);
    });
    map.addControl(draw);
    dispatch({ type: "setMap", payload: map });
  };

  return (
    <MapContext.Provider value={{ ...state, setMap }}>
      {children}
    </MapContext.Provider>
  );
};
