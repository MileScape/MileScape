import type { Landmark, MyScapeLayout, MyScapePlacedLandmark, Route, RouteProgress, RunHistoryItem } from "../types";
import { loadMyScapeLayout } from "./storage";

export interface UnlockedLandmarkAsset extends Landmark {
  routeId: string;
  routeName: string;
  city: string;
  country: string;
}

export type MyScapeViewMode = "day" | "week" | "month" | "year";

export interface MyScapeUnlockEvent extends UnlockedLandmarkAsset {
  unlockedAt: string;
}

export interface MyScapeChartPoint {
  label: string;
  value: number;
}

export const MY_SCAPE_GRID_SIZE = 42;
export const MY_SCAPE_MIN_SCALE = 0.8;
export const MY_SCAPE_MAX_SCALE = 1.4;
const BOARD_MARGIN = 28;

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const snapToGrid = (value: number, gridSize = MY_SCAPE_GRID_SIZE) => Math.round(value / gridSize) * gridSize;

export const clampToBoard = (
  point: { x: number; y: number },
  boardWidth: number,
  boardHeight: number,
  itemScale = 1,
) => {
  const footprint = 44 * itemScale;

  return {
    x: clamp(point.x, BOARD_MARGIN, Math.max(BOARD_MARGIN, boardWidth - BOARD_MARGIN - footprint)),
    y: clamp(point.y, BOARD_MARGIN, Math.max(BOARD_MARGIN, boardHeight - BOARD_MARGIN - footprint)),
  };
};

export const normalizeBoardPosition = (
  point: { x: number; y: number },
  boardWidth: number,
  boardHeight: number,
  itemScale = 1,
) => {
  const clamped = clampToBoard(point, boardWidth, boardHeight, itemScale);

  return {
    x: snapToGrid(clamped.x),
    y: snapToGrid(clamped.y),
  };
};

export const serializeMyScapeLayout = (placedLandmarks: MyScapePlacedLandmark[]): MyScapeLayout => ({
  placedLandmarks,
  updatedAt: new Date().toISOString(),
});

export const restoreMyScapeLayout = () => loadMyScapeLayout()?.placedLandmarks ?? [];

export const resolveUnlockedLandmarkAssets = (
  routes: Route[],
  routeProgress: RouteProgress[],
): UnlockedLandmarkAsset[] =>
  routes.flatMap((route) => {
    const progress = routeProgress.find((entry) => entry.routeId === route.id);
    if (!progress || progress.unlockedLandmarkIds.length === 0) {
      return [];
    }

    return route.landmarks
      .filter((landmark) => progress.unlockedLandmarkIds.includes(landmark.id))
      .map((landmark) => ({
        ...landmark,
        routeId: route.id,
        routeName: route.name,
        city: route.city,
        country: route.country,
      }));
  });

export const getNextZIndex = (placedLandmarks: MyScapePlacedLandmark[]) =>
  placedLandmarks.reduce((max, item) => Math.max(max, item.zIndex), 0) + 1;

export const createPlacedLandmark = (
  landmarkId: string,
  existing: MyScapePlacedLandmark[],
  boardWidth: number,
  boardHeight: number,
): MyScapePlacedLandmark => {
  const centerX = Math.max(BOARD_MARGIN, boardWidth / 2 - MY_SCAPE_GRID_SIZE);
  const centerY = Math.max(BOARD_MARGIN, boardHeight / 2 - MY_SCAPE_GRID_SIZE);
  const candidateOffsets = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
    { x: 2, y: 0 },
    { x: -2, y: 0 },
    { x: 0, y: 2 },
    { x: 0, y: -2 },
  ];

  const occupiedKeys = new Set(existing.map((item) => `${snapToGrid(item.x)}:${snapToGrid(item.y)}`));
  const nextPoint =
    candidateOffsets
      .map((offset) => ({
        x: centerX + offset.x * MY_SCAPE_GRID_SIZE,
        y: centerY + offset.y * MY_SCAPE_GRID_SIZE,
      }))
      .map((point) => normalizeBoardPosition(point, boardWidth, boardHeight))
      .find((point) => !occupiedKeys.has(`${point.x}:${point.y}`)) ??
    normalizeBoardPosition({ x: centerX, y: centerY }, boardWidth, boardHeight);

  return {
    id: crypto.randomUUID(),
    landmarkId,
    x: nextPoint.x,
    y: nextPoint.y,
    scale: 1,
    zIndex: getNextZIndex(existing),
  };
};

const padDate = (value: number) => `${value}`.padStart(2, "0");

export const getPeriodStart = (anchorDate: Date, mode: MyScapeViewMode) => {
  const start = new Date(anchorDate);
  start.setHours(0, 0, 0, 0);

  if (mode === "day") {
    return start;
  }

  if (mode === "week") {
    const day = start.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + offset);
    return start;
  }

  if (mode === "month") {
    start.setDate(1);
    return start;
  }

  start.setMonth(0, 1);
  return start;
};

export const getPeriodEnd = (anchorDate: Date, mode: MyScapeViewMode) => {
  const end = new Date(getPeriodStart(anchorDate, mode));

  if (mode === "day") {
    end.setDate(end.getDate() + 1);
    return end;
  }

  if (mode === "week") {
    end.setDate(end.getDate() + 7);
    return end;
  }

  if (mode === "month") {
    end.setMonth(end.getMonth() + 1);
    return end;
  }

  end.setFullYear(end.getFullYear() + 1);
  return end;
};

