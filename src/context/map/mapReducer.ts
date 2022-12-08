import { Map } from "mapbox-gl";
import { MapState } from "./MapProvider";

type MapAction = {
  type: "setMap" | "addPolygon";
  payload: Map;
};

export const mapReducer = (state: MapState, action: MapAction): MapState => {
  switch (action.type) {
    case "setMap":
      return {
        ...state,
        isMapReady: true,
        map: action.payload,
      };
    case "addPolygon":
      return {
        ...state,
        map: action.payload
      };
    default:
      return state;
  }
};
