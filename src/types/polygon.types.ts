export interface PolygonProperties {
  id?: string;
  name?: string;
  area?: number;
  place_name?: string;
  [key: string]: any;
}

export interface PolygonFeature extends GeoJSON.Feature<GeoJSON.Polygon> {
  properties: PolygonProperties;
}

export interface ActivePolygon {
  feature: PolygonFeature;
  polygonId: string;
  index: number;
}

export interface PolygonApiResponse {
  status: boolean;
  message: string;
  data: PolygonFeature;
}
