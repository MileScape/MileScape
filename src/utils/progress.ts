import { routes } from "../data/routes";
import type {
  AppState,
  Landmark,
  Route,
  RouteProgress,
  RunHistoryItem,
  RunResultSummary
} from "../types";

export const createInitialState = (): AppState => ({
  selectedRouteId: routes[0]?.id ?? null,
  routeProgress: routes.map((route) => ({
    routeId: route.id,
    completedDistanceKm: 0,
    unlockedLandmarkIds: [],
    completed: false
  })),
  runHistory: [],
  lastRunResult: null
});

export const getRouteProgress = (
  routeId: string,
  state: AppState,
): RouteProgress =>
  state.routeProgress.find((entry) => entry.routeId === routeId) ?? {
    routeId,
    completedDistanceKm: 0,
    unlockedLandmarkIds: [],
    completed: false
  };

export const getProgressPercent = (route: Route, completedDistanceKm: number) =>
  Math.min(100, Math.round((completedDistanceKm / route.totalDistanceKm) * 100));

export const formatDistance = (distanceKm: number) =>
  `${Number(distanceKm.toFixed(1))} km`;

export const calculateUnlockedLandmarks = (
  route: Route,
  completedDistanceKm: number,
): Landmark[] =>
  route.landmarks.filter((landmark) => landmark.milestoneKm <= completedDistanceKm);

export const applyRunToState = (
  previousState: AppState,
  route: Route,
  distanceKm: number,
): { nextState: AppState; summary: RunResultSummary } => {
  const routeProgress = getRouteProgress(route.id, previousState);
  const previousDistanceKm = routeProgress.completedDistanceKm;
  const updatedDistanceKm = Math.min(route.totalDistanceKm, previousDistanceKm + distanceKm);
  const unlockedLandmarks = calculateUnlockedLandmarks(route, updatedDistanceKm);
  const newlyUnlockedLandmarks = unlockedLandmarks.filter(
    (landmark) => !routeProgress.unlockedLandmarkIds.includes(landmark.id),
  );
  const completed = updatedDistanceKm >= route.totalDistanceKm;

  const nextRouteProgress: RouteProgress = {
    routeId: route.id,
    completedDistanceKm: updatedDistanceKm,
    unlockedLandmarkIds: unlockedLandmarks.map((landmark) => landmark.id),
    completed
  };

  const runHistoryItem: RunHistoryItem = {
    id: crypto.randomUUID(),
    routeId: route.id,
    distanceKm,
    completedAt: new Date().toISOString()
  };

  const summary: RunResultSummary = {
    routeId: route.id,
    distanceAddedKm: distanceKm,
    previousDistanceKm,
    updatedDistanceKm,
    newlyUnlockedLandmarks,
    routeCompleted: completed
  };

  return {
    nextState: {
      ...previousState,
      selectedRouteId: route.id,
      routeProgress: previousState.routeProgress.map((entry) =>
        entry.routeId === route.id ? nextRouteProgress : entry,
      ),
      runHistory: [runHistoryItem, ...previousState.runHistory],
      lastRunResult: summary
    },
    summary
  };
};
