import { PolygonsState } from "./PolygonsProvider";

type PolygonsAction = {
  type: "updatePolygonsArray" | "loadFirstPolygons";
  payload: GeoJSON.Feature;
};

export const polygonsReducer = (
  state: PolygonsState,
  action: PolygonsAction
): PolygonsState => {
  switch (action.type) {
    case "updatePolygonsArray":
      state.polygons?.features.push(action.payload);
      return {
        ...state,
      };
    case "loadFirstPolygons":
      state.polygons?.features.push(action.payload);
      return {
        ...state,
      };
    default:
      return state;
  }
};
