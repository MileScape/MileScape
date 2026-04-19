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
    zoom: 13.1,
    pitch: 63,
    bearing: -34,
    marker: [-9.1287, 38.7124]
  },
  "seoul-river-route": {
    center: [126.9976, 37.5283],
    zoom: 12.4,
    pitch: 64,
    bearing: -20,
    marker: [126.9958, 37.5286]
  },
  "manhattan-landmark-route": {
    center: [-73.9854, 40.758],
    zoom: 12.1,
    pitch: 67,
    bearing: 22,
    marker: [-73.9851, 40.7587]
  },
  "paris-eiffel-route": {
    center: [2.2945, 48.8584],
    zoom: 12.1,
    pitch: 66,
    bearing: -16,
    marker: [2.2945, 48.8584]
  },
  "mount-fuji-route": {
    center: [138.7274, 35.3606],
    zoom: 10.8,
    pitch: 68,
    bearing: 8,
    marker: [138.7274, 35.3606]
  },
  "aurora-harbor-route": {
    center: [-21.9382, 64.1466],
    zoom: 11.8,
    pitch: 62,
    bearing: -12,
    marker: [-21.9426, 64.1487]
  },
  "midnight-river-route": {
    center: [103.852, 1.2897],
    zoom: 12.8,
    pitch: 66,
    bearing: 20,
    marker: [103.8545, 1.2903]
  }
};
