export interface RouteMapView {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  marker?: [number, number];
}

export const routeMapViews: Record<string, RouteMapView> = {
  "west-lake-loop": {
    center: [120.1447, 30.2431],
    zoom: 13.1,
    pitch: 76,
    bearing: -36,
    marker: [120.1503, 30.2486]
  },
  "central-park-loop": {
    center: [-73.9665, 40.7813],
    zoom: 13.7,
    pitch: 78,
    bearing: 29,
    marker: [-73.9681, 40.7818]
  },
  "tokyo-city-route": {
    center: [139.7437, 35.6586],
    zoom: 13.2,
    pitch: 77,
    bearing: -24,
    marker: [139.7454, 35.6581]
  },
  "lisbon-tram-route": {
    center: [-9.1303, 38.7111],
    zoom: 13.45,
    pitch: 76,
    bearing: -34,
    marker: [-9.1287, 38.7124]
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
    zoom: 12.85,
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
  "mount-fuji-route": {
    center: [138.7274, 35.3606],
    zoom: 11.55,
    pitch: 76,
    bearing: 8,
    marker: [138.7274, 35.3606]
  },
  "aurora-harbor-route": {
    center: [-21.9382, 64.1466],
    zoom: 12.55,
    pitch: 75,
    bearing: -12,
    marker: [-21.9426, 64.1487]
  },
  "melbourne-laneway-route": {
    center: [144.9631, -37.8136],
    zoom: 12.95,
    pitch: 76,
    bearing: -18,
    marker: [144.9671, -37.8183]
  }
};