export const shiftAnchorDate = (anchorDate: Date, mode: MyScapeViewMode, step: number) => {
  const next = new Date(anchorDate);

  if (mode === "day") {
    next.setDate(next.getDate() + step);
    return next;
  }

  if (mode === "week") {
    next.setDate(next.getDate() + step * 7);
    return next;
  }

  if (mode === "month") {
    next.setMonth(next.getMonth() + step);
    return next;
  }

  next.setFullYear(next.getFullYear() + step);
  return next;
};

export const isFuturePeriod = (anchorDate: Date, mode: MyScapeViewMode) => {
  const currentPeriodStart = getPeriodStart(new Date(), mode).getTime();
  const targetPeriodStart = getPeriodStart(anchorDate, mode).getTime();
  return targetPeriodStart > currentPeriodStart;
};

const isToday = (value: Date) => {
  const today = new Date();
  return value.toDateString() === today.toDateString();
};

export const formatMyScapePeriodLabel = (anchorDate: Date, mode: MyScapeViewMode) => {
  if (mode === "day") {
    const formatted = anchorDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const suffix = isToday(anchorDate) ? " (Today)" : "";
    return `${formatted}${suffix}`;
  }

  if (mode === "week") {
    const start = getPeriodStart(anchorDate, mode);
    const end = new Date(getPeriodEnd(anchorDate, mode));
    end.setDate(end.getDate() - 1);
    const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${startLabel} - ${endLabel}`;
  }

  if (mode === "month") {
    return anchorDate.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  }

  return `${anchorDate.getFullYear()}`;
};

export const isWithinPeriod = (value: string, anchorDate: Date, mode: MyScapeViewMode) => {
  const current = new Date(value).getTime();
  const start = getPeriodStart(anchorDate, mode).getTime();
  const end = getPeriodEnd(anchorDate, mode).getTime();
  return current >= start && current < end;
};

export const buildMyScapeUnlockTimeline = (routes: Route[], runHistory: RunHistoryItem[]): MyScapeUnlockEvent[] => {
  const routeProgressById = new Map<string, number>();
  const routeMap = new Map(routes.map((route) => [route.id, route]));
  const orderedRuns = [...runHistory]
    .filter((entry) => entry.runTargetType === "personal" && entry.routeId)
    .sort((left, right) => new Date(left.completedAt).getTime() - new Date(right.completedAt).getTime());

  const unlocks: MyScapeUnlockEvent[] = [];

  orderedRuns.forEach((run) => {
    const route = routeMap.get(run.routeId ?? "");
    if (!route) {
      return;
    }

    const previousDistance = routeProgressById.get(route.id) ?? 0;
    const nextDistance = Math.min(route.totalDistanceKm, previousDistance + run.distanceKm);

    route.landmarks
      .filter((landmark) => landmark.milestoneKm > previousDistance && landmark.milestoneKm <= nextDistance)
      .forEach((landmark) => {
        unlocks.push({
          ...landmark,
          routeId: route.id,
          routeName: route.name,
          city: route.city,
          country: route.country,
          unlockedAt: run.completedAt,
        });
      });

    routeProgressById.set(route.id, nextDistance);
  });

  return unlocks;
};

export const buildMyScapeChartData = (
  runHistory: RunHistoryItem[],
  anchorDate: Date,
  mode: MyScapeViewMode,
): MyScapeChartPoint[] => {
  const runs = runHistory.filter((entry) => isWithinPeriod(entry.completedAt, anchorDate, mode));

  if (mode === "day") {
    return Array.from({ length: 24 }, (_, hour) => ({
      label: `${padDate(hour)}:00`,
      value: Number(
        runs
          .filter((entry) => new Date(entry.completedAt).getHours() === hour)
          .reduce((sum, entry) => sum + entry.distanceKm, 0)
          .toFixed(1),
      ),
    }));
  }

  if (mode === "week") {
    const start = getPeriodStart(anchorDate, mode);
    return Array.from({ length: 7 }, (_, index) => {
      const current = new Date(start);
      current.setDate(start.getDate() + index);
      return {
        label: ["一", "二", "三", "四", "五", "六", "日"][index] ?? "",
        value: Number(
          runs
            .filter((entry) => new Date(entry.completedAt).toDateString() === current.toDateString())
            .reduce((sum, entry) => sum + entry.distanceKm, 0)
            .toFixed(1),
        ),
      };
    });
  }

  if (mode === "month") {
    const start = getPeriodStart(anchorDate, mode);
    const end = getPeriodEnd(anchorDate, mode);
    const dayCount = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Array.from({ length: dayCount }, (_, index) => {
      const current = new Date(start);
      current.setDate(start.getDate() + index);
      return {
        label: `${index + 1}`,
        value: Number(
          runs
            .filter((entry) => new Date(entry.completedAt).toDateString() === current.toDateString())
            .reduce((sum, entry) => sum + entry.distanceKm, 0)
            .toFixed(1),
        ),
      };
    });
  }

  return Array.from({ length: 12 }, (_, month) => ({
    label: `${month + 1}月`,
    value: Number(
      runs
        .filter((entry) => new Date(entry.completedAt).getMonth() === month)
        .reduce((sum, entry) => sum + entry.distanceKm, 0)
        .toFixed(1),
    ),
  }));
};
