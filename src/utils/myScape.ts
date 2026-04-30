import type { Decoration, Landmark, MyScapeLayout, MyScapePlacedLandmark, Route, RouteProgress, RunHistoryItem } from "../types";
import { loadMyScapeLayout, loadPlacedAssetIds } from "./storage";

export interface UnlockedLandmarkAsset {
  id: string;
  name: string;
  description: string;
  image: string;
  routeId: string;
  routeName: string;
  city: string;
  country: string;
  imageSrc?: string;
  assetType: "landmark" | "decor";
  defaultScale?: number;
  milestoneKm?: number;
  rarity?: Decoration["rarity"];
  ownedCount?: number;
  routeOrder?: number;
  itemOrder?: number;
}

export type MyScapeViewMode = "day" | "week" | "month" | "year";

export interface MyScapeUnlockEvent extends UnlockedLandmarkAsset {
  unlockedAt: string;
}

export interface MyScapeChartPoint {
  label: string;
  value: number;
}

export const MY_SCAPE_TILE_WIDTH = 64;
export const MY_SCAPE_TILE_HEIGHT = 32;
export const MY_SCAPE_GRID_COLUMNS = 8;
export const MY_SCAPE_GRID_ROWS = 8;
export const MY_SCAPE_MIN_SCALE = 0.8;
export const MY_SCAPE_MAX_SCALE = 1.4;
const MY_SCAPE_ORIGIN_X_RATIO = 0.5;
const MY_SCAPE_ORIGIN_Y_RATIO = 0.12;
const MY_SCAPE_ORIGIN_X_OFFSET = 0;
const MY_SCAPE_ORIGIN_Y_OFFSET = 12;

const myScapeLandmarkImages: Record<string, { imageSrc: string; defaultScale: number }> = {
  "big-ben": {
    imageSrc: "/models/landmarks/london-route/BigBen.png",
    defaultScale: 1.1,
  },
  "eiffel-tower": {
    imageSrc: "/models/landmarks/paris-route/eiffel-tower.png",
    defaultScale: 1.1,
  },
  "louvre-courtyard": {
    imageSrc: "/models/landmarks/paris-route/louvre-courtyard.png",
    defaultScale: 1.08,
  },
  "arc-de-triomphe": {
    imageSrc: "/models/landmarks/paris-route/arc-de-triomphe.png",
    defaultScale: 1.08,
  },
  "leifeng-pagoda": {
    imageSrc: "/models/landmarks/leifeng-pagoda.png",
    defaultScale: 1.12,
  },
  "statue-of-liberty": {
    imageSrc: "/models/landmarks/central-park-route/statue-of-liberty.png",
    defaultScale: 1.14,
  },
  "three-pools": {
    imageSrc: "/models/landmarks/three-pools.png",
    defaultScale: 1.12,
  },
  "tokyo-tower": {
    imageSrc: "/models/landmarks/tokyo-route/tokyo-tower.png",
    defaultScale: 1.18,
  },
  "shibuya": {
    imageSrc: "/models/landmarks/tokyo-route/shibuya.png",
    defaultScale: 1.16,
  },
  "senso-ji": {
    imageSrc: "/models/landmarks/tokyo-route/senso-ji.png",
    defaultScale: 1.14,
  },
  "tower-bridge": {
    imageSrc: "/models/landmarks/london-route/TowerBridge.png",
    defaultScale: 1.08,
  },
};

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const getMyScapeOrigin = (boardWidth: number, boardHeight: number) => ({
  originX: boardWidth * MY_SCAPE_ORIGIN_X_RATIO + MY_SCAPE_ORIGIN_X_OFFSET,
  originY: boardHeight * MY_SCAPE_ORIGIN_Y_RATIO + MY_SCAPE_ORIGIN_Y_OFFSET,
});

export const gridToScreen = (
  col: number,
  row: number,
  boardWidth: number,
  boardHeight: number,
) => {
  const { originX, originY } = getMyScapeOrigin(boardWidth, boardHeight);
  return {
    x: originX + ((col - row) * MY_SCAPE_TILE_WIDTH) / 2,
    y: originY + ((col + row) * MY_SCAPE_TILE_HEIGHT) / 2,
  };
};

