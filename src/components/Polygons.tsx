import { useContext, useLayoutEffect } from "react";
import { MapContext } from "../context";
import { PolygonsContext } from "../context/polygons/PolygonsContext";

import { polygon, bbox } from "turf";

import { ReactComponent as Marker } from "../images/marker.svg";
import { ReactComponent as Trash } from "../images/waste-basket.svg";
import { LngLatBoundsLike } from "mapbox-gl";

const polygonsData = require("../../src/polygons.json");
const featureCollection = polygonsData as GeoJSON.FeatureCollection;
const firstPolygons = featureCollection.features.map((feature) => feature);

export const Polygons = () => {
  const { map, isMapReady, draw } = useContext(MapContext);
  const { polygons, loadFirstPolygons, updatePolygonsArray } =
    useContext(PolygonsContext);

  useLayoutEffect(() => {
    map?.on("load", () => {
      if (isMapReady) {
        loadFirstPolygons(firstPolygons);
      }
    });
    map?.on("draw.create", (e) => {
      const newPolygon = e.features[0] as GeoJSON.Feature;
      updatePolygonsArray(newPolygon);
    });
  }, [isMapReady]);

  const showMapDetails = (polygonId: any) => {
    const { geometry } = draw!.get(polygonId) as GeoJSON.Feature;
    if (geometry) {
      let coords = JSON.parse(JSON.stringify(geometry));
      coords = coords.coordinates;

      const polygonSelected = polygon(coords);
      const polygonBbox = bbox(polygonSelected) as LngLatBoundsLike;

      map?.fitBounds(polygonBbox, { padding: 50 });
    }
  };

  return (
    <ul className="list-unstyled list-group polygons-list h-100 overflow-hidden">
      {polygons &&
        polygons.features.map((polygon, index) => (
          <li
            onClick={() => showMapDetails(polygon.id)}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            key={index}
          >
            <div>
              <Marker fill="#9857ff" />
            </div>
            <div className="text-truncate px-3">{polygon.id}</div>
            <div>
              <Trash fill="#9857ff" />
            </div>
          </li>
        ))}
    </ul>
  );
};
