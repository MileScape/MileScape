export interface Landmark {
  id: string;
  name: string;
  milestoneKm: number;
  description: string;
  image: string;
}

export type RouteTier = "Starter" | "Standard" | "Advanced" | "Premium";
export type AchievementTier = "none" | "bronze" | "silver" | "gold" | "prism";
export type PaceportStatus = "locked" | "owned" | "in_progress" | "completed";

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
  runCount: number;
  achievementTier: AchievementTier;
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
  runDistanceKm: number;
  appliedDistanceKm: number;
  overflowDistanceKm: number;
  previousDistanceKm: number;
  updatedDistanceKm: number;
  earnedStamps: number;
  updatedStampsBalance: number;
  updatedRunCount: number;
  updatedAchievementTier: AchievementTier;
  newlyUnlockedLandmarks: Landmark[];
  destinationCompletedAfterRun: boolean;
}

export interface AppState {
  selectedRouteId: string | null;
  routeProgress: RouteProgress[];
  runHistory: RunHistoryItem[];
  currentStamps: number;
  totalStampsEarned: number;
  purchasedRouteIds: string[];
  sliderMaxDistanceKm: number;
  lastRunResult: RunResultSummary | null;
}

export interface AppContextValue {
  routes: Route[];
  playableRoutes: Route[];
  state: AppState;
  selectRoute: (routeId: string) => void;
  completeRun: (routeId: string, distanceKm: number) => RunResultSummary;
  purchaseRoute: (routeId: string) => { success: boolean; message: string };
  setSliderMaxDistanceKm: (distanceKm: number) => void;
  resetDemo: () => void;
}
