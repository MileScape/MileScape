export type LngLatTuple = [number, number];

export const routeWalkingWaypoints: Record<string, LngLatTuple[]> = {
  "central-park-loop": [
    [-73.9708, 40.7817],
    [-73.9685, 40.7894],
    [-73.965, 40.795],
    [-73.9588, 40.7954],
    [-73.9548, 40.7897],
    [-73.9548, 40.7824],
    [-73.9594, 40.7774],
    [-73.9659, 40.777],
    [-73.9708, 40.7817]
  ],
  "west-lake-loop": [
    [120.1532, 30.2236],
    [120.1413, 30.2288],
    [120.1337, 30.2399],
    [120.1325, 30.2529],
    [120.1379, 30.2642],
    [120.1481, 30.2708],
    [120.1609, 30.2723],
    [120.1734, 30.2688],
    [120.1823, 30.2605],
    [120.1865, 30.249],
    [120.1842, 30.2374],
    [120.1763, 30.228],
    [120.1652, 30.2235],
    [120.1532, 30.2236]
  ],
  "tokyo-city-route": [
    [139.7379, 35.6554],
    [139.7408, 35.6611],
    [139.7468, 35.6636],
    [139.7527, 35.6612],
    [139.7551, 35.6561],
    [139.7521, 35.6512],
    [139.7462, 35.6491],
    [139.7404, 35.6508],
    [139.7379, 35.6554]
  ],
  "lisbon-tram-route": [
    [-9.1427, 38.7139],
    [-9.1385, 38.7116],
    [-9.1342, 38.7104],
    [-9.1302, 38.7121],
    [-9.1267, 38.7147],
    [-9.1227, 38.7132],
    [-9.1194, 38.7104],
    [-9.1246, 38.7087],
    [-9.1316, 38.7083],
    [-9.1379, 38.7105],
    [-9.1427, 38.7139]
  ],
  "barcelona-coast-route": [
    [2.1536, 41.4036],
    [2.1662, 41.4037],
    [2.1744, 41.4036],
    [2.1836, 41.3926],
    [2.1912, 41.3811],
    [2.1962, 41.3745],
    [2.1894, 41.3695],
    [2.1763, 41.3767],
    [2.1653, 41.3862],
    [2.1536, 41.4036]
  ],
  "london-landmark-route": [
    [-0.1419, 51.5014],
    [-0.1246, 51.5007],
    [-0.1195, 51.5033],
    [-0.0877, 51.5079],
    [-0.0754, 51.5055],
    [-0.0805, 51.5116],
    [-0.1025, 51.5128],
    [-0.1236, 51.5104],
    [-0.1419, 51.5014]
  ],
  "paris-eiffel-route": [
    [2.2865, 48.8625],
    [2.2945, 48.8584],
    [2.3022, 48.8608],
    [2.3126, 48.8639],
    [2.3212, 48.8606],
    [2.3261, 48.8544],
    [2.3164, 48.8494],
    [2.3012, 48.8485],
    [2.2899, 48.8537],
    [2.2865, 48.8625]
  ],
  "mount-fuji-route": [
    [138.7191, 35.5038],
    [138.7279, 35.5071],
    [138.7394, 35.5076],
    [138.7498, 35.5046],
    [138.7593, 35.4982],
    [138.7646, 35.4896],
    [138.7594, 35.4812],
    [138.7487, 35.4761],
    [138.7364, 35.4763],
    [138.7256, 35.4817],
    [138.7193, 35.4912],
    [138.7191, 35.5038]
  ],
  "aurora-harbor-route": [
    [-21.9577, 64.1463],
    [-21.9514, 64.1495],
    [-21.9431, 64.1515],
    [-21.9322, 64.1512],
    [-21.9238, 64.1482],
    [-21.9206, 64.1439],
    [-21.9288, 64.1408],
    [-21.9405, 64.1402],
    [-21.9521, 64.1425],
    [-21.9577, 64.1463]
  ],
  "melbourne-laneway-route": [
    [144.9577, -37.8183],
    [144.9631, -37.8175],
    [144.9671, -37.8183],
    [144.9711, -37.8136],
    [144.9791, -37.8117],
    [144.9821, -37.8191],
    [144.9732, -37.8236],
    [144.9625, -37.8239],
    [144.9577, -37.8183]
  ]
};

