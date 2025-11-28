import { Map } from "mapbox-gl";
import { useContext, useRef, useLayoutEffect, memo } from "react";
import { PlacesContext, MapContext } from "../context";
import { Loading } from "./";
import { MAP_CONFIG } from "../constants/map.constants";

export const MapView = memo(() => {
  const { isLoading, userLocation } = useContext(PlacesContext);
  const { setMap } = useContext(MapContext);
  const mapDiv = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useLayoutEffect(() => {
    // Only initialize map once when loading finishes
    if (isLoading || initialized.current) return;
    if (!mapDiv.current) return;

    const map = new Map({
      container: mapDiv.current,
      style: MAP_CONFIG.STYLE,
      center: userLocation,
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      collectResourceTiming: MAP_CONFIG.COLLECT_RESOURCE_TIMING,
    });

    setMap(map);
    initialized.current = true;

    // Cleanup: destroy map on unmount
    return () => {
      try {
        map.remove();
      } catch {
        // Ignore errors during cleanup
      }
    };
  }, [isLoading, setMap, userLocation]);

  if (isLoading) {
    return <Loading />;
  }
  return <div ref={mapDiv} className="" style={{position: "absolute", top: 0, bottom: 0, width: "100%"}}></div>;
});

MapView.displayName = 'MapView';
