import { gachaDecorRewards } from "../data/gachaRewards";
import type { Landmark, MyScapeLayout, MyScapePlacedLandmark, Route, RouteProgress, RunHistoryItem } from "../types";
import { loadMyScapeLayout } from "./storage";

export interface UnlockedLandmarkAsset extends Landmark {
  routeId: string;
  routeName: string;
  city: string;
  country: string;
  imageSrc?: string;
  assetType?: "landmark" | "decor";
  defaultScale?: number;
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
const BOARD_FOOTPRINT = 90;

const myScapeLandmarkImages: Record<string, { imageSrc: string; defaultScale: number }> = {
  "big-ben": {
    imageSrc: "/models/landmarks/big-ben.png",
    defaultScale: 1.1,
  },
  "eiffel-tower": {
    imageSrc: "/models/landmarks/eiffel-tower.png",
    defaultScale: 1.1,
  },
  "leifeng-pagoda": {
    imageSrc: "/models/landmarks/leifeng-pagoda.png",
    defaultScale: 1.12,
  },
  "statue-of-liberty": {
    imageSrc: "/models/landmarks/statue-of-liberty.png",
    defaultScale: 1.14,
  },
  "three-pools": {
    imageSrc: "/models/landmarks/three-pools.png",
    defaultScale: 1.12,
  },
  "tokyo-tower": {
    imageSrc: "/models/landmarks/tokyo tower.png",
    defaultScale: 1.18,
  },
  "torii-gate": {
    imageSrc: "/models/landmarks/torii.png",
    defaultScale: 1.16,
  },
  "tower-bridge": {
    imageSrc: "/models/landmarks/london-bridge.png",
    defaultScale: 1.08,
  },
};

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const snapToGrid = (value: number, gridSize = MY_SCAPE_GRID_SIZE) => Math.round(value / gridSize) * gridSize;

export const clampToBoard = (
  point: { x: number; y: number },
  boardWidth: number,
  boardHeight: number,
  itemScale = 1,
) => {
  const footprint = BOARD_FOOTPRINT * itemScale;
  const maxX = Math.max(0, boardWidth - footprint);
  const maxY = Math.max(0, boardHeight - footprint);
  const clampedX = clamp(point.x, 0, maxX);
  const clampedY = clamp(point.y, 0, maxY);
  const centerX = clampedX + footprint / 2;
  const centerY = clampedY + footprint / 2;
  const halfWidth = Math.max(1, (boardWidth - footprint) / 2 + 10);
  const halfHeight = Math.max(1, (boardHeight - footprint) / 2 + 50);
  const distanceX = centerX - boardWidth / 2;
  const distanceY = centerY - boardHeight / 2;
  const normalizedDistance = Math.abs(distanceX) / halfWidth + Math.abs(distanceY) / halfHeight;

  if (normalizedDistance <= 1) {
    return {
      x: clampedX,
      y: clampedY,
    };
  }

  const ratio = 1 / normalizedDistance;
  const projectedCenterX = boardWidth / 2 + distanceX * ratio;
  const projectedCenterY = boardHeight / 2 + distanceY * ratio;

  return {
    x: clamp(projectedCenterX - footprint / 2, 0, maxX),
    y: clamp(projectedCenterY - footprint / 2, 0, maxY),
  };
};

export const normalizeBoardPosition = (
  point: { x: number; y: number },
  boardWidth: number,
  boardHeight: number,
  itemScale = 1,
) => clampToBoard(point, boardWidth, boardHeight, itemScale);

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
      .map((landmark) => {
        const landmarkImage = myScapeLandmarkImages[landmark.id];

        return {
          ...landmark,
          routeId: route.id,
          routeName: route.name,
          city: route.city,
          country: route.country,
          assetType: "landmark" as const,
          ...(landmarkImage ?? {}),
        };
      });
  });

export const resolveGachaDecorAssets = (decorIds: string[]): UnlockedLandmarkAsset[] =>
  gachaDecorRewards
    .filter((reward) => decorIds.includes(reward.id))
    .map((reward) => ({
      id: reward.id,
      name: reward.name,
      milestoneKm: 0,
      description: reward.description,
      image: "",
      routeId: "paceport-gacha",
      routeName: "Paceport Draw",
      city: "My Scape",
      country: "Decor",
      assetType: "decor" as const,
      defaultScale: reward.icon === "tree" ? 0.92 : 0.82,
    }));