export const getRunSimulationDurationSeconds = (distanceKm: number) => {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return 6;
  }

  return Math.min(18, Math.max(6, 5 + distanceKm * 0.95));
};

export const getSimulationProgressTarget = (distanceKm: number, routeDistanceKm: number) => {
  if (
    !Number.isFinite(distanceKm) ||
    !Number.isFinite(routeDistanceKm) ||
    distanceKm <= 0 ||
    routeDistanceKm <= 0
  ) {
    return 0;
  }

  return Math.min(distanceKm / routeDistanceKm, 1);
};

export const buildSimulationFeatureCollection = (
  coordinates: LngLatTuple[],
  progress = 0
) => ({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { kind: "ghost" },
      geometry: {
        type: "LineString",
        coordinates
      }
    },
    {
      type: "Feature",
      properties: { kind: "active" },
      geometry: {
        type: "LineString",
        coordinates: coordinates.length > 0 ? buildActivePath(coordinates, progress) : []
      }
    }
  ]
});

const offsetsToCoordinates = (anchor: LngLatTuple, offsets: LngLatTuple[]): LngLatTuple[] =>
  offsets.map(([lngOffset, latOffset]) => [anchor[0] + lngOffset, anchor[1] + latOffset]);

const buildRouteSpecificSimulationPath = (
  routeId: string,
  anchor: LngLatTuple
): LngLatTuple[] | null => {
  switch (routeId) {
    case "central-park-loop":
      return offsetsToCoordinates(anchor, [
        [-0.0065, -0.001],
        [-0.0055, 0.0065],
        [-0.003, 0.0125],
        [0.0015, 0.016],
        [0.006, 0.0135],
        [0.008, 0.007],
        [0.008, -0.001],
        [0.0055, -0.0075],
        [0.001, -0.0115],
        [-0.0035, -0.009],
        [-0.006, -0.004],
        [-0.0065, -0.001]
      ]);
    case "west-lake-loop":
      return offsetsToCoordinates(anchor, [
        [0.001, -0.024],
        [-0.010, -0.019],
        [-0.017, -0.010],
        [-0.019, 0.001],
        [-0.015, 0.012],
        [-0.008, 0.020],
        [0.002, 0.024],
        [0.013, 0.022],
        [0.022, 0.014],
        [0.026, 0.002],
        [0.023, -0.010],
        [0.016, -0.019],
        [0.006, -0.024],
        [0.001, -0.024]
      ]);
    case "tokyo-city-route":
      return offsetsToCoordinates(anchor, [
        [-0.006, -0.0025],
        [-0.004, 0.0035],
        [0.0005, 0.0065],
        [0.0055, 0.005],
        [0.008, 0.0005],
        [0.006, -0.0045],
        [0.0015, -0.007],
        [-0.0035, -0.0055],
        [-0.006, -0.0025]
      ]);
    case "lisbon-tram-route":
      return offsetsToCoordinates(anchor, [
        [-0.014, 0.0015],
        [-0.010, -0.0008],
        [-0.0055, -0.002],
        [-0.0015, -0.0002],
        [0.002, 0.0023],
        [0.006, 0.0008],
        [0.0092, -0.002],
        [0.004, -0.0038],
        [-0.003, -0.0042],
        [-0.0092, -0.002],
        [-0.014, 0.0015]
      ]);
    case "barcelona-coast-route":
      return offsetsToCoordinates(anchor, [
        [-0.0208, 0],
        [-0.0082, 0.0001],
        [0, 0],
        [0.0092, -0.011],
        [0.0168, -0.0225],
        [0.0218, -0.0291],
        [0.015, -0.0341],
        [0.0019, -0.0269],
        [-0.0091, -0.0174],
        [-0.0208, 0]
      ]);
    case "london-landmark-route":
      return offsetsToCoordinates(anchor, [
        [-0.0665, -0.0041],
        [-0.0492, -0.0048],
        [-0.0441, -0.0022],
        [-0.0123, 0.0024],
        [0, 0],
        [-0.0051, 0.0061],
        [-0.0271, 0.0073],
        [-0.0482, 0.0049],
        [-0.0665, -0.0041]
      ]);
    case "paris-eiffel-route":
      return offsetsToCoordinates(anchor, [
        [-0.008, 0.0041],
        [0, 0],
        [0.0077, 0.0024],
        [0.0181, 0.0055],
        [0.0267, 0.0022],
        [0.0316, -0.004],
        [0.0219, -0.009],
        [0.0067, -0.0099],
        [-0.0046, -0.0047],
        [-0.008, 0.0041]
      ]);
    case "mount-fuji-route":
      return offsetsToCoordinates(anchor, [
        [-0.0255, 0.0117],
        [-0.0167, 0.015],
        [-0.0052, 0.0155],
        [0.0052, 0.0125],
        [0.0147, 0.0061],
        [0.02, -0.0025],
        [0.0148, -0.0109],
        [0.0041, -0.016],
        [-0.0082, -0.0158],
        [-0.019, -0.0104],
        [-0.0253, -0.0009],
        [-0.0255, 0.0117]
      ]);
    case "aurora-harbor-route":
      return offsetsToCoordinates(anchor, [
        [-0.0151, -0.0024],
        [-0.0088, 0.0008],
        [-0.0005, 0.0028],
        [0.0104, 0.0025],
        [0.0188, -0.0005],
        [0.022, -0.0048],
        [0.0138, -0.0079],
        [0.0021, -0.0085],
        [-0.0095, -0.0062],
        [-0.0151, -0.0024]
      ]);
    case "melbourne-laneway-route":
      return offsetsToCoordinates(anchor, [
        [-0.0094, 0],
        [-0.004, 0.0008],
        [0, 0],
        [0.004, 0.0047],
        [0.012, 0.0066],
        [0.015, -0.0008],
        [0.0061, -0.0053],
        [-0.0046, -0.0056],
        [-0.0094, 0]
      ]);
    default:
      return null;
  }
};

