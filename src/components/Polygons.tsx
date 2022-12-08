import { useContext, useLayoutEffect } from "react";
import { MapContext } from "../context";
import { PolygonsContext } from "../context/polygons/PolygonsContext";

const polygonsData = require("../../src/polygons.json");
const featureCollection = polygonsData as GeoJSON.FeatureCollection;
const firstPolygons = featureCollection.features.map((feature) => feature);

export const Polygons = () => {
  const { map, isMapReady } = useContext(MapContext);
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

  return (
    <ul>
      {polygons &&
        polygons.features.map((polygon, index) => (
          <li key={index}>{JSON.stringify(polygon)}</li>
        ))}
    </ul>
  );
};
