import type { AchievementTier, AppState, PaceportStatus, Route } from "../types";
import { getRouteProgress, getProgressPercent } from "./progress";
import { getAchievementTier } from "./achievement";
import { isRouteOwnedInPaceport } from "./paceCrew";

export const getRunCountForRoute = (routeId: string, state: AppState) =>
  getRouteProgress(routeId, state).runCount;

export const getPaceportStatus = (route: Route, state: AppState): PaceportStatus => {
  const owned = isRouteOwnedInPaceport(route.id, state);
  if (!owned) {
    return "locked";
  }

  if (route.sourceType === "pacecrew") {
    return "owned";
  }

  const progress = getRouteProgress(route.id, state);
  if (progress.completed) {
    return "completed";
  }
  if (progress.completedDistanceKm > 0) {
    return "in_progress";
  }
  return "owned";
};

export const getPaceportSummary = (route: Route, state: AppState) => {
  const progress = getRouteProgress(route.id, state);
  const unlockedLandmarkCount = progress.unlockedLandmarkIds.length;

  return {
    progress,
    runCount: progress.runCount,
    unlockedLandmarkCount,
    achievementTier: progress.achievementTier ?? getAchievementTier(progress.runCount),
    status: getPaceportStatus(route, state),
    progressPercent: getProgressPercent(route, progress.completedDistanceKm)
  };
};
