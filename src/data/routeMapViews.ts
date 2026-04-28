export interface RouteMapView {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  marker?: [number, number];
}

export const routeMapViews: Record<string, RouteMapView> = {
  "central-park-loop": {
    center: [-73.9665, 40.7813],
    zoom: 12.9,
    pitch: 78,
    bearing: 29,
    marker: [-73.9857, 40.7484]
  },
  "tokyo-city-route": {
    center: [139.7437, 35.6586],
    zoom: 13.2,
    pitch: 77,
    bearing: -24,
    marker: [139.7454, 35.6581]
  },
  "barcelona-coast-route": {
    center: [2.1734, 41.3851],
    zoom: 12.95,
    pitch: 76,
    bearing: -22,
    marker: [2.1744, 41.4036]
  },
  "london-landmark-route": {
    center: [-0.1276, 51.5072],
    zoom: 12.55,
    pitch: 77,
    bearing: 18,
    marker: [-0.0754, 51.5055]
  },
  "paris-eiffel-route": {
    center: [2.2945, 48.8584],
    zoom: 12.85,
    pitch: 76,
    bearing: -16,
    marker: [2.2945, 48.8584]
  },
  "cairo-pyramid-route": {
    center: [31.1342, 29.9792],
    zoom: 11.5,
    pitch: 74,
    bearing: -18,
    marker: [31.1342, 29.9792]
  },
  "seoul-heritage-route": {
    center: [126.978, 37.5665],
    zoom: 12.6,
    pitch: 76,
    bearing: -20,
    marker: [126.9769, 37.5796]
  },
  "sydney-harbor-route": {
    center: [151.214, -33.8568],
    zoom: 12.6,
    pitch: 76,
    bearing: 24,
    marker: [151.2153, -33.8568]
  },
  "rome-heritage-route": {
    center: [12.4922, 41.8902],
    zoom: 12.7,
    pitch: 76,
    bearing: -18,
    marker: [12.4922, 41.8902]
  },
  "california-discovery-route": {
    center: [-121.9, 37.3318],
    zoom: 7.4,
    pitch: 70,
    bearing: -12,
    marker: [-122.009, 37.3349]
  },
  "taipei-skyline-route": {
    center: [121.5654, 25.033],
    zoom: 12.4,
    pitch: 76,
    bearing: -18,
    marker: [121.5654, 25.033]
  },
  "bangkok-floating-route": {
    center: [100.5018, 13.7563],
    zoom: 12.25,
    pitch: 74,
    bearing: -22,
    marker: [100.5018, 13.7563]
  }
};
