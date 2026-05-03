export interface RouteMapView {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  marker?: [number, number];
}

export const routeMapViews: Record<string, RouteMapView> = {
  "central-park-loop": {
    center: [-73.9851, 40.7482],
    zoom: 14.35,
    pitch: 64,
    bearing: 28,
    marker: [-73.9857, 40.7484]
  },
  "tokyo-city-route": {
    center: [139.7442, 35.6585],
    zoom: 14.05,
    pitch: 72,
    bearing: -18,
    marker: [139.7454, 35.6581]
  },
  "barcelona-coast-route": {
    center: [2.1708, 41.3994],
    zoom: 14.55,
    pitch: 66,
    bearing: -28,
    marker: [2.1744, 41.4036]
  },
  "london-landmark-route": {
    center: [-0.1015, 51.506],
    zoom: 13.55,
    pitch: 68,
    bearing: 64,
    marker: [-0.1246, 51.5007]
  },
  "paris-eiffel-route": {
    center: [2.2922, 48.8589],
    zoom: 14.55,
    pitch: 64,
    bearing: 34,
    marker: [2.2945, 48.8584]
  },
  "cairo-pyramid-route": {
    center: [31.1328, 29.9794],
    zoom: 14.35,
    pitch: 62,
    bearing: 32,
    marker: [31.1342, 29.9792]
  },
  "seoul-heritage-route": {
    center: [126.9768, 37.5784],
    zoom: 14.35,
    pitch: 64,
    bearing: -10,
    marker: [126.9769, 37.5796]
  },
  "sydney-harbor-route": {
    center: [151.2141, -33.8574],
    zoom: 14.45,
    pitch: 64,
    bearing: -38,
    marker: [151.2153, -33.8568]
  },
  "rome-heritage-route": {
    center: [12.4901, 41.8918],
    zoom: 14.05,
    pitch: 72,
    bearing: -14,
    marker: [12.4922, 41.8902]
  },
  "california-discovery-route": {
    center: [-122.0099, 37.3346],
    zoom: 14.35,
    pitch: 64,
    bearing: -32,
    marker: [-122.009, 37.3349]
  },
  "taipei-skyline-route": {
    center: [121.568, 25.0308],
    zoom: 13.75,
    pitch: 64,
    bearing: -28,
    marker: [121.5654, 25.0339]
  },
  "bangkok-floating-route": {
    center: [100.4936, 13.7529],
    zoom: 14.15,
    pitch: 64,
    bearing: -32,
    marker: [100.4913, 13.7515]
  }
};
