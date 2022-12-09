import { useReducer } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import { MapContext } from "./MapContext";
import { mapReducer } from "./mapReducer";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

const polygonsData = require("../../polygons");

export interface MapState {
  isMapReady: boolean;
  draw?: MapboxDraw;
  map?: Map;
}

type Props = {
  children: JSX.Element | JSX.Element[];
};

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: false,
  },
  //defaultMode: "draw_polygon",
});

const INITIAL_STATE: MapState = {
  isMapReady: false,
  draw,
  map: undefined,
};

export const MapProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(mapReducer, INITIAL_STATE);

  const setMap = (map: Map) => {
    map.on("load", () => {
      draw.set(polygonsData as GeoJSON.FeatureCollection);
    });
    map.addControl(draw);
    map.addControl(new mapboxgl.NavigationControl(), "top-left");
    dispatch({ type: "setMap", payload: map });
  };

  return (
    <MapContext.Provider value={{ ...state, setMap }}>
      {children}
    </MapContext.Provider>
  );
};