export const buildSimulationPath = (
  routeId: string,
  center: LngLatTuple,
  marker?: LngLatTuple
) => {
  const anchor = marker ?? center;
  const routeSpecificPath = buildRouteSpecificSimulationPath(routeId, anchor);

  if (routeSpecificPath) {
    return routeSpecificPath;
  }

  const seed = Array.from(routeId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const lngRadius = 0.0065 + (seed % 5) * 0.0013;
  const latRadius = 0.0045 + (seed % 7) * 0.001;
  const angleOffset = ((seed % 360) * Math.PI) / 180;
  const coordinates: LngLatTuple[] = [];

  for (let index = 0; index <= 72; index += 1) {
    const progress = index / 72;
    const angle = angleOffset + progress * Math.PI * 2;
    const harmonic = Math.sin(progress * Math.PI * 4 + angleOffset) * 0.18;
    const lng = anchor[0] + Math.cos(angle) * lngRadius * (1 + harmonic);
    const lat = anchor[1] + Math.sin(angle) * latRadius * (1 - harmonic * 0.45);
    coordinates.push([lng, lat]);
  }

  return coordinates;
};

export const getProgressCoordinate = (
  coordinates: LngLatTuple[],
  progress: number
): LngLatTuple => {
  if (coordinates.length === 0) {
    return [0, 0];
  }

  if (coordinates.length === 1) {
    return coordinates[0];
  }

  const clamped = Math.min(Math.max(progress, 0), 1);
  const scaledIndex = clamped * (coordinates.length - 1);
  const startIndex = Math.floor(scaledIndex);
  const endIndex = Math.min(startIndex + 1, coordinates.length - 1);
  const localProgress = scaledIndex - startIndex;
  const start = coordinates[startIndex];
  const end = coordinates[endIndex];

  return [
    start[0] + (end[0] - start[0]) * localProgress,
    start[1] + (end[1] - start[1]) * localProgress
  ];
};

export const buildActivePath = (coordinates: LngLatTuple[], progress: number): LngLatTuple[] => {
  if (coordinates.length === 0) {
    return [];
  }

  const clamped = Math.min(Math.max(progress, 0), 1);
  const scaledIndex = clamped * (coordinates.length - 1);
  const fullPoints = coordinates.slice(0, Math.floor(scaledIndex) + 1);
  const currentPoint = getProgressCoordinate(coordinates, clamped);
  const lastPoint = fullPoints[fullPoints.length - 1];

  if (!lastPoint || lastPoint[0] !== currentPoint[0] || lastPoint[1] !== currentPoint[1]) {
    fullPoints.push(currentPoint);
  }

  return fullPoints;
};