export const getMyScapeYearDemoAssets = (): UnlockedLandmarkAsset[] => [
  {
    id: "torii-gate",
    name: "Torii Gate",
    milestoneKm: 4,
    description: "Tokyo route unlock.",
    image: "/models/landmarks/torii.png",
    imageSrc: "/models/landmarks/torii.png",
    routeId: "tokyo-city-route",
    routeName: "Tokyo City Route",
    city: "Tokyo",
    country: "Japan",
    assetType: "landmark",
    defaultScale: 1.16,
  },
  {
    id: "tokyo-tower",
    name: "Tokyo Tower",
    milestoneKm: 10,
    description: "Tokyo route unlock.",
    image: "/models/landmarks/tokyo tower.png",
    imageSrc: "/models/landmarks/tokyo tower.png",
    routeId: "tokyo-city-route",
    routeName: "Tokyo City Route",
    city: "Tokyo",
    country: "Japan",
    assetType: "landmark",
    defaultScale: 1.18,
  },
  {
    id: "statue-of-liberty",
    name: "Statue of Liberty",
    milestoneKm: 2,
    description: "Central Park route unlock.",
    image: "/models/landmarks/statue-of-liberty.png",
    imageSrc: "/models/landmarks/statue-of-liberty.png",
    routeId: "central-park-loop",
    routeName: "Central Park Loop",
    city: "New York",
    country: "United States",
    assetType: "landmark",
    defaultScale: 1.14,
  },
  {
    id: "eiffel-tower-demo",
    name: "Eiffel Tower",
    milestoneKm: 16,
    description: "Paris route demo asset.",
    image: "/models/landmarks/eiffel-tower.png",
    imageSrc: "/models/landmarks/eiffel-tower.png",
    routeId: "paris-eiffel-route",
    routeName: "Eiffel Tower Route",
    city: "Paris",
    country: "France",
    assetType: "landmark",
    defaultScale: 1.1,
  },
  {
    id: "sydney-opera-demo",
    name: "Sydney Opera",
    milestoneKm: 8,
    description: "Sydney demo asset.",
    image: "/models/landmarks/sydney-opera.png",
    imageSrc: "/models/landmarks/sydney-opera.png",
    routeId: "sydney-harbor-demo",
    routeName: "Sydney Harbor Demo",
    city: "Sydney",
    country: "Australia",
    assetType: "landmark",
    defaultScale: 1.08,
  },
  {
    id: "london-bridge-demo",
    name: "London Bridge",
    milestoneKm: 7,
    description: "London demo asset.",
    image: "/models/landmarks/london-bridge.png",
    imageSrc: "/models/landmarks/london-bridge.png",
    routeId: "london-river-demo",
    routeName: "London River Demo",
    city: "London",
    country: "United Kingdom",
    assetType: "landmark",
    defaultScale: 1.08,
  },
  {
    id: "big-ben-demo",
    name: "Big Ben",
    milestoneKm: 5,
    description: "London demo asset.",
    image: "/models/landmarks/big-ben.png",
    imageSrc: "/models/landmarks/big-ben.png",
    routeId: "london-river-demo",
    routeName: "London River Demo",
    city: "London",
    country: "United Kingdom",
    assetType: "landmark",
    defaultScale: 1.1,
  },
];

export const getNextZIndex = (placedLandmarks: MyScapePlacedLandmark[]) =>
  placedLandmarks.reduce((max, item) => Math.max(max, item.zIndex), 0) + 1;

const hasPlacementConflict = (
  candidate: { x: number; y: number },
  existing: MyScapePlacedLandmark[],
  itemScale = 1,
) => {
  const candidateFootprint = BOARD_FOOTPRINT * itemScale;

  return existing.some((item) => {
    const existingFootprint = BOARD_FOOTPRINT * item.scale;
    const minGap = (candidateFootprint + existingFootprint) / 2 - 10;
    return Math.hypot(item.x - candidate.x, item.y - candidate.y) < minGap;
  });
};

export const createPlacedLandmark = (
  landmarkId: string,
  existing: MyScapePlacedLandmark[],
  boardWidth: number,
  boardHeight: number,
  initialScale = 1,
): MyScapePlacedLandmark => {
  const centerX = Math.max(0, boardWidth / 2 - BOARD_FOOTPRINT / 2);
  const centerY = Math.max(0, boardHeight / 2 - BOARD_FOOTPRINT / 2);
  const stepX = 34;
  const stepY = 24;
  const candidateOffsets = [{ x: 0, y: 0 }];

  for (let ring = 1; ring <= 7; ring += 1) {
    for (let xStep = -ring; xStep <= ring; xStep += 1) {
      const yStep = ring - Math.abs(xStep);
      candidateOffsets.push({ x: xStep * stepX, y: yStep * stepY });
      if (yStep !== 0) {
        candidateOffsets.push({ x: xStep * stepX, y: -yStep * stepY });
      }
    }
  }

  const nextPoint =
    candidateOffsets
      .map((offset) =>
        normalizeBoardPosition(
          {
            x: centerX + offset.x,
            y: centerY + offset.y,
          },
          boardWidth,
          boardHeight,
          initialScale,
        ),
      )
      .find((point) => !hasPlacementConflict(point, existing, initialScale)) ??
    normalizeBoardPosition({ x: centerX, y: centerY }, boardWidth, boardHeight, initialScale);

  return {
    id: crypto.randomUUID(),
    landmarkId,
    x: nextPoint.x,
    y: nextPoint.y,
    scale: initialScale,
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
  const yearDemoValues = [18.4, 22.1, 26.8, 19.6, 31.2, 28.4, 34.1, 29.7, 24.5, 27.3, 21.8, 25.9];

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
    label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month] ?? "",
    value: yearDemoValues[month] ?? 0,
  }));
};
