import type { Route, RouteProgress, RunHistoryItem, MyScapePlacedLandmark } from "../types";

export type MyScapeViewMode = "day" | "week" | "month" | "year";

export interface UnlockedLandmarkAsset {
  id: string;
  name: string;
  city: string;
  routeId: string;
  routeName: string;
}

export interface MyScapeUnlockEvent extends UnlockedLandmarkAsset {
  unlockedAt: string;
}

export interface MyScapeChartPoint {
  label: string;
  value: number;
}

export const MY_SCAPE_MIN_SCALE = 0.7;
export const MY_SCAPE_MAX_SCALE = 1.6;

const MY_SCAPE_STORAGE_KEY = "milescape-myscape-layout";
const ITEM_WIDTH = 92;
const ITEM_HEIGHT = 112;

const isPlacedLandmark = (value: unknown): value is MyScapePlacedLandmark => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return typeof item.id === "string"
    && typeof item.landmarkId === "string"
    && typeof item.x === "number"
    && typeof item.y === "number"
    && typeof item.scale === "number"
    && typeof item.zIndex === "number";
};

export const getNextZIndex = (placedLandmarks: MyScapePlacedLandmark[]) =>
  placedLandmarks.reduce((max, item) => Math.max(max, item.zIndex), 0) + 1;

export const normalizeBoardPosition = (
  point: { x: number; y: number },
  boardWidth: number,
  boardHeight: number,
  scale: number,
) => {
  const maxX = Math.max(boardWidth - (ITEM_WIDTH * scale), 0);
  const maxY = Math.max(boardHeight - (ITEM_HEIGHT * scale), 0);

  return {
    x: Math.min(Math.max(point.x, 0), maxX),
    y: Math.min(Math.max(point.y, 0), maxY),
  };
};

export const createPlacedLandmark = (
  landmarkId: string,
  placedLandmarks: MyScapePlacedLandmark[],
  boardWidth: number,
  boardHeight: number,
): MyScapePlacedLandmark => {
  const nextIndex = placedLandmarks.length;
  const position = normalizeBoardPosition(
    {
      x: 24 + (nextIndex % 3) * 56,
      y: 36 + Math.floor(nextIndex / 3) * 48,
    },
    boardWidth,
    boardHeight,
    1,
  );

  return {
    id: `myscape-${landmarkId}-${Date.now()}-${nextIndex}`,
    landmarkId,
    x: position.x,
    y: position.y,
    scale: 1,
    zIndex: getNextZIndex(placedLandmarks),
  };
};

export const serializeMyScapeLayout = (placedLandmarks: MyScapePlacedLandmark[]) => placedLandmarks;

export const restoreMyScapeLayout = (): MyScapePlacedLandmark[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(MY_SCAPE_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isPlacedLandmark) : [];
  } catch {
    return [];
  }
};

export const resolveUnlockedLandmarkAssets = (
  routes: Route[],
  routeProgress: RouteProgress[],
): UnlockedLandmarkAsset[] => {
  const progressMap = new Map(
    routeProgress.map((entry) => [entry.routeId, new Set(entry.unlockedLandmarkIds)]),
  );

  return routes.flatMap((route) =>
    route.landmarks
      .filter((landmark) => progressMap.get(route.id)?.has(landmark.id))
      .map((landmark) => ({
        id: landmark.id,
        name: landmark.name,
        city: route.city,
        routeId: route.id,
        routeName: route.name,
      })),
  );
};

export const buildMyScapeUnlockTimeline = (
  routes: Route[],
  runHistory: RunHistoryItem[],
): MyScapeUnlockEvent[] => {
  const routeMap = new Map(routes.map((route) => [route.id, route]));
  const distanceByRoute = new Map<string, number>();
  const emitted = new Set<string>();
  const timeline: MyScapeUnlockEvent[] = [];

  [...runHistory]
    .sort((left, right) => new Date(left.completedAt).getTime() - new Date(right.completedAt).getTime())
    .forEach((entry) => {
      if (!entry.routeId) {
        return;
      }

      const route = routeMap.get(entry.routeId);
      if (!route) {
        return;
      }

      const nextDistance = (distanceByRoute.get(route.id) ?? 0) + entry.distanceKm;
      distanceByRoute.set(route.id, nextDistance);

      route.landmarks.forEach((landmark) => {
        const key = `${route.id}:${landmark.id}`;
        if (emitted.has(key) || nextDistance < landmark.milestoneKm) {
          return;
        }

        emitted.add(key);
        timeline.push({
          id: landmark.id,
          name: landmark.name,
          city: route.city,
          routeId: route.id,
          routeName: route.name,
          unlockedAt: entry.completedAt,
        });
      });
    });

  return timeline;
};

export const getPeriodStart = (anchorDate: Date, viewMode: MyScapeViewMode) => {
  const date = new Date(anchorDate);

  if (viewMode === "day") {
    date.setHours(0, 0, 0, 0);
    return date;
  }

  if (viewMode === "week") {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  if (viewMode === "month") {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  return new Date(date.getFullYear(), 0, 1);
};

export const getPeriodEnd = (anchorDate: Date, viewMode: MyScapeViewMode) => {
  const start = getPeriodStart(anchorDate, viewMode);

  if (viewMode === "day") {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
  }

  if (viewMode === "week") {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
  }

  if (viewMode === "month") {
    return new Date(start.getFullYear(), start.getMonth() + 1, 1);
  }

  return new Date(start.getFullYear() + 1, 0, 1);
};

export const shiftAnchorDate = (anchorDate: Date, viewMode: MyScapeViewMode, direction: -1 | 1) => {
  const date = new Date(anchorDate);

  if (viewMode === "day") {
    date.setDate(date.getDate() + direction);
  } else if (viewMode === "week") {
    date.setDate(date.getDate() + (direction * 7));
  } else if (viewMode === "month") {
    date.setMonth(date.getMonth() + direction);
  } else {
    date.setFullYear(date.getFullYear() + direction);
  }

  return date;
};

export const isFuturePeriod = (anchorDate: Date, viewMode: MyScapeViewMode) =>
  getPeriodStart(anchorDate, viewMode).getTime() > getPeriodStart(new Date(), viewMode).getTime();

export const formatMyScapePeriodLabel = (anchorDate: Date, viewMode: MyScapeViewMode) => {
  const start = getPeriodStart(anchorDate, viewMode);

  if (viewMode === "day") {
    return start.toLocaleDateString();
  }

  if (viewMode === "week") {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  if (viewMode === "month") {
    return start.toLocaleDateString(undefined, { year: "numeric", month: "long" });
  }

  return String(start.getFullYear());
};

export const buildMyScapeChartData = (
  runHistory: RunHistoryItem[],
  anchorDate: Date,
  viewMode: MyScapeViewMode,
): MyScapeChartPoint[] => {
  const start = getPeriodStart(anchorDate, viewMode);
  const end = getPeriodEnd(anchorDate, viewMode);
  const buckets = new Map<string, number>();

  runHistory.forEach((entry) => {
    const date = new Date(entry.completedAt);
    if (date < start || date >= end) {
      return;
    }

    let label = "";
    if (viewMode === "day") {
      label = `${String(date.getHours()).padStart(2, "0")}:00`;
    } else if (viewMode === "year") {
      label = date.toLocaleDateString(undefined, { month: "short" });
    } else {
      label = `${date.getMonth() + 1}/${date.getDate()}`;
    }

    buckets.set(label, (buckets.get(label) ?? 0) + entry.distanceKm);
  });

  return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
};
