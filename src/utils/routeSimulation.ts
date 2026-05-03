export type LngLatTuple = [number, number];

export const routeWalkingWaypoints: Record<string, LngLatTuple[]> = {
  "central-park-loop": [
    [-73.9857, 40.7484],
    [-73.9847, 40.7522],
    [-73.9835, 40.7564],
    [-73.9823, 40.7604],
    [-73.981, 40.7644],
    [-73.9797, 40.7685],
    [-73.9784, 40.7726],
    [-73.9772, 40.7766]
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
    [2.1744, 41.4036],
    [2.1761, 41.4044],
    [2.1779, 41.4035],
    [2.1774, 41.4018],
    [2.1754, 41.4011],
    [2.1732, 41.4018],
    [2.1725, 41.4034],
    [2.1744, 41.4036]
  ],
  "london-landmark-route": [
    [-0.1246, 51.5007],
    [-0.1188, 51.5016],
    [-0.1124, 51.5028],
    [-0.1064, 51.5042],
    [-0.0993, 51.5054],
    [-0.0918, 51.5064],
    [-0.0843, 51.5069],
    [-0.0783, 51.5065],
    [-0.0754, 51.5055]
  ],
  "paris-eiffel-route": [
    [2.2912, 48.8597],
    [2.2928, 48.8588],
    [2.2945, 48.8584],
    [2.2965, 48.8589],
    [2.2976, 48.8601],
    [2.2958, 48.8612],
    [2.2932, 48.861],
    [2.2912, 48.8597]
  ],
  "cairo-pyramid-route": [
    [31.1304, 29.9808],
    [31.1321, 29.982],
    [31.1345, 29.9811],
    [31.1361, 29.9792],
    [31.1352, 29.977],
    [31.1326, 29.9764],
    [31.1308, 29.9781],
    [31.1304, 29.9808]
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
  ],
  "seoul-heritage-route": [
    [126.9746, 37.5802],
    [126.9769, 37.5796],
    [126.9791, 37.5786],
    [126.9802, 37.5766],
    [126.9783, 37.5749],
    [126.9754, 37.5752],
    [126.9738, 37.5774],
    [126.9746, 37.5802]
  ],
  "california-discovery-route": [
    [-122.009, 37.3349],
    [-122.0124, 37.3358],
    [-122.0144, 37.3333],
    [-122.0122, 37.331],
    [-122.0085, 37.3304],
    [-122.0059, 37.3324],
    [-122.0065, 37.335],
    [-122.009, 37.3349]
  ],
  "taipei-skyline-route": [
    [121.5654, 25.0339],
    [121.5672, 25.0323],
    [121.5688, 25.0304],
    [121.5706, 25.0277],
    [121.5731, 25.0257],
    [121.5754, 25.0239],
    [121.573, 25.0228],
    [121.5701, 25.0246],
    [121.5675, 25.0275],
    [121.5654, 25.0339]
  ],
  "sydney-harbor-route": [
    [151.2153, -33.8568],
    [151.213, -33.8552],
    [151.211, -33.8528],
    [151.2095, -33.8503],
    [151.2114, -33.8485],
    [151.2142, -33.8502],
    [151.2164, -33.8534],
    [151.2153, -33.8568]
  ],
  "bangkok-floating-route": [
    [100.4913, 13.7515],
    [100.4932, 13.7522],
    [100.4951, 13.7534],
    [100.4973, 13.7548],
    [100.496, 13.7567],
    [100.4934, 13.7555],
    [100.4913, 13.7515]
  ],
  "rome-heritage-route": [
    [12.4922, 41.8902],
    [12.4936, 41.8909],
    [12.4935, 41.8924],
    [12.4916, 41.893],
    [12.4895, 41.8921],
    [12.4896, 41.8906],
    [12.4922, 41.8902]
  ]
};

const routeDurationMultipliers: Record<string, number> = {
  "california-discovery-route": 1.4,
  "london-landmark-route": 1.65,
  "seoul-heritage-route": 1.35,
  "sydney-harbor-route": 1.3
};

export const getRunSimulationDurationSeconds = (distanceKm: number, routeId?: string) => {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return 6;
  }

  const baseDuration = Math.min(18, Math.max(6, 5 + distanceKm * 0.95));
  const multiplier = routeId ? routeDurationMultipliers[routeId] ?? 1 : 1;
  const maxDuration =
    routeId === "london-landmark-route"
      ? 30
      : routeId === "seoul-heritage-route"
        ? 24
        : routeId === "sydney-harbor-route"
          ? 24
          : routeId === "california-discovery-route"
            ? 25
            : 18;

  return Math.min(maxDuration, Math.max(6, baseDuration * multiplier));
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
  const walkingWaypoints = routeWalkingWaypoints[routeId];
  if (walkingWaypoints && walkingWaypoints.length >= 2) {
    return walkingWaypoints;
  }

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
