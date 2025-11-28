import { useEffect, useReducer, ReactNode } from "react";
import { getUserLocation } from "../../helpers";
import { PlacesContext } from "./PlacesContext";
import { placesReducer } from "./placesReducer";
import { DEFAULT_LOCATION } from "../../constants/map.constants";

export interface PlacesState {
  isLoading: boolean;
  userLocation?: [number, number];
}

interface Props {
  children: ReactNode;
}

const INITIAL_STATE: PlacesState = {
  isLoading: true,
  userLocation: undefined,
};

export const PlacesProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(placesReducer, INITIAL_STATE);

  useEffect(() => {
    getUserLocation()
      .then((lngLat) => {
        dispatch({ type: "setUserLocation", payload: lngLat });
      })
      .catch((error) => {
        console.error("Error getting user location:", error);
        // Ubicación por defecto
        dispatch({ type: "setUserLocation", payload: DEFAULT_LOCATION });
        dispatch({ type: "setLoading", payload: false });
      });
  }, []);

  return (
    <PlacesContext.Provider
      value={{
        ...state,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
}