export const screenToGrid = (
  x: number,
  y: number,
  boardWidth: number,
  boardHeight: number,
): { col: number; row: number } => {
  const { originX, originY } = getMyScapeOrigin(boardWidth, boardHeight);
  const dx = x - originX;
  const dy = y - originY;

  return {
    col: Math.round(dx / MY_SCAPE_TILE_WIDTH + dy / MY_SCAPE_TILE_HEIGHT),
    row: Math.round(dy / MY_SCAPE_TILE_HEIGHT - dx / MY_SCAPE_TILE_WIDTH),
  };
};

export const clampGridPosition = (col: number, row: number) => ({
  col: clamp(col, 0, MY_SCAPE_GRID_COLUMNS - 1),
  row: clamp(row, 0, MY_SCAPE_GRID_ROWS - 1),
});

export const getItemZIndex = (col: number, row: number) => col + row + 10;

export const serializeMyScapeLayout = (
  placedLandmarks: MyScapePlacedLandmark[],
): MyScapeLayout => ({
  placedLandmarks,
  updatedAt: new Date().toISOString(),
});

export const restoreMyScapeLayout = (scopeKey = "overview") => loadMyScapeLayout(scopeKey)?.placedLandmarks ?? [];

export const restorePlacedAssetIds = () => loadPlacedAssetIds();

export const getMyScapeDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDecorationDefaultScale = (decoration: Decoration) => {
  if (decoration.rarity === "legendary") {
    return 1;
  }

  if (decoration.rarity === "epic") {
    return 0.96;
  }

  if (decoration.rarity === "rare") {
    return 0.92;
  }

  return 0.88;
};

export const resolveUnlockedLandmarkAssets = (
  routes: Route[],
  routeProgress: RouteProgress[],
): UnlockedLandmarkAsset[] =>
  routes.flatMap((route) => {
    const progress = routeProgress.find((entry) => entry.routeId === route.id);
    if (!progress) {
      return [];
    }

    const landmarks = route.landmarks
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
          imageSrc: landmarkImage?.imageSrc ?? landmark.image,
          defaultScale: landmarkImage?.defaultScale,
          ownedCount: 1,
        };
      });

    const decorations = (route.decorations ?? [])
      .filter((decoration) => (progress.decorations[decoration.id] ?? 0) > 0)
      .map((decoration) => ({
        id: decoration.id,
        name: decoration.name,
        description: decoration.description ?? `${route.city} decoration`,
        image: decoration.image ?? decoration.icon ?? "",
        imageSrc: decoration.image ?? decoration.icon,
        routeId: route.id,
        routeName: route.name,
        city: route.city,
        country: route.country,
        assetType: "decor" as const,
        defaultScale: getDecorationDefaultScale(decoration),
        rarity: decoration.rarity,
        ownedCount: progress.decorations[decoration.id] ?? 0,
      }));

    return [...landmarks, ...decorations];
  });

export const resolveMyScapeCatalogAssets = (
  routes: Route[],
  routeProgress: RouteProgress[],
): UnlockedLandmarkAsset[] =>
  routes.flatMap((route, routeIndex) => {
    const progress = routeProgress.find((entry) => entry.routeId === route.id);

    const landmarks = route.landmarks.map((landmark, landmarkIndex) => {
      const landmarkImage = myScapeLandmarkImages[landmark.id];
      const isUnlocked = progress?.unlockedLandmarkIds.includes(landmark.id) ?? false;

      return {
        ...landmark,
        routeId: route.id,
        routeName: route.name,
        city: route.city,
        country: route.country,
        assetType: "landmark" as const,
        imageSrc: landmarkImage?.imageSrc ?? landmark.image,
        defaultScale: landmarkImage?.defaultScale,
        ownedCount: isUnlocked ? 1 : 0,
        routeOrder: routeIndex,
        itemOrder: landmarkIndex,
      };
    });

    const decorations = (route.decorations ?? []).map((decoration, decorationIndex) => ({
      id: decoration.id,
      name: decoration.name,
      description: decoration.description ?? `${route.city} decoration`,
      image: decoration.image ?? decoration.icon ?? "",
      imageSrc: decoration.image ?? decoration.icon,
      routeId: route.id,
      routeName: route.name,
      city: route.city,
      country: route.country,
      assetType: "decor" as const,
      defaultScale: getDecorationDefaultScale(decoration),
      rarity: decoration.rarity,
      ownedCount: progress?.decorations[decoration.id] ?? 0,
      routeOrder: routeIndex,
      itemOrder: decorationIndex,
    }));

    return [...landmarks, ...decorations];
  });

