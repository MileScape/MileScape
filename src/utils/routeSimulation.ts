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
