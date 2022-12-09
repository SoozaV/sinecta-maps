import { PolygonsState } from "./PolygonsProvider";

type PolygonsAction = {
  type: "updatePolygonsArray" | "loadFirstPolygons" | "deletePolygon";
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
    case "deletePolygon":
      const index = action.payload.properties?.index;
      state.polygons?.features.splice(index, 1);
      return {
        ...state,
      };
    default:
      return state;
  }
};
