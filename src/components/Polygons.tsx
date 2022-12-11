import { useContext, useLayoutEffect, useState, useRef } from "react";
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
  const listRef = useRef<HTMLUListElement>(null);
  const listItemRef = useRef<HTMLLIElement[]>([]);

  const [activePolygon, setActivePolygon] = useState({
    polygonId: "",
    index: 0,
  });
  const { map, isMapReady, draw } = useContext(MapContext);
  const {
    polygons,
    loadFirstPolygons,
    updatePolygonsArray,
    deletePolygonFromArray,
  } = useContext(PolygonsContext);

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

  const getListElementIndex = (itemId: string): number => {
    if (listRef.current) {
      const currentListElement = listRef.current?.children.namedItem(itemId);
      if (currentListElement) {
        const index = currentListElement?.getAttribute("data-key");
        return Number(index);
      }
    }
    return listItemRef.current.length;
  };

  // FIX: Scroll to bottom when new polygon is created not working
  const scrollToListElement = (index: number) => {
    if (listRef.current && listItemRef.current.length) {
      listRef.current.scrollTo({
        behavior: "smooth",
        top: listItemRef.current[0].getBoundingClientRect().height * index,
      });
    }
  };

  const deletePolygon = (polygon: GeoJSON.Feature, index: number) => {
    const polygonId = polygon.id as string;
    deletePolygonFromArray(polygon, index);
    draw!.delete(polygonId);
  };

  useLayoutEffect(() => {
    map?.on("load", () => {
      if (isMapReady && draw) {
        draw.set(polygonsData as GeoJSON.FeatureCollection);
        loadFirstPolygons(firstPolygons);

        map
          .on("click", () => {
            const selectedPolygon = draw?.getSelectedIds()[0];
            if (selectedPolygon) {
              centerPolygonOnMap(selectedPolygon);
              setActivePolygon({
                index: getListElementIndex(selectedPolygon),
                polygonId: selectedPolygon,
              });
              scrollToListElement(getListElementIndex(selectedPolygon));
            }
          })
          .on("draw.create", (e) => {
            const newPolygon = e.features[0] as GeoJSON.Feature;
            updatePolygonsArray(newPolygon);
            scrollToListElement(getListElementIndex(newPolygon.id as string));
          });
      }
    });
  }, [isMapReady, listRef, polygons]);

  return (
    <ul
      ref={listRef}
      className="list-unstyled list-group mh-100 polygons-list-container polygons-list"
    >
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
            ref={(el) => (listItemRef.current[index] = el as HTMLLIElement)}
            onClick={() => {
              setActivePolygon({ polygonId: polygon.id as string, index });
              centerPolygonOnMap(polygon.id);
            }}
            className={`${
              activePolygon.polygonId === polygon.id ? "active" : ""
            } list-group-item list-group-item-action d-flex justify-content-between align-items-center`}
            key={index}
            data-key={index}
            id={polygon.id as string}
          >
            <div>
              <Marker className="marker-icon" fill="#9857ff" />
            </div>
            <div className="px-3" style={{ flex: 1, minWidth: 0 }}>
              <div>Título</div>
              <div className="text-truncate">
                {polygon.properties?.place_name}
              </div>
              <div
                className="font-weight-bold"
                style={{ fontSize: "12px", color: "#575757" }}
              >
                Area:{" "}
                {`${polygon.properties?.area.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}m²`}
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
