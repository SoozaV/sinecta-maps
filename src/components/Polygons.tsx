import {
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
  useRef,
} from "react";
import { MapContext } from "../context";
import { PolygonsContext } from "../context/polygons/PolygonsContext";

import { polygon, bbox } from "turf";

import { ReactComponent as Marker } from "../images/marker.svg";
import { ReactComponent as Trash } from "../images/waste-basket.svg";
import { ReactComponent as Add } from "../images/hospital.svg";
import { LngLatBoundsLike } from "mapbox-gl";
import polygonsApi from "../apis/polygonsApi";

type ActivePolygon = {
  feature?: GeoJSON.Feature;
  polygonId: string;
  index: number;
};

export const Polygons = () => {
  const listRef = useRef<HTMLUListElement>(null);
  const listItemRef = useRef<HTMLLIElement[]>([]);
  const [activePolygon, setActivePolygon] = useState<ActivePolygon>({
    feature: undefined,
    polygonId: "",
    index: 0,
  });
  const { map, isMapReady, draw } = useContext(MapContext);
  const {
    polygons,
    loadFirstPolygons,
    updatePolygonProperties,
    updatePolygonsArray,
    deletePolygonFromArray,
  } = useContext(PolygonsContext);

  const centerPolygonOnMap = () => {
    let coords = JSON.parse(JSON.stringify(activePolygon.feature?.geometry));
    coords = coords.coordinates;
    const polygonBbox = bbox(polygon(coords)) as LngLatBoundsLike;

    map?.fitBounds(polygonBbox, { padding: 50 });
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
  const scrollToListElement = () => {
    if (listRef.current && listItemRef.current.length) {
      try {
        listRef.current.scrollTo({
          behavior: "smooth",
          top:
            listItemRef.current[0].getBoundingClientRect().height *
            activePolygon.index,
        });
      } catch (error) {
        listRef.current.scrollTo({
          behavior: "smooth",
          top: 0,
        });
      }
    }
  };

  const deletePolygon = async (polygon: GeoJSON.Feature, index: number) => {
    const polygonId = polygon.id as string;
    await polygonsApi.delete(`/api/polygons/${polygonId}`);
    deletePolygonFromArray(polygon, index);
    draw!.delete(polygonId);
  };

  useEffect(() => {
    if (activePolygon.feature) {
      centerPolygonOnMap();
      scrollToListElement();
    }
  }, [activePolygon]);

  useLayoutEffect(() => {
    map?.on("load", async () => {
      try {
        await polygonsApi.get("/api/polygons").then(({ data }) => {
          const fc = data.data[0][0]
            .json_build_object as GeoJSON.FeatureCollection;
          if (!fc.features.length)
            throw new Error("Agrega tu primer polígono!");
          fc.features.map((feature) => (feature.id = feature.properties?.id));
          if (isMapReady && draw) {
            draw.set(fc);
            loadFirstPolygons(fc);
          }
        });
      } catch (error) {
        error instanceof Error
          ? console.log("Add your first Polygon!")
          : console.log(error);
      }
    });

    if (isMapReady) {
      map
        ?.on("click", () => {
          const selectedPolygonId = draw?.getSelectedIds()[0];
          const selectedPolygon = draw?.get(selectedPolygonId as string);
          const selectedPolygonIndex = getListElementIndex(
            selectedPolygon?.id as string
          );
          if (selectedPolygonId) {
            setActivePolygon({
              feature: selectedPolygon,
              index: selectedPolygonIndex,
              polygonId: selectedPolygonId,
            });
          }
        })
        .on("draw.create", async (e) => {
          let newPolygon = e.features[0] as GeoJSON.Feature<GeoJSON.Polygon>;
          newPolygon = updatePolygonProperties(newPolygon);
          await polygonsApi
            .post("/api/polygons", newPolygon)
            .then(({ data }) => {
              const newPolygon = data.data as GeoJSON.Feature<GeoJSON.Polygon>;
              updatePolygonsArray(newPolygon);
            });
        });
    }
  }, [isMapReady, listRef, polygons, map]);

  return (
    <>
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
        {polygons?.features.length ?
          polygons.features.map((polygon, index) => (
            <li
              ref={(el) => (listItemRef.current[index] = el as HTMLLIElement)}
              onClick={() => {
                setActivePolygon({
                  feature: polygon,
                  polygonId: polygon.id as string,
                  index,
                });
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
                <div>{polygon.properties?.name}</div>
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
          )) : 
          <li className="text-center py-5">Add your first Polygon!</li> }
      </ul>
    </>
  );
};
