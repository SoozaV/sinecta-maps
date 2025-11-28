import { memo, useCallback, useContext } from "react";
import { MapContext, PlacesContext } from "../context";
import { MAP_CONFIG } from "../constants/map.constants";

export const BtnMyLocation = memo(() => {
  const { map, isMapReady } = useContext(MapContext);
  const { userLocation } = useContext(PlacesContext);

  const onClick = useCallback(() => {
    if (!isMapReady || !userLocation || !map) return;

    map.flyTo({
      zoom: MAP_CONFIG.FLY_TO_ZOOM,
      center: userLocation,
    });
  }, [isMapReady, userLocation, map]);

  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 999,
      }}
      className="btn btn-primary"
    >
      Mi ubicación
    </button>
  );
});

BtnMyLocation.displayName = 'BtnMyLocation';