export const getMyScapeYearDemoAssets = (): UnlockedLandmarkAsset[] => [
  {
    id: "shibuya",
    name: "Shibuya Crossing",
    milestoneKm: 4,
    description: "Tokyo route unlock.",
    image: "/models/landmarks/tokyo-route/shibuya.png",
    imageSrc: "/models/landmarks/tokyo-route/shibuya.png",
    routeId: "tokyo-city-route",
    routeName: "Neon Sakura Circuit",
    city: "Tokyo",
    country: "Japan",
    assetType: "landmark",
    defaultScale: 1.16,
  },
  {
    id: "senso-ji",
    name: "Senso-ji",
    milestoneKm: 10,
    description: "Tokyo route unlock.",
    image: "/models/landmarks/tokyo-route/senso-ji.png",
    imageSrc: "/models/landmarks/tokyo-route/senso-ji.png",
    routeId: "tokyo-city-route",
    routeName: "Neon Sakura Circuit",
    city: "Tokyo",
    country: "Japan",
    assetType: "landmark",
    defaultScale: 1.14,
  },
  {
    id: "tokyo-tower",
    name: "Tokyo Tower",
    milestoneKm: 15,
    description: "Tokyo route unlock.",
    image: "/models/landmarks/tokyo-route/tokyo-tower.png",
    imageSrc: "/models/landmarks/tokyo-route/tokyo-tower.png",
    routeId: "tokyo-city-route",
    routeName: "Neon Sakura Circuit",
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
    image: "/models/landmarks/central-park-route/statue-of-liberty.png",
    imageSrc: "/models/landmarks/central-park-route/statue-of-liberty.png",
    routeId: "central-park-loop",
    routeName: "Manhattan Lights Trail",
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
    routeId: "paris-eiffel-route",
    routeName: "Seine Romance Path",
    city: "Paris",
    country: "France",
    assetType: "landmark",
    defaultScale: 1.1,
    image: "/models/landmarks/paris-route/eiffel-tower.png",
    imageSrc: "/models/landmarks/paris-route/eiffel-tower.png",
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
  placedLandmarks.reduce((max, item) => Math.max(max, item.zIndex ?? getItemZIndex(item.col, item.row)), 0) + 1;

export const isGridCellOccupied = (col: number, row: number, items: MyScapePlacedLandmark[], excludeId?: string) =>
  items.some((item) => item.id !== excludeId && item.col === col && item.row === row);

export const createPlacedLandmark = (
  landmarkId: string,
  existing: MyScapePlacedLandmark[],
  initialScale = 1,
): MyScapePlacedLandmark => {
  const centerCol = Math.floor(MY_SCAPE_GRID_COLUMNS / 2);
  const centerRow = Math.floor(MY_SCAPE_GRID_ROWS / 2);
  const candidateOffsets = [{ col: centerCol, row: centerRow }];

  for (let ring = 1; ring <= Math.max(MY_SCAPE_GRID_COLUMNS, MY_SCAPE_GRID_ROWS); ring += 1) {
    for (let colOffset = -ring; colOffset <= ring; colOffset += 1) {
      const rowOffset = ring - Math.abs(colOffset);
      candidateOffsets.push(
        clampGridPosition(centerCol + colOffset, centerRow + rowOffset),
      );
      if (rowOffset !== 0) {
        candidateOffsets.push(
          clampGridPosition(centerCol + colOffset, centerRow - rowOffset),
        );
      }
    }
  }

  const nextPoint =
    candidateOffsets.find((candidate) => !isGridCellOccupied(candidate.col, candidate.row, existing)) ??
    clampGridPosition(centerCol, centerRow);

  return {
    id: crypto.randomUUID(),
    landmarkId,
    col: nextPoint.col,
    row: nextPoint.row,
    scale: initialScale,
    zIndex: getItemZIndex(nextPoint.col, nextPoint.row),
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
        const landmarkImage = myScapeLandmarkImages[landmark.id];
        unlocks.push({
          ...landmark,
          routeId: route.id,
          routeName: route.name,
          city: route.city,
          country: route.country,
          assetType: "landmark",
          imageSrc: landmarkImage?.imageSrc ?? landmark.image,
          defaultScale: landmarkImage?.defaultScale,
          ownedCount: 1,
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
