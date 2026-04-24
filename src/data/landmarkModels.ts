export interface LandmarkModelConfig {
  path: string;
  scale: number;
  rotationY?: number;
  heightOffset?: number;
}

export const landmarkModelMap: Partial<Record<string, LandmarkModelConfig>> = {
  // Temporary import test: render Broken Bridge with the existing Tokyo Tower model.
  "broken-bridge": {
    path: "/models/landmarks/tokyo_tower.glb",
    scale: 0.028,
    rotationY: 0,
    heightOffset: 0.02,
  },
};

export const landmarkModelPaths = Array.from(
  new Set(
    Object.values(landmarkModelMap)
      .filter((config): config is LandmarkModelConfig => Boolean(config))
      .map((config) => config.path),
  ),
);
