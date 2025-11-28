import { useEffect, useContext } from "react";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MapContext } from "../context";
import { usePolygonsStore } from "../stores/usePolygonsStore";
import { usePolygonSelection } from "../hooks/usePolygonSelection";
import { usePolygonOperations } from "../hooks/usePolygonOperations";
import { usePolygonViewport } from "../hooks/usePolygonViewport";
import { usePolygonMapEvents } from "../hooks/usePolygonMapEvents";
import { PolygonListItem } from "./PolygonList/PolygonListItem";
import Add from "../images/hospital.svg?react";

export const Polygons = () => {
  const { polygons } = usePolygonsStore();
  const { draw } = useContext(MapContext);
  const { activePolygon, selectPolygon, selectPolygonFromMap } = usePolygonSelection();
  const { createPolygon, deletePolygon } = usePolygonOperations();
  const { centerPolygon } = usePolygonViewport();

  const handleDrawCreate = async (e: MapboxDraw.DrawCreateEvent) => {
    const newPolygon = e.features[0] as GeoJSON.Feature<GeoJSON.Polygon>;
    
    try {
      const createdPolygon = await createPolygon(newPolygon);
      
      // Seleccionar y centrar el polígono recién creado
      if (createdPolygon) {
        const polygons = usePolygonsStore.getState().polygons;
        const index = polygons.features.findIndex(p => p.id === createdPolygon.id);
        
        if (index !== -1) {
          selectPolygon(createdPolygon, index);
          centerPolygon(createdPolygon);
        }
      }
    } catch (error) {
      console.error("Error creating polygon:", error);
    }
  };

  usePolygonMapEvents(selectPolygonFromMap, handleDrawCreate);

  useEffect(() => {
    if (activePolygon?.feature) {
      centerPolygon(activePolygon.feature);
    }
  }, [activePolygon, centerPolygon]);

  return (
    <>
      <ul className="list-unstyled list-group mh-100 polygons-list-container polygons-list">
        <li
          onClick={() => draw?.changeMode("draw_polygon")}
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
        {polygons?.features.length ? (
          polygons.features.map((polygon, index) => (
            <PolygonListItem
              key={polygon.id as string}
              polygon={polygon}
              index={index}
              isActive={activePolygon?.polygonId === polygon.id}
              onSelect={() => selectPolygon(polygon, index)}
              onDelete={() => deletePolygon(polygon, index)}
            />
          ))
        ) : (
          <li className="text-center py-5">Add your first Polygon!</li>
        )}
      </ul>
    </>
  );
};
