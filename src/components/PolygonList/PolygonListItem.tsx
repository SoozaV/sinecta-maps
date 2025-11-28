import { memo, useMemo } from "react";
import Marker from "../../images/marker.svg?react";
import Trash from "../../images/waste-basket.svg?react";
import { calculatePolygonPerimeter, getVertexCount, formatArea, formatDistance } from "../../utils/polygon.utils";

interface PolygonListItemProps {
  polygon: GeoJSON.Feature;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const PolygonListItem = memo(({ polygon, index, isActive, onSelect, onDelete }: PolygonListItemProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const metrics = useMemo(() => {
    const area = polygon.properties?.area || 0;
    const perimeter = calculatePolygonPerimeter(polygon as GeoJSON.Feature<GeoJSON.Polygon>);
    const vertexCount = getVertexCount(polygon as GeoJSON.Feature<GeoJSON.Polygon>);
    
    return {
      area: formatArea(area),
      perimeter: formatDistance(perimeter),
      vertexCount,
    };
  }, [polygon]);

  return (
    <li
      onClick={onSelect}
      className={`${isActive ? "active" : ""} list-group-item list-group-item-action d-flex justify-content-between align-items-center`}
      data-index={index}
      id={polygon.id as string}
    >
      <div>
        <Marker className="marker-icon" fill="#9857ff" />
      </div>
      <div className="px-3" style={{ flex: 1, minWidth: 0 }}>
        <div>{polygon.properties?.name}</div>
        <div className="text-truncate">{polygon.properties?.place_name}</div>
        <div className="polygon-metrics" style={{ fontSize: "12px", color: "#575757", display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
          <span className="font-weight-bold">📐 Área: {metrics.area}</span>
          <span>📏 Perímetro: {metrics.perimeter}</span>
          <span>📍 Vértices: {metrics.vertexCount}</span>
        </div>
      </div>
      <div>
        <button onClick={handleDelete} className="delete-polygon">
          <Trash fill="#333" />
        </button>
      </div>
    </li>
  );
});

PolygonListItem.displayName = 'PolygonListItem';
