import { memo } from "react";
import Marker from "../../images/marker.svg?react";
import Trash from "../../images/waste-basket.svg?react";

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
        <div className="font-weight-bold" style={{ fontSize: "12px", color: "#575757" }}>
          Area: {polygon.properties?.area.toLocaleString(undefined, { maximumFractionDigits: 2 })}m²
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
