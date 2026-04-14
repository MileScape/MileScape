export interface Landmark {
  id: string;
  name: string;
  milestoneKm: number;
  description: string;
  image: string;
}

export interface Route {
  id: string;
  name: string;
  city: string;
  country: string;
  totalDistanceKm: number;
  coverImage: string;
  description: string;
  motivation: string;
  landmarks: Landmark[];
}

export interface RouteProgress {
  routeId: string;
  completedDistanceKm: number;
  unlockedLandmarkIds: string[];
  completed: boolean;
}

export interface RunHistoryItem {
  id: string;
  routeId: string;
  distanceKm: number;
  completedAt: string;
}

export interface RunResultSummary {
  routeId: string;
  distanceAddedKm: number;
  previousDistanceKm: number;
  updatedDistanceKm: number;
  newlyUnlockedLandmarks: Landmark[];
  routeCompleted: boolean;
}

export interface AppState {
  selectedRouteId: string | null;
  routeProgress: RouteProgress[];
  runHistory: RunHistoryItem[];
  lastRunResult: RunResultSummary | null;
}

export interface AppContextValue {
  routes: Route[];
  state: AppState;
  selectRoute: (routeId: string) => void;
  completeRun: (routeId: string, distanceKm: number) => RunResultSummary;
  resetDemo: () => void;
}
