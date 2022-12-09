import { Map } from "mapbox-gl";
import { useContext, useRef, useLayoutEffect } from "react";
import { PlacesContext, MapContext } from "../context";
import { Loading } from "./";

export const MapView = () => {
  const { isLoading, userLocation } = useContext(PlacesContext);
  const { setMap } = useContext(MapContext);
  const mapDiv = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isLoading) {
      const map = new Map({
        container: mapDiv.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation,
        zoom: 14,
      });
      setMap(map);
    }
  }, [isLoading]);

  if (isLoading) {
    return <Loading />;
  }
  return <div ref={mapDiv} className="loaded-map col col-md-8"></div>;
};
