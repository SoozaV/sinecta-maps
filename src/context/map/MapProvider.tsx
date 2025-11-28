import { useReducer, ReactNode } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import { MapContext } from "./MapContext";
import { mapReducer } from "./mapReducer";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MAP_CONTROLS } from "../../constants/map.constants";

export interface MapState {
  isMapReady: boolean;
  draw?: MapboxDraw;
  map?: Map;
}

type Props = {
  children: ReactNode;
};

const draw = new MapboxDraw(MAP_CONTROLS.DRAW);

const INITIAL_STATE: MapState = {
  isMapReady: false,
  draw,
  map: undefined,
};

export const MapProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(mapReducer, INITIAL_STATE);

  const setMap = (map: Map) => {
    map.addControl(draw);
    map.addControl(new mapboxgl.NavigationControl(), MAP_CONTROLS.NAVIGATION.position);
    dispatch({ type: "setMap", payload: map });
  };

  return (
    <MapContext.Provider value={{ ...state, setMap }}>
      {children}
    </MapContext.Provider>
  );
};
