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
        style: "mapbox://styles/mapbox/satellite-v9",
        center: userLocation,
        zoom: 12,
      });
      setMap(map);
    }
  }, [isLoading]);

  if (isLoading) {
    return <Loading />;
  }
  return <div ref={mapDiv} className="" style={{position: "absolute", top: 0, bottom: 0, width: "100%"}}></div>;
};
