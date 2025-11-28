import { useReducer, ReactNode, useMemo, useCallback } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import { MapContext } from "./MapContext";
import { mapReducer } from "./mapReducer";
import MapboxDrawModule from "@mapbox/mapbox-gl-draw";
import { MAP_CONTROLS } from "../../constants/map.constants";

// MapboxDraw is exported as default but TypeScript types don't properly expose constructor
// Use type assertion to allow construction while maintaining instance type
type MapboxDrawInstance = InstanceType<typeof MapboxDrawModule>;
const MapboxDraw = MapboxDrawModule as typeof MapboxDrawModule & (new (options?: unknown) => MapboxDrawInstance);

export interface MapState {
  isMapReady: boolean;
  draw?: MapboxDrawInstance;
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
  // Initialize MapboxDraw once using useMemo (creates instance only once)
  const draw = useMemo(() => new MapboxDraw(MAP_CONTROLS.DRAW), []);

  // Initialize state with draw instance
  const [state, dispatch] = useReducer(mapReducer, {
    ...INITIAL_STATE,
    draw,
  });

  // Memoize setMap to ensure stable reference across re-renders
  const setMap = useCallback((map: Map) => {
    if (draw) {
      map.addControl(draw);
    }
    map.addControl(new mapboxgl.NavigationControl(), MAP_CONTROLS.NAVIGATION.position);
    dispatch({ type: "setMap", payload: map });
  }, [draw]);

  return (
    <MapContext.Provider value={{ ...state, setMap }}>
      {children}
    </MapContext.Provider>
  );
};
