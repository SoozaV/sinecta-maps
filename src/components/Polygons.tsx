import { useContext, useLayoutEffect } from "react";
import { MapContext } from "../context";
import { PolygonsContext } from "../context/polygons/PolygonsContext";

import { polygon, bbox } from "turf";

import { ReactComponent as Marker } from "../images/marker.svg";
import { ReactComponent as Trash } from "../images/waste-basket.svg";
import { ReactComponent as Add } from "../images/hospital.svg";
import { LngLatBoundsLike } from "mapbox-gl";

const polygonsData = require("../../src/polygons.json");
const featureCollection = polygonsData as GeoJSON.FeatureCollection;
const firstPolygons = featureCollection.features.map((feature) => feature);

export const Polygons = () => {
  const { map, isMapReady, draw } = useContext(MapContext);
  const {
    polygons,
    loadFirstPolygons,
    updatePolygonsArray,
    deletePolygonFromArray,
  } = useContext(PolygonsContext);

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

  const centerPolygonOnMap = (polygonId: any) => {
    let selectedPolygon = draw!.get(polygonId) as GeoJSON.Feature;
    if (selectedPolygon) {
      let coords = JSON.parse(JSON.stringify(selectedPolygon.geometry));
      coords = coords.coordinates;

      selectedPolygon = polygon(coords);
      const polygonBbox = bbox(selectedPolygon) as LngLatBoundsLike;

      map?.fitBounds(polygonBbox, { padding: 50 });
    }
  };

  const deletePolygon = (polygon: GeoJSON.Feature, index: number) => {
    const polygonId = polygon.id as string;
    deletePolygonFromArray(polygon, index);
    draw!.delete(polygonId);
  };

  return (
    <ul className="list-unstyled list-group polygons-list h-100 overflow-hidden">
      <li
        onClick={() => draw!.changeMode("draw_polygon")}
        className="list-group-item list-group-item-action d-flex justify-content-left align-items-center sticky-top"
      >
        <div>
          <div
            style={{
              borderRadius: "50px",
              border: "none",
              outline: "none",
              backgroundColor: "rgb(0, 131, 59)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "21px",
              width: "21px",
            }}
          >
            <Add fill="#dad8d8" />
          </div>
        </div>
        <div
          className="px-3 d-flex align-items-baseline"
          style={{ gap: "0.5rem" }}
        >
          <h3 className="h5 mb-0">New Field</h3>
          <p className="mb-0" style={{ fontSize: "13px", color: "#979797" }}>
            Please draw your polygon first.
          </p>
        </div>
      </li>
      {polygons &&
        polygons.features.map((polygon, index) => (
          <li
            onClick={() => centerPolygonOnMap(polygon.id)}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            key={index}
          >
            <div>
              <Marker fill="#9857ff" />
            </div>
            <div className="px-3" style={{ flex: 1, minWidth: 0 }}>
              {/*<div style={{ fontSize: "11px", color: "#979797" }}>ID: {polygon.id}</div>*/}
              <div>Título</div>
              <div className="text-truncate">
                {polygon.properties?.place_name}
              </div>
              <div
                className="font-weight-bold"
                style={{ fontSize: "12px", color: "#575757" }}
              >
                Area: {`${polygon.properties?.area}m²`}
              </div>
            </div>
            <div>
              <button
                onClick={() => deletePolygon(polygon, index)}
                className="delete-polygon"
              >
                <Trash fill="#333" />
              </button>
            </div>
          </li>
        ))}
    </ul>
  );
};
