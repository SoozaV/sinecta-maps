import { useContext } from "react";
import { MapContext, PlacesContext } from "../context";

export const BtnMyLocation = () => {
  const { map, isMapReady } = useContext(MapContext);
  const { userLocation } = useContext(PlacesContext);

  const onClick = () => {
    if (!isMapReady) throw new Error("Map is not ready!");
    if (!userLocation) throw new Error("User location not ready!");

    map?.flyTo({
      zoom: 14,
      center: userLocation,
    });
  };

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
};
