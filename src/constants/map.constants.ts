export const MAP_CONFIG = {
  STYLE: 'mapbox://styles/mapbox/satellite-v9',
  DEFAULT_ZOOM: 12,
  FLY_TO_ZOOM: 14,
  POLYGON_FIT_PADDING: 50,
  COLLECT_RESOURCE_TIMING: false,
} as const;

export const MAP_CONTROLS = {
  NAVIGATION: {
    position: 'top-left' as const,
  },
  DRAW: {
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: false,
    },
  },
} as const;

export const DEFAULT_LOCATION: [number, number] = [-99.1332, 19.4326]; // Ciudad de México
