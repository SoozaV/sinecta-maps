import { useReducer, ReactNode, useRef, useMemo } from "react";
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

const INITIAL_STATE: MapState = {
  isMapReady: false,
  draw: undefined,
  map: undefined,
};

export const MapProvider = ({ children }: Props) => {
  // Initialize MapboxDraw once and keep reference across re-renders
  const drawRef = useRef<MapboxDraw | undefined>(undefined);
  
  if (!drawRef.current) {
    drawRef.current = new MapboxDraw(MAP_CONTROLS.DRAW);
  }

  // Initialize state with draw instance
  const initialState = useMemo(() => ({
    ...INITIAL_STATE,
    draw: drawRef.current,
  }), []);

  const [state, dispatch] = useReducer(mapReducer, initialState);

  const setMap = (map: Map) => {
    if (drawRef.current) {
      map.addControl(drawRef.current);
    }
    map.addControl(new mapboxgl.NavigationControl(), MAP_CONTROLS.NAVIGATION.position);
    dispatch({ type: "setMap", payload: map });
  };

  return (
    <MapContext.Provider value={{ ...state, setMap }}>
      {children}
    </MapContext.Provider>
  );
};
