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
  "seoul-river-route": [
    [126.9869, 37.5237],
    [126.9921, 37.5223],
    [126.9989, 37.5225],
    [127.0058, 37.5237],
    [127.0115, 37.5264],
    [127.0102, 37.5311],
    [127.0036, 37.5334],
    [126.9964, 37.5337],
    [126.9899, 37.5312],
    [126.9869, 37.5237]
  ],
  "manhattan-landmark-route": [
    [-73.9997, 40.7411],
    [-73.9911, 40.744],
    [-73.9872, 40.7484],
    [-73.9855, 40.758],
    [-73.9819, 40.7651],
    [-73.9776, 40.7712],
    [-73.9692, 40.775],
    [-73.9632, 40.771],
    [-73.9697, 40.759],
    [-73.9795, 40.7481],
    [-73.9997, 40.7411]
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
    [138.7212, 35.3379],
    [138.7306, 35.3428],
    [138.7407, 35.3516],
    [138.7372, 35.3617],
    [138.7274, 35.3701],
    [138.7145, 35.3667],
    [138.7071, 35.3565],
    [138.7116, 35.3452],
    [138.7212, 35.3379]
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
  "midnight-river-route": [
    [103.8415, 1.2864],
    [103.8482, 1.2869],
    [103.8543, 1.2891],
    [103.8596, 1.2927],
    [103.8634, 1.2981],
    [103.8584, 1.3012],
    [103.8513, 1.2989],
    [103.8464, 1.2947],
    [103.8415, 1.2864]
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
    case "seoul-river-route":
      return offsetsToCoordinates(anchor, [
        [-0.009, -0.0048],
        [-0.0038, -0.0062],
        [0.003, -0.006],
        [0.0098, -0.0048],
        [0.0155, -0.0021],
        [0.0142, 0.0026],
        [0.0076, 0.0049],
        [0.0004, 0.0052],
        [-0.0061, 0.0027],
        [-0.009, -0.0048]
      ]);
    case "manhattan-landmark-route":
      return offsetsToCoordinates(anchor, [
        [-0.0146, -0.0176],
        [-0.006, -0.0147],
        [-0.0021, -0.0103],
        [-0.0004, -0.0007],
        [0.0032, 0.0064],
        [0.0075, 0.0125],
        [0.0159, 0.0163],
        [0.0219, 0.0123],
        [0.0154, 0.0003],
        [0.0056, -0.0106],
        [-0.0146, -0.0176]
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
        [-0.0062, -0.0227],
        [0.0032, -0.0178],
        [0.0133, -0.009],
        [0.0098, 0.0011],
        [0, 0.0095],
        [-0.0129, 0.0061],
        [-0.0203, -0.0041],
        [-0.0158, -0.0154],
        [-0.0062, -0.0227]
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
    case "midnight-river-route":
      return offsetsToCoordinates(anchor, [
        [-0.013, -0.0039],
        [-0.0063, -0.0034],
        [-0.0002, -0.0012],
        [0.0051, 0.0024],
        [0.0089, 0.0078],
        [0.0039, 0.0109],
        [-0.0032, 0.0086],
        [-0.0081, 0.0044],
        [-0.013, -0.0039]
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
