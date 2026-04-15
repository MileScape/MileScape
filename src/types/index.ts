export interface Landmark {
  id: string;
  name: string;
  milestoneKm: number;
  description: string;
  image: string;
}

export type RouteTier = "Starter" | "Standard" | "Advanced" | "Premium";

export interface Route {
  id: string;
  name: string;
  city: string;
  country: string;
  totalDistanceKm: number;
  coverImage: string;
  description: string;
  motivation: string;
  tier: RouteTier;
  priceStamps: number;
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
  earnedStamps: number;
  updatedStampsBalance: number;
  newlyUnlockedLandmarks: Landmark[];
  routeCompleted: boolean;
}

export interface AppState {
  selectedRouteId: string | null;
  routeProgress: RouteProgress[];
  runHistory: RunHistoryItem[];
  currentStamps: number;
  totalStampsEarned: number;
  purchasedRouteIds: string[];
  lastRunResult: RunResultSummary | null;
}

export interface AppContextValue {
  routes: Route[];
  playableRoutes: Route[];
  state: AppState;
  selectRoute: (routeId: string) => void;
  completeRun: (routeId: string, distanceKm: number) => RunResultSummary;
  purchaseRoute: (routeId: string) => { success: boolean; message: string };
  resetDemo: () => void;
}
