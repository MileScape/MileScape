import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Download, Share2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrangeInventoryTray } from "../components/myscape/ArrangeInventoryTray";
import { CapsuleMachineButton } from "../components/myscape/CapsuleMachineButton";
import { FloatingStatsText } from "../components/myscape/FloatingStatsText";
import { ItemActionMenu } from "../components/myscape/ItemActionMenu";
import { ItemMemoryCard } from "../components/myscape/ItemMemoryCard";
import { MyScapeAtmosphereLayer } from "../components/myscape/MyScapeAtmosphereLayer";
import { MyScapeDayDateSwitcher } from "../components/myscape/MyScapeDayDateSwitcher";
import { MyScapeHeaderControls } from "../components/myscape/MyScapeHeaderControls";
import { MyScapeBoard } from "../components/myscape/MyScapeBoard";
import { NewUnlockToast } from "../components/myscape/NewUnlockToast";
import { ScapeBoardStage } from "../components/myscape/ScapeBoardStage";
import { ScapeBottomTabs, type ScapeSummaryTab } from "../components/myscape/ScapeBottomTabs";
import { useAppState } from "../hooks/useAppState";
import { capsuleDecorationCatalog, defaultAtmosphereEffects } from "../hooks/useCapsuleLogic";
import type { MyScapePlacedLandmark } from "../types";
import { loadMyScapeCapsuleState, saveMyScapeCapsuleState, saveMyScapeLayout, savePlacedAssetIds } from "../utils/storage";
import type { MyScapeCapsuleState } from "../utils/storage";
import {
  clampGridPositionForFootprint,
  buildMyScapeUnlockTimeline,
  clampGridPosition,
  createPlacedLandmark,
  getAssetFootprint,
  getMyScapeDateKey,
  getItemZIndex,
  getPlacementAnchorPoint,
  isGridCellOccupied,
  MY_SCAPE_GRID_COLUMNS,
  MY_SCAPE_GRID_ROWS,
  MY_SCAPE_TILE_HEIGHT,
  MY_SCAPE_TILE_WIDTH,
  resolveMyScapeCatalogAssets,
  restoreMyScapeLayout,
  restorePlacedAssetIds,
  screenToGrid,
  serializeMyScapeLayout,
  type MyScapeUnlockEvent,
  type UnlockedLandmarkAsset,
} from "../utils/myScape";

const formatDistance = (value: number) => `${Number(value.toFixed(1))} km`;
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const MY_SCAPE_DEFAULT_ZOOM = 0.76;
const CAPSULE_ROUTE_NAME = "Capsule Machine";
const CAPSULE_ROUTE_ID = "capsule-machine";
const CAPSULE_DRAW_COST_STAMPS = 40;

interface SummaryStats {
  distanceKm: number;
  runCount: number;
  unlockCount: number;
}

interface ItemMemoryContent {
  detail?: string | null;
  itemType: string;
  sourceLabel: string;
  subtitle?: string | null;
  title: string;
  unlockDateLabel?: string | null;
}

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getStartOfDay = (value: Date) => {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  return day;
};

const isSameDay = (left: Date, right: Date) => getMyScapeDateKey(left) === getMyScapeDateKey(right);

const parseDateKeyAsLocalDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDaySwitcherDate = (value: Date) =>
  value
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

const formatDaySwitcherSubtitle = (value: Date) =>
  isSameDay(value, new Date())
    ? "TODAY"
    : value
        .toLocaleDateString("en-US", {
          weekday: "long",
        })
        .toUpperCase();

const isWithinDay = (value: string, dayStart: Date) => {
  const current = new Date(value).getTime();
  const start = dayStart.getTime();
  const end = start + 24 * 60 * 60 * 1000;
  return current >= start && current < end;
};

const getMemoryContent = (
  asset: UnlockedLandmarkAsset,
  unlockEvent: MyScapeUnlockEvent | null,
): ItemMemoryContent => {
  const unlockDateLabel = unlockEvent?.unlockedAt ? formatDate(unlockEvent.unlockedAt) : null;

  if (asset.assetType === "landmark") {
    return {
      title: asset.name,
      itemType: "Landmark",
      sourceLabel: `Unlocked from ${asset.routeName}`,
      unlockDateLabel,
      detail: typeof unlockEvent?.milestoneKm === "number" ? `Unlocked at ${formatDistance(unlockEvent.milestoneKm)}` : null,
      subtitle: `${asset.city}, ${asset.country}`,
    };
  }

  return {
    title: asset.name,
    itemType: "Decoration",
    sourceLabel: `Collected from ${asset.routeName}`,
    unlockDateLabel: unlockDateLabel ? `Collected on ${unlockDateLabel}` : null,
    detail: typeof asset.ownedCount === "number" ? `${asset.ownedCount} collected` : null,
    subtitle: `${asset.city}, ${asset.country}`,
  };
};

export const MyScapePage = () => {
  const navigate = useNavigate();
  const { routes, state, spendStamps } = useAppState();
  const todayDate = useMemo(() => getStartOfToday(), []);
  const [summaryTab, setSummaryTab] = useState<ScapeSummaryTab>("day");
  const [selectedDayDate, setSelectedDayDate] = useState<Date>(todayDate);
  const [dayTransitionDirection, setDayTransitionDirection] = useState<-1 | 0 | 1>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [infoItemId, setInfoItemId] = useState<string | null>(null);
  const [actionMenuItemId, setActionMenuItemId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null);
  const [isInventoryDropActive, setIsInventoryDropActive] = useState(false);
  const [entryReady, setEntryReady] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(() => getMyScapeDateKey(todayDate));
  const [shareActionInProgress, setShareActionInProgress] = useState<"save" | "share" | null>(null);
  const [capsuleState, setCapsuleState] = useState<MyScapeCapsuleState>(() => {
    const storedCapsuleState = loadMyScapeCapsuleState();

    return {
      blueprintFragments: storedCapsuleState?.blueprintFragments ?? 0,
      capsuleRouteTicketIds: storedCapsuleState?.capsuleRouteTicketIds ?? [],
      capsuleDecorationItems: storedCapsuleState?.capsuleDecorationItems ?? [],
      ownedAtmosphereEffectIds: storedCapsuleState?.ownedAtmosphereEffectIds ?? [],
      activeAtmosphereEffectIds: storedCapsuleState?.activeAtmosphereEffectIds ?? [],
    };
  });
  const {
    blueprintFragments: currentBlueprintFragments,
    capsuleRouteTicketIds,
    capsuleDecorationItems,
    ownedAtmosphereEffectIds,
    activeAtmosphereEffectIds,
  } = capsuleState;
  const capsuleStateRef = useRef(capsuleState);
  const initialDayScopeKey = `day:${getMyScapeDateKey(todayDate)}`;
  const [placedLandmarks, setPlacedLandmarks] = useState<MyScapePlacedLandmark[]>(() => restoreMyScapeLayout(initialDayScopeKey));
  const [loadedLayoutScopeKey, setLoadedLayoutScopeKey] = useState(initialDayScopeKey);
  const [placedAssetIds, setPlacedAssetIds] = useState<Set<string>>(() => new Set(restorePlacedAssetIds()));
  const boardRef = useRef<HTMLDivElement>(null);
  const sharePreviewBoardRef = useRef<HTMLDivElement>(null);
  const inventoryTrayRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const newToastShownRef = useRef(false);
  const suppressSelectRef = useRef(false);
  const dragStateRef = useRef<{
    itemId: string;
    moved: boolean;
    pointerOffsetX: number;
    pointerOffsetY: number;
    previousCol: number;
    previousRow: number;
    startClientX: number;
    startClientY: number;
    } | null>(null);

  const isPointerOverInventoryTray = (clientX: number, clientY: number) => {
    const tray = inventoryTrayRef.current;
    if (!tray) {
      return false;
    }

    const rect = tray.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  };

  const catalogAssets = useMemo(
    () => resolveMyScapeCatalogAssets(routes, state.routeProgress),
    [routes, state.routeProgress],
  );
  const capsuleDecorationAssets = useMemo<UnlockedLandmarkAsset[]>(() => {
    const decorationCounts = capsuleDecorationItems.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.decorationId] = (accumulator[item.decorationId] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(decorationCounts).flatMap(([decorationId, ownedCount], index) => {
      const decoration = capsuleDecorationCatalog.find((entry) => entry.id === decorationId);

      if (!decoration) {
        return [];
      }

      return [
        {
          id: decoration.id,
          name: decoration.name,
          description: decoration.description ?? "Capsule machine decoration",
          image: decoration.image ?? decoration.icon ?? "",
          imageSrc: decoration.image,
          routeId: CAPSULE_ROUTE_ID,
          routeName: CAPSULE_ROUTE_NAME,
          city: "My Scape",
          country: "Collection",
          assetType: "decor" as const,
          defaultScale: decoration.rarity === "legendary" ? 0.88 : decoration.rarity === "epic" ? 0.82 : 0.76,
          rarity: decoration.rarity,
          ownedCount,
          routeOrder: Number.MAX_SAFE_INTEGER,
          itemOrder: index,
          footprintWidth: decoration.rarity === "legendary" ? 2 : 1,
          footprintHeight: decoration.rarity === "legendary" ? 2 : 1,
          offsetY: 14,
        },
      ];
    });
  }, [capsuleDecorationItems]);
  const liveCatalogAssets = useMemo(
    () => [...catalogAssets, ...capsuleDecorationAssets],
    [capsuleDecorationAssets, catalogAssets],
  );
  const unlockedAssets = useMemo(() => liveCatalogAssets.filter((asset) => (asset.ownedCount ?? 0) > 0), [liveCatalogAssets]);
  const assetIds = useMemo(() => new Set(liveCatalogAssets.map((asset) => asset.id)), [liveCatalogAssets]);
  const assetMap = useMemo(() => new Map(liveCatalogAssets.map((asset) => [asset.id, asset])), [liveCatalogAssets]);
  const capsuleUnlockedRouteIds = useMemo(
    () => Array.from(new Set([...state.purchasedRouteIds, ...capsuleRouteTicketIds])),
    [capsuleRouteTicketIds, state.purchasedRouteIds],
  );
  const atmosphereEffectItems = useMemo(
    () =>
      defaultAtmosphereEffects.map((effect) => ({
        id: effect.id,
        name: effect.name,
        description: effect.description,
        owned: ownedAtmosphereEffectIds.includes(effect.id),
        active: activeAtmosphereEffectIds.includes(effect.id),
      })),
    [activeAtmosphereEffectIds, ownedAtmosphereEffectIds],
  );
  const buildPlacementAssetLookup = (assetId: string) => {
    const lookup = new Map(assetMap);
    const asset = assetMap.get(assetId);
    if (asset) {
      lookup.set("__placement-preview__", asset);
    }
    return lookup;
  };
  const unlockTimeline = useMemo(
    () => buildMyScapeUnlockTimeline(routes, state.runHistory),
    [routes, state.runHistory],
  );
  const unlockEventMap = useMemo(() => new Map(unlockTimeline.map((event) => [event.id, event])), [unlockTimeline]);
  const selectedDayStart = useMemo(() => getStartOfDay(selectedDayDate), [selectedDayDate]);
  const selectedDayKey = useMemo(() => getMyScapeDateKey(selectedDayDate), [selectedDayDate]);
  const isSelectedDayToday = useMemo(() => isSameDay(selectedDayDate, todayDate), [selectedDayDate, todayDate]);
  const activeLayoutScopeKey = summaryTab === "overview" ? "overview" : `day:${selectedDayKey}`;
  const boardViewKey = `${summaryTab}-${selectedDayKey}`;

  const goToPreviousDay = () => {
    setDayTransitionDirection(-1);
    setSelectedDayDate((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() - 1);
      return getStartOfDay(next);
    });
  };

  const goToNextDay = () => {
    if (isSelectedDayToday) {
      return;
    }

    setDayTransitionDirection(1);
    setSelectedDayDate((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + 1);
      return getStartOfDay(next);
    });
  };

  const jumpToDay = (date: Date) => {
    const nextDay = getStartOfDay(date);
    const clampedDay = nextDay.getTime() > todayDate.getTime() ? todayDate : nextDay;
    setDayTransitionDirection(clampedDay.getTime() >= selectedDayDate.getTime() ? 1 : -1);
    setSelectedDayDate(clampedDay);
    setSummaryTab("day");
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntryReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setPlacedLandmarks(restoreMyScapeLayout(activeLayoutScopeKey));
    setLoadedLayoutScopeKey(activeLayoutScopeKey);
    setSelectedId(null);
    setInfoItemId(null);
    setActionMenuItemId(null);
    setDraggingId(null);
    setDragPreview(null);
    setIsInventoryDropActive(false);
  }, [activeLayoutScopeKey]);

  useEffect(() => {
    setPlacedLandmarks((current) => {
      return current.filter((item) => {
        if (!assetIds.has(item.landmarkId)) {
          return false;
        }

        const asset = assetMap.get(item.landmarkId);
        if (asset?.assetType === "landmark") {
          return current.findIndex((entry) => entry.landmarkId === item.landmarkId) === current.indexOf(item);
        }

        return true;
      });
    });
  }, [assetIds, assetMap]);

  useEffect(() => {
    setPlacedLandmarks((current) =>
      current.map((item, index, items) => {
        const asset = assetMap.get(item.landmarkId);
        const footprint = getAssetFootprint(asset);

        if (typeof item.col === "number" && typeof item.row === "number") {
          const normalized = clampGridPositionForFootprint(item.col, item.row, footprint.width, footprint.height);
          const hasConflict = isGridCellOccupied(
            normalized.col,
            normalized.row,
            items,
            buildPlacementAssetLookup(item.landmarkId),
            item.id,
          );

          if (!hasConflict && normalized.col === item.col && normalized.row === item.row) {
            return {
              ...item,
              zIndex: getItemZIndex(item.col, item.row),
            };
          }
        }

        const fallback = createPlacedLandmark(item.landmarkId, current.slice(0, index), assetMap, item.scale);
        return {
          ...item,
          col: fallback.col,
          row: fallback.row,
          zIndex: getItemZIndex(fallback.col, fallback.row),
        };
      }),
    );
  }, [assetMap]);

  useEffect(() => {
    if (!selectedId || placedLandmarks.some((item) => item.id === selectedId)) {
      return;
    }

    setSelectedId(null);
    setInfoItemId(null);
    setActionMenuItemId(null);
  }, [placedLandmarks, selectedId]);

  useEffect(() => {
    if (loadedLayoutScopeKey !== activeLayoutScopeKey) {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      saveMyScapeLayout(activeLayoutScopeKey, serializeMyScapeLayout(placedLandmarks));
    }, 120);

    return () => window.clearTimeout(saveTimer);
  }, [activeLayoutScopeKey, loadedLayoutScopeKey, placedLandmarks]);

  useEffect(() => {
    savePlacedAssetIds(Array.from(placedAssetIds));
  }, [placedAssetIds]);

  useEffect(() => {
    saveMyScapeCapsuleState(capsuleState);
    capsuleStateRef.current = capsuleState;
  }, [capsuleState]);

  useEffect(() => {
    if (summaryTab === "day" && !isSelectedDayToday && isEditMode) {
      setIsEditMode(false);
      setActionMenuItemId(null);
      setInfoItemId(null);
    }
  }, [isEditMode, isSelectedDayToday, summaryTab]);

  useEffect(() => {
    if (isDatePickerOpen) {
      setDatePickerValue(selectedDayKey);
    }
  }, [isDatePickerOpen, selectedDayKey]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 2600);
  };

  const createShareImageBlob = async () => {
    const canvas = document.createElement("canvas");
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = 900;
    const height = 1200;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const context = canvas.getContext("2d");

    if (!context) {
      showToast("Could not create share image");
      return null;
    }

    context.scale(pixelRatio, pixelRatio);

    const roundRect = (x: number, y: number, rectWidth: number, rectHeight: number, radius: number) => {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.arcTo(x + rectWidth, y, x + rectWidth, y + rectHeight, radius);
      context.arcTo(x + rectWidth, y + rectHeight, x, y + rectHeight, radius);
      context.arcTo(x, y + rectHeight, x, y, radius);
      context.arcTo(x, y, x + rectWidth, y, radius);
      context.closePath();
    };

    const fillRoundedRect = (x: number, y: number, rectWidth: number, rectHeight: number, radius: number, fillStyle: string | CanvasGradient) => {
      roundRect(x, y, rectWidth, rectHeight, radius);
      context.fillStyle = fillStyle;
      context.fill();
    };

    const background = context.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, "#fbf7ef");
    background.addColorStop(0.62, "#edf2e8");
    background.addColorStop(1, "#dfe9dc");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    fillRoundedRect(48, 44, width - 96, height - 88, 46, "rgba(255,255,255,0.58)");
    context.fillStyle = "#6f8177";
    context.font = "700 28px sans-serif";
    context.letterSpacing = "5px";
    context.fillText("MILESCAPE", 92, 112);
    context.letterSpacing = "0px";
    context.fillStyle = "#2c3a33";
    context.font = "700 58px sans-serif";
    context.fillText(summaryTab === "day" ? formatDaySwitcherDate(selectedDayDate) : "My Scape", 92, 182);

    const shareStage = {
      boardHeight: 222,
      boardLeft: 36,
      boardTop: 24,
      boardWidth: 352,
      scale: 1.12,
    };
    const gridHalfWidth = (MY_SCAPE_GRID_COLUMNS * MY_SCAPE_TILE_WIDTH) / 2;
    const gridHalfDepth = (MY_SCAPE_GRID_ROWS * MY_SCAPE_TILE_WIDTH) / 2;
    const boardOriginX = shareStage.boardLeft + shareStage.boardWidth / 2;
    const boardOriginY = shareStage.boardTop + shareStage.boardHeight * 0.12 + 12;
    const platformThickness = 52;
    const soilInset = 12;
    const topPoint = { x: boardOriginX, y: boardOriginY - MY_SCAPE_TILE_HEIGHT / 2 };
    const rightPoint = {
      x: boardOriginX + gridHalfWidth,
      y: boardOriginY + (MY_SCAPE_GRID_COLUMNS * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2,
    };
    const bottomPoint = {
      x: boardOriginX,
      y: boardOriginY + ((MY_SCAPE_GRID_COLUMNS + MY_SCAPE_GRID_ROWS) * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2,
    };
    const leftPoint = {
      x: boardOriginX - gridHalfDepth,
      y: boardOriginY + (MY_SCAPE_GRID_ROWS * MY_SCAPE_TILE_HEIGHT) / 2 - MY_SCAPE_TILE_HEIGHT / 2,
    };
    const leftBottomPoint = { x: bottomPoint.x, y: bottomPoint.y + platformThickness };
    const rightBottomPoint = { x: rightPoint.x, y: rightPoint.y + platformThickness };
    const leftFrontPoint = { x: leftPoint.x, y: leftPoint.y + platformThickness };
    const innerTopPoint = { x: boardOriginX, y: topPoint.y + soilInset };
    const innerRightPoint = { x: boardOriginX + gridHalfWidth - soilInset * 1.15, y: rightPoint.y + soilInset * 0.58 };
    const innerBottomPoint = { x: boardOriginX, y: bottomPoint.y - soilInset };
    const innerLeftPoint = { x: boardOriginX - gridHalfDepth + soilInset * 1.15, y: leftPoint.y + soilInset * 0.58 };
    const stageBounds = {
      maxX: boardOriginX + gridHalfWidth + 26,
      maxY: leftBottomPoint.y + 28,
      minX: boardOriginX - gridHalfDepth - 26,
      minY: 0,
    };
    const stageOffsetX =
      (width - (stageBounds.maxX - stageBounds.minX) * shareStage.scale) / 2 - stageBounds.minX * shareStage.scale;
    const stageOffsetY = 258 - stageBounds.minY * shareStage.scale;
    const projectPoint = (point: { x: number; y: number }) => ({
      x: stageOffsetX + point.x * shareStage.scale,
      y: stageOffsetY + point.y * shareStage.scale,
    });
    const drawPolygon = (points: Array<{ x: number; y: number }>, fillStyle: string | CanvasGradient) => {
      const [firstPoint, ...restPoints] = points.map(projectPoint);
      if (!firstPoint) {
        return;
      }

      context.beginPath();
      context.moveTo(firstPoint.x, firstPoint.y);
      restPoints.forEach((point) => context.lineTo(point.x, point.y));
      context.closePath();
      context.fillStyle = fillStyle;
      context.fill();
    };
    const strokePolyline = (points: Array<{ x: number; y: number }>, strokeStyle: string, lineWidth: number) => {
      const [firstPoint, ...restPoints] = points.map(projectPoint);
      if (!firstPoint) {
        return;
      }

      context.beginPath();
      context.moveTo(firstPoint.x, firstPoint.y);
      restPoints.forEach((point) => context.lineTo(point.x, point.y));
      context.strokeStyle = strokeStyle;
      context.lineWidth = lineWidth;
      context.stroke();
    };

    const boardGradient = context.createLinearGradient(
      projectPoint(topPoint).x,
      projectPoint(topPoint).y,
      projectPoint(bottomPoint).x,
      projectPoint(bottomPoint).y,
    );
    boardGradient.addColorStop(0, "#eef5ec");
    boardGradient.addColorStop(0.52, "#d9e6d7");
    boardGradient.addColorStop(1, "#bdd1c0");

    drawPolygon([topPoint, rightPoint, bottomPoint, leftPoint], boardGradient);
    drawPolygon([leftPoint, bottomPoint, leftBottomPoint, leftFrontPoint], "#7f957f");
    drawPolygon([rightPoint, bottomPoint, leftBottomPoint, rightBottomPoint], "#6f8776");
    drawPolygon([innerTopPoint, innerRightPoint, innerBottomPoint, innerLeftPoint], "rgba(255,255,255,0.08)");
    drawPolygon([leftPoint, bottomPoint, leftBottomPoint, leftFrontPoint], "rgba(122,95,66,0.22)");
    drawPolygon([rightPoint, bottomPoint, leftBottomPoint, rightBottomPoint], "rgba(94,72,51,0.18)");
    strokePolyline([topPoint, rightPoint], "rgba(255,255,255,0.26)", 2);
    strokePolyline([topPoint, leftPoint], "rgba(255,255,255,0.2)", 2);
    strokePolyline([leftPoint, bottomPoint, rightPoint], "rgba(96,121,109,0.24)", 1.5);
    strokePolyline([leftPoint, leftFrontPoint, leftBottomPoint, rightBottomPoint, rightPoint], "rgba(70,88,52,0.14)", 1.5);

    const placedPreviewAssets = placedLandmarks
      .map((item) => ({ item, asset: assetMap.get(item.landmarkId) }))
      .filter((entry): entry is { item: MyScapePlacedLandmark; asset: UnlockedLandmarkAsset } => Boolean(entry.asset))
      .sort((left, right) => (left.item.zIndex ?? 0) - (right.item.zIndex ?? 0));

    const loadShareImage = (src: string) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = src;
      });

    for (const { item, asset } of placedPreviewAssets) {
      const footprint = getAssetFootprint(asset);
      const anchorPoint = getPlacementAnchorPoint(
        item.col,
        item.row,
        footprint.width,
        footprint.height,
        shareStage.boardWidth,
        shareStage.boardHeight,
      );
      const anchor = projectPoint({
        x: shareStage.boardLeft + anchorPoint.x + (asset.offsetX ?? 0),
        y: shareStage.boardTop + anchorPoint.y + (asset.offsetY ?? 0),
      });
      const itemScale = Math.max(0.45, item.scale || 1);
      const maxImageWidth = 132 * itemScale * shareStage.scale;
      const maxImageHeight = 112 * itemScale * shareStage.scale;

      if (asset.imageSrc) {
        const image = await loadShareImage(asset.imageSrc);

        if (image) {
          const imageRatio = image.width > 0 ? image.height / image.width : 1;
          let imageWidth = maxImageWidth;
          let imageHeight = imageWidth * imageRatio;

          if (imageHeight > maxImageHeight) {
            imageHeight = maxImageHeight;
            imageWidth = imageHeight / imageRatio;
          }

          context.drawImage(image, anchor.x - imageWidth / 2, anchor.y - imageHeight, imageWidth, imageHeight);
          continue;
        }
      }

      const fallbackWidth = 96 * itemScale * shareStage.scale;
      const fallbackHeight = 84 * itemScale * shareStage.scale;
      fillRoundedRect(
        anchor.x - fallbackWidth / 2,
        anchor.y - fallbackHeight,
        fallbackWidth,
        fallbackHeight,
        18 * itemScale * shareStage.scale,
        "rgba(255,255,255,0.78)",
      );
      context.fillStyle = "#6f8177";
      context.font = `700 ${Math.max(14, 18 * itemScale * shareStage.scale)}px sans-serif`;
      context.textAlign = "center";
      context.fillText(asset.name.slice(0, 2).toUpperCase(), anchor.x, anchor.y - fallbackHeight * 0.42);
      context.textAlign = "left";
    }

    const statY = 930;
    const statCards = [
      { label: "DISTANCE", value: formatDistance(activeStats.distanceKm) },
      { label: "RUNS", value: `${activeStats.runCount}` },
      { label: "UNLOCKS", value: `${activeStats.unlockCount}` },
    ];

    statCards.forEach((stat, index) => {
      const cardWidth = 220;
      const x = 92 + index * 250;
      fillRoundedRect(x, statY, cardWidth, 116, 24, "rgba(255,255,255,0.76)");
      context.fillStyle = "#7c8b83";
      context.font = "700 18px sans-serif";
      context.fillText(stat.label, x + 24, statY + 38);
      context.fillStyle = "#2c3a33";
      context.font = "700 32px sans-serif";
      context.fillText(stat.value, x + 24, statY + 84);
    });

    context.fillStyle = "#6f8177";
    context.font = "500 24px sans-serif";
    context.fillText(`${placedLandmarks.length} placed on my lawn`, 92, 1108);

    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.96));
  };

  const handleSaveShareImage = async () => {
    setShareActionInProgress("save");
    showToast("Generating share image...");
    try {
      const blob = await createShareImageBlob();
      if (!blob) {
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `milescape-${summaryTab}-${selectedDayKey}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 500);
      showToast("Share image saved");
    } catch {
      showToast("Save failed. Try Share instead.");
    } finally {
      setShareActionInProgress(null);
    }
  };

  const handleNativeShare = async () => {
    setShareActionInProgress("share");
    showToast("Preparing share image...");
    try {
      const blob = await createShareImageBlob();
      if (!blob) {
        return;
      }

      const file = new File([blob], `milescape-${summaryTab}-${selectedDayKey}.png`, { type: "image/png" });
      const shareData = {
        title: shareTitle,
        text: shareText,
        files: [file],
      };

      if (navigator.canShare?.(shareData) && navigator.share) {
        await navigator.share(shareData);
        showToast("Share sheet opened");
        return;
      }

      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText });
        showToast("Share sheet opened");
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
      showToast("Opened share image");
    } catch {
      showToast("Share failed or cancelled");
    } finally {
      setShareActionInProgress(null);
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (suppressSelectRef.current) {
      suppressSelectRef.current = false;
      return;
    }

    setSelectedId(itemId);
    if (isEditMode) {
      setActionMenuItemId(itemId);
      setInfoItemId(null);
      return;
    }

    setInfoItemId(itemId);
    setActionMenuItemId(null);
  };

  const handleItemPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => {
    if (!isEditMode) {
      return;
    }

    const board = boardRef.current;
    const target = event.currentTarget;
    if (!board) {
      return;
    }

    event.preventDefault();
    target.setPointerCapture(event.pointerId);
      const boardRect = board.getBoundingClientRect();
      const item = placedLandmarks.find((entry) => entry.id === itemId);
      if (!item) {
        return;
      }

    setSelectedId(itemId);
    setActionMenuItemId(null);
    setInfoItemId(null);

    const asset = assetMap.get(item.landmarkId);
    const footprint = getAssetFootprint(asset);
    const anchorPoint = getPlacementAnchorPoint(
      item.col,
      item.row,
      footprint.width,
      footprint.height,
      board.clientWidth,
      board.clientHeight,
    );
    const localPointerX = (event.clientX - boardRect.left) / MY_SCAPE_DEFAULT_ZOOM;
    const localPointerY = (event.clientY - boardRect.top) / MY_SCAPE_DEFAULT_ZOOM;
    dragStateRef.current = {
      itemId,
      moved: false,
      pointerOffsetX: localPointerX - anchorPoint.x,
      pointerOffsetY: localPointerY - anchorPoint.y,
      previousCol: item.col,
      previousRow: item.row,
      startClientX: event.clientX,
      startClientY: event.clientY,
    };
    setDraggingId(itemId);
    setDragPreview(anchorPoint);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const board = boardRef.current;
      const dragState = dragStateRef.current;
      if (!board || !dragState) {
        return;
      }

      const deltaX = event.clientX - dragState.startClientX;
      const deltaY = event.clientY - dragState.startClientY;
      if (!dragState.moved && Math.hypot(deltaX, deltaY) > 5) {
        dragState.moved = true;
      }

      const boardRect = board.getBoundingClientRect();
      const localPointerX = (event.clientX - boardRect.left) / MY_SCAPE_DEFAULT_ZOOM;
      const localPointerY = (event.clientY - boardRect.top) / MY_SCAPE_DEFAULT_ZOOM;
      setIsInventoryDropActive(isPointerOverInventoryTray(event.clientX, event.clientY));
      setDragPreview({
        x: localPointerX - dragState.pointerOffsetX,
        y: localPointerY - dragState.pointerOffsetY,
      });
    };

    const handlePointerUp = (event: PointerEvent) => {
      const board = boardRef.current;
      const dragState = dragStateRef.current;

      if (!board || !dragState) {
        dragStateRef.current = null;
        setDraggingId(null);
        setDragPreview(null);
        setIsInventoryDropActive(false);
        return;
      }

      const shouldReturnToInventory = isPointerOverInventoryTray(event.clientX, event.clientY);

      if (shouldReturnToInventory) {
        const returnedItem = placedLandmarks.find((item) => item.id === dragState.itemId) ?? null;
        const returnedAsset = returnedItem ? assetMap.get(returnedItem.landmarkId) : null;

        setPlacedLandmarks((current) => current.filter((item) => item.id !== dragState.itemId));
        setSelectedId(null);
        setInfoItemId(null);
        setActionMenuItemId(null);
        suppressSelectRef.current = true;
        dragStateRef.current = null;
        setDraggingId(null);
        setDragPreview(null);
        setIsInventoryDropActive(false);
        showToast(returnedAsset ? `${returnedAsset.name} returned to inventory` : "Returned to inventory");
        return;
      }

      const draggingItem = placedLandmarks.find((item) => item.id === dragState.itemId) ?? null;
      const draggingAsset = draggingItem ? assetMap.get(draggingItem.landmarkId) : null;
      const draggingFootprint = getAssetFootprint(draggingAsset);
      const previousAnchor = getPlacementAnchorPoint(
        dragState.previousCol,
        dragState.previousRow,
        draggingFootprint.width,
        draggingFootprint.height,
        board.clientWidth,
        board.clientHeight,
      );
      const finalPreview = dragPreview ?? previousAnchor;
      const snappedGrid = clampGridPositionForFootprint(
        ...(() => {
          const grid = screenToGrid(finalPreview.x, finalPreview.y, board.clientWidth, board.clientHeight);
          return [grid.col, grid.row, draggingFootprint.width, draggingFootprint.height] as const;
        })(),
      );

      setPlacedLandmarks((current) =>
        current.map((item) => {
          if (item.id !== dragState.itemId) {
            return item;
          }

          if (
            isGridCellOccupied(
              snappedGrid.col,
              snappedGrid.row,
              current,
              buildPlacementAssetLookup(item.landmarkId),
              item.id,
            )
          ) {
            return {
              ...item,
              col: dragState.previousCol,
              row: dragState.previousRow,
              zIndex: getItemZIndex(dragState.previousCol, dragState.previousRow),
            };
          }

          return {
            ...item,
            col: snappedGrid.col,
            row: snappedGrid.row,
            zIndex: getItemZIndex(snappedGrid.col, snappedGrid.row),
          };
        }),
      );

      suppressSelectRef.current = dragState.moved;

      dragStateRef.current = null;
      setDraggingId(null);
      setDragPreview(null);
      setIsInventoryDropActive(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [assetMap, dragPreview, placedLandmarks]);

  const selectedItem = useMemo(
    () => placedLandmarks.find((item) => item.id === selectedId) ?? null,
    [placedLandmarks, selectedId],
  );
  const infoItem = useMemo(
    () => placedLandmarks.find((item) => item.id === infoItemId) ?? null,
    [infoItemId, placedLandmarks],
  );

  const placementPreview = useMemo(() => {
    if (!isEditMode) {
      return null;
    }

    if (draggingId && dragPreview && boardRef.current) {
      const draggedItem = placedLandmarks.find((item) => item.id === draggingId) ?? null;
      const draggedAsset = draggedItem ? assetMap.get(draggedItem.landmarkId) : null;
      const footprint = getAssetFootprint(draggedAsset);
      const snapped = screenToGrid(dragPreview.x, dragPreview.y, boardRef.current.clientWidth, boardRef.current.clientHeight);
      const clampedGrid = clampGridPositionForFootprint(snapped.col, snapped.row, footprint.width, footprint.height);
      const valid = !isGridCellOccupied(
        clampedGrid.col,
        clampedGrid.row,
        placedLandmarks,
        draggedItem ? buildPlacementAssetLookup(draggedItem.landmarkId) : assetMap,
        draggingId,
      );
      return {
        assetId: draggedItem?.landmarkId ?? "",
        col: clampedGrid.col,
        row: clampedGrid.row,
        valid,
        active: true,
      };
    }

    if (selectedItem) {
      return {
        assetId: selectedItem.landmarkId,
        col: selectedItem.col,
        row: selectedItem.row,
        valid: true,
        active: false,
      };
    }

    return null;
  }, [assetMap, dragPreview, draggingId, isEditMode, placedLandmarks, selectedItem]);

  const dayRuns = useMemo(
    () => state.runHistory.filter((entry) => isWithinDay(entry.completedAt, selectedDayStart)),
    [selectedDayStart, state.runHistory],
  );
  const dayRouteIds = useMemo(
    () =>
      new Set(
        dayRuns
          .filter((entry) => entry.runTargetType === "personal" && entry.routeId)
          .map((entry) => entry.routeId as string),
      ),
    [dayRuns],
  );
  const dayUnlocks = useMemo(
    () => unlockTimeline.filter((entry) => isWithinDay(entry.unlockedAt, selectedDayStart)),
    [selectedDayStart, unlockTimeline],
  );
  const newTodayIds = useMemo(() => new Set(dayUnlocks.map((entry) => entry.id)), [dayUnlocks]);
  const scopedCatalogAssets = useMemo(() => liveCatalogAssets, [liveCatalogAssets]);

  const summaryStats = useMemo<Record<ScapeSummaryTab, SummaryStats>>(
    () => ({
      day: {
        distanceKm: dayRuns.reduce((sum, entry) => sum + entry.distanceKm, 0),
        runCount: dayRuns.length,
        unlockCount: dayUnlocks.length,
      },
      overview: {
        distanceKm: state.runHistory.reduce((sum, entry) => sum + entry.distanceKm, 0),
        runCount: state.runHistory.length,
        unlockCount: liveCatalogAssets.filter((asset) => (asset.ownedCount ?? 0) > 0).length,
      },
    }),
    [dayRuns, dayUnlocks.length, liveCatalogAssets, state.runHistory],
  );

  const activeStats = summaryStats[summaryTab];
  const shareTitle = summaryTab === "day" ? `My Scape on ${formatDaySwitcherDate(selectedDayDate)}` : "My Scape Overview";
  const shareText = `${shareTitle}: ${formatDistance(activeStats.distanceKm)}, ${activeStats.runCount} run${
    activeStats.runCount === 1 ? "" : "s"
  }, ${activeStats.unlockCount} unlock${activeStats.unlockCount === 1 ? "" : "s"}.`;
  const placedCountsByAssetId = useMemo(
    () =>
      placedLandmarks.reduce<Record<string, number>>((accumulator, item) => {
        accumulator[item.landmarkId] = (accumulator[item.landmarkId] ?? 0) + 1;
        return accumulator;
      }, {}),
    [placedLandmarks],
  );
  const newUnplacedCount = useMemo(
    () =>
      unlockedAssets.filter((asset) => {
        const ownedCount = asset.assetType === "landmark" ? 1 : asset.ownedCount ?? 1;
        const placedCount = placedCountsByAssetId[asset.id] ?? 0;
        return newTodayIds.has(asset.id) && !placedAssetIds.has(asset.id) && ownedCount - placedCount > 0;
      }).length,
    [newTodayIds, placedAssetIds, placedCountsByAssetId, unlockedAssets],
  );
  const arrangeDisabled = summaryTab === "day" && !isSelectedDayToday;

  useEffect(() => {
    if (!entryReady || newToastShownRef.current || newUnplacedCount <= 0) {
      return;
    }

    newToastShownRef.current = true;
    showToast(`${newUnplacedCount} new item${newUnplacedCount > 1 ? "s are" : " is"} ready to place`);
  }, [entryReady, newUnplacedCount]);

  const inventoryItems = useMemo(
    () =>
      scopedCatalogAssets
        .map((asset) => {
          const placedItem = placedLandmarks.find((item) => item.landmarkId === asset.id);
          const ownedCount = asset.assetType === "landmark" ? Math.min(1, asset.ownedCount ?? 0) : asset.ownedCount ?? 0;
          const isUnlocked = ownedCount > 0;
          const isCapsuleAsset = asset.routeId === CAPSULE_ROUTE_ID;
          const isCollectedOnly = summaryTab === "day" && isUnlocked && !isCapsuleAsset && !dayRouteIds.has(asset.routeId);
          const placedCount = placedCountsByAssetId[asset.id] ?? 0;
          const availableCount = Math.max(0, ownedCount - placedCount);
          const isNew = !isCollectedOnly && newTodayIds.has(asset.id) && availableCount > 0 && !placedAssetIds.has(asset.id);
          const stateLabel = (() => {
            if (!isUnlocked) {
              return "LOCKED";
            }

            if (isCollectedOnly) {
              return "COLLECTED";
            }

            if (isNew) {
              return "NEW";
            }

            if (asset.assetType === "decor") {
              if (availableCount <= 0) {
                return "ON LAWN";
              }

              if (availableCount > 1) {
                return `x${availableCount} LEFT`;
              }

              return "AVAILABLE";
            }

            return availableCount > 0 ? "AVAILABLE" : "ON LAWN";
          })();
          const subtitleLabel = isUnlocked ? undefined : `From ${asset.routeName}`;

          return {
            asset,
            availableCount,
            isCollectedOnly,
            isNew,
            isUnlocked,
            ownedCount,
            placedCount,
            placed: placedCount > 0,
            selected: selectedId === placedItem?.id,
            subtitleLabel,
            stateLabel,
          };
        })
        .sort((left, right) => {
          const leftWeight = !left.isUnlocked ? 3 : left.isNew ? 0 : left.availableCount > 0 ? 1 : 2;
          const rightWeight = !right.isUnlocked ? 3 : right.isNew ? 0 : right.availableCount > 0 ? 1 : 2;
          return (
            leftWeight - rightWeight ||
            (left.asset.routeOrder ?? 0) - (right.asset.routeOrder ?? 0) ||
            (left.asset.itemOrder ?? 0) - (right.asset.itemOrder ?? 0) ||
            left.asset.name.localeCompare(right.asset.name)
          );
        }),
    [dayRouteIds, newTodayIds, placedAssetIds, placedCountsByAssetId, placedLandmarks, scopedCatalogAssets, selectedId, summaryTab],
  );

  const placeAssetOnBoard = (assetId: string) => {
    const asset = liveCatalogAssets.find((entry) => entry.id === assetId);
    if (!asset) {
      return;
    }

    const ownedCount = asset.assetType === "landmark" ? 1 : asset.ownedCount ?? 1;
    const placedCount = placedCountsByAssetId[assetId] ?? 0;
    const availableCount = Math.max(0, ownedCount - placedCount);
    if (availableCount <= 0) {
      const existingItem = placedLandmarks.find((item) => item.landmarkId === assetId);
      if (existingItem) {
        setSelectedId(existingItem.id);
      }
      return;
    }

    const created = createPlacedLandmark(asset.id, placedLandmarks, assetMap, asset.defaultScale ?? 1);
    setPlacedLandmarks((current) => [...current, created]);
    setPlacedAssetIds((current) => new Set(current).add(asset.id));
    setSelectedId(created.id);
    setActionMenuItemId(null);
    setInfoItemId(null);
  };

  const focusPlacedAsset = (assetId: string) => {
    const existingItem = placedLandmarks.find((item) => item.landmarkId === assetId);
    if (!existingItem) {
      placeAssetOnBoard(assetId);
      return;
    }

    const asset = assetMap.get(assetId);
    setSelectedId(existingItem.id);
    setActionMenuItemId(null);
    setInfoItemId(null);
    showToast(asset ? `${asset.name} is already on your lawn` : "Already on your lawn");
  };

  const updateCapsuleState = (updater: (current: MyScapeCapsuleState) => MyScapeCapsuleState) => {
    const currentCapsuleState = capsuleStateRef.current;
    const nextCapsuleState = updater(currentCapsuleState);

    if (nextCapsuleState === currentCapsuleState) {
      return;
    }

    capsuleStateRef.current = nextCapsuleState;
    setCapsuleState(nextCapsuleState);
  };

  const exchangeCapsuleAtmosphereEffect = (effect: { id: string; name: string; costFragments: number }) => {
    const currentCapsuleState = capsuleStateRef.current;

    if (
      currentCapsuleState.ownedAtmosphereEffectIds.includes(effect.id) ||
      currentCapsuleState.blueprintFragments < effect.costFragments
    ) {
      return false;
    }

    const nextCapsuleState = {
      ...currentCapsuleState,
      blueprintFragments: currentCapsuleState.blueprintFragments - effect.costFragments,
      ownedAtmosphereEffectIds: [...currentCapsuleState.ownedAtmosphereEffectIds, effect.id],
      activeAtmosphereEffectIds: [
        ...new Set([...(currentCapsuleState.activeAtmosphereEffectIds ?? []), effect.id]),
      ],
    };

    capsuleStateRef.current = nextCapsuleState;
    setCapsuleState(nextCapsuleState);
    showToast(`${effect.name} unlocked`);
    return true;
  };

  const toggleAtmosphereEffect = (effectId: string) => {
    const effect = defaultAtmosphereEffects.find((entry) => entry.id === effectId);
    const currentCapsuleState = capsuleStateRef.current;

    if (!effect || !currentCapsuleState.ownedAtmosphereEffectIds.includes(effectId)) {
      showToast(effect ? "Exchange this effect first" : "Scene effect unavailable");
      return;
    }

    const isActive = (currentCapsuleState.activeAtmosphereEffectIds ?? []).includes(effectId);
    updateCapsuleState((current) => ({
      ...current,
      activeAtmosphereEffectIds: isActive
        ? (current.activeAtmosphereEffectIds ?? []).filter((id) => id !== effectId)
        : [...(current.activeAtmosphereEffectIds ?? []), effectId],
    }));
    showToast(`${effect.name} ${isActive ? "off" : "on"}`);
  };

  const capsuleButton =
    summaryTab === "overview" || isSelectedDayToday ? (
      <CapsuleMachineButton
        buttonMode="compact"
        routes={routes}
        currentFragments={currentBlueprintFragments}
        currentStamps={state.currentStamps}
        drawCostLabel={`${CAPSULE_DRAW_COST_STAMPS} Stamps`}
        isDrawDisabled={state.currentStamps < CAPSULE_DRAW_COST_STAMPS}
        drawDisabledReason={
          state.currentStamps < CAPSULE_DRAW_COST_STAMPS
            ? `Need ${CAPSULE_DRAW_COST_STAMPS - state.currentStamps} more Stamps`
            : undefined
        }
        unlockedRouteIds={capsuleUnlockedRouteIds}
        ownedAtmosphereEffectIds={ownedAtmosphereEffectIds}
        onConsumeDrawCost={() => {
          const result = spendStamps(CAPSULE_DRAW_COST_STAMPS, "Capsule spin");
          if (!result.success) {
            showToast(result.message);
          }
          return result;
        }}
        onRouteTicketWon={(route) => {
          updateCapsuleState((current) => ({
            ...current,
            capsuleRouteTicketIds: current.capsuleRouteTicketIds.includes(route.id)
              ? current.capsuleRouteTicketIds
              : [...current.capsuleRouteTicketIds, route.id],
          }));
          showToast(`${route.name} ticket added`);
        }}
        onDecorationWon={(decoration) => {
          updateCapsuleState((current) => ({
            ...current,
            capsuleDecorationItems: [
              ...current.capsuleDecorationItems,
              {
                instanceId: crypto.randomUUID(),
                decorationId: decoration.id,
              },
            ],
          }));
          showToast(`${decoration.name} stored in inventory`);
        }}
        onFragmentsGained={(fragments) => {
          updateCapsuleState((current) => ({
            ...current,
            blueprintFragments: current.blueprintFragments + fragments,
          }));
          showToast(`+${fragments} blueprint fragment${fragments > 1 ? "s" : ""}`);
        }}
        onExchangeAtmosphereEffect={exchangeCapsuleAtmosphereEffect}
      />
    ) : null;

  const activeInfoAsset = infoItem ? assetMap.get(infoItem.landmarkId) ?? null : null;
  const memoryContent = activeInfoAsset ? getMemoryContent(activeInfoAsset, unlockEventMap.get(activeInfoAsset.id) ?? null) : null;

  const handleToggleArrange = () => {
    if (arrangeDisabled) {
      showToast("Past lawns are read-only");
      return;
    }

    if (isEditMode) {
      saveMyScapeLayout(activeLayoutScopeKey, serializeMyScapeLayout(placedLandmarks));
      setIsEditMode(false);
      setActionMenuItemId(null);
      setInfoItemId(null);
      showToast("Lawn arrangement saved");
      return;
    }

    setIsEditMode(true);
    setInfoItemId(null);
    setActionMenuItemId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen overflow-hidden bg-[#f6f3ec] text-ink"
    >
      <ScapeBoardStage
        viewKey={boardViewKey}
        transitionDirection={summaryTab === "day" ? dayTransitionDirection : 0}
        boardRef={boardRef}
        assets={liveCatalogAssets}
        placedLandmarks={placedLandmarks}
        selectedId={selectedId}
        draggingId={draggingId}
        dragPreview={dragPreview}
        entryReady={entryReady}
        placementPreview={placementPreview}
        isEditMode={isEditMode}
        newTodayIds={newTodayIds}
        onItemPointerDown={handleItemPointerDown}
        onSelectItem={handleSelectItem}
      />

      <MyScapeAtmosphereLayer activeEffectIds={activeAtmosphereEffectIds} />

      <MyScapeHeaderControls
        arrangeActive={isEditMode}
        arrangeDisabled={arrangeDisabled}
        hasNewItems={summaryTab === "overview" || isSelectedDayToday ? newUnplacedCount > 0 : false}
        onBack={() => navigate(-1)}
        onToggleArrange={handleToggleArrange}
      />

      {summaryTab === "day" ? (
        <MyScapeDayDateSwitcher
          canGoNext={!isSelectedDayToday}
          dateLabel={formatDaySwitcherDate(selectedDayDate)}
          direction={dayTransitionDirection}
          subtitle={formatDaySwitcherSubtitle(selectedDayDate)}
          emptyLabel={null}
          onOpenPicker={() => setIsDatePickerOpen(true)}
          onPrevious={goToPreviousDay}
          onNext={goToNextDay}
        />
      ) : null}

      <AnimatePresence>
        {!isEditMode ? (
          <FloatingStatsText
            key={`${summaryTab}-${selectedDayKey}`}
            tab={summaryTab}
            distanceLabel={formatDistance(activeStats.distanceKm)}
            runsLabel={`${activeStats.runCount}`}
            unlocksLabel={`${activeStats.unlockCount}`}
          />
        ) : null}
      </AnimatePresence>

      <NewUnlockToast message={toastMessage} />

      {actionMenuItemId ? (
        <button
          type="button"
          aria-label="Dismiss item actions"
          className="absolute inset-0 z-20 bg-transparent"
          onClick={() => setActionMenuItemId(null)}
        />
      ) : null}

      <ItemMemoryCard
        open={Boolean(memoryContent)}
        title={memoryContent?.title ?? ""}
        itemType={memoryContent?.itemType ?? ""}
        sourceLabel={memoryContent?.sourceLabel ?? ""}
        unlockDateLabel={memoryContent?.unlockDateLabel ?? null}
        detail={memoryContent?.detail ?? null}
        subtitle={memoryContent?.subtitle ?? null}
        onClose={() => setInfoItemId(null)}
      />

      <ItemActionMenu
        open={isEditMode && Boolean(actionMenuItemId)}
        onMove={() => setActionMenuItemId(null)}
        onInfo={() => {
          setInfoItemId(actionMenuItemId);
          setActionMenuItemId(null);
        }}
      />

      <AnimatePresence mode="wait">
        {isEditMode ? (
          <ArrangeInventoryTray
            key="inventory"
            ref={inventoryTrayRef}
            items={inventoryItems}
            atmosphereEffects={atmosphereEffectItems}
            isReturnDropActive={isInventoryDropActive}
            onToggleAtmosphereEffect={toggleAtmosphereEffect}
            onSelectItem={(assetId) => {
              const asset = scopedCatalogAssets.find((entry) => entry.id === assetId);
              const ownedCount = asset?.assetType === "landmark" ? Math.min(1, asset?.ownedCount ?? 0) : asset?.ownedCount ?? 0;
              if (!asset || ownedCount <= 0) {
                showToast(asset ? `Locked: unlock from ${asset.routeName}` : "Locked");
                return;
              }
              if (summaryTab === "day" && asset.routeId !== CAPSULE_ROUTE_ID && !dayRouteIds.has(asset.routeId)) {
                showToast(asset ? `${asset.name} was collected earlier` : "Collected earlier");
                return;
              }
              const placedCount = placedCountsByAssetId[assetId] ?? 0;
              const availableCount = Math.max(0, ownedCount - placedCount);

              if (availableCount <= 0) {
                focusPlacedAsset(assetId);
                return;
              }

              placeAssetOnBoard(assetId);
            }}
          />
        ) : (
          <motion.div
            key="tabs"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <ScapeBottomTabs activeTab={summaryTab} onChange={setSummaryTab} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isEditMode ? (
        <button
          type="button"
          onClick={() => setIsSharePanelOpen(true)}
          className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+86px)] right-4 z-40 inline-flex h-[52px] w-[52px] items-center justify-center rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(238,233,224,0.96))] text-[#314238] shadow-[0_16px_34px_rgba(45,62,53,0.2)] ring-1 ring-[#e4ddcf] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(45,62,53,0.24)]"
          aria-label="Share My Scape"
        >
          <Share2 className="h-5 w-5" />
        </button>
      ) : null}

      <AnimatePresence>
        {isDatePickerOpen ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(31,40,35,0.42)] px-5 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 h-full w-full cursor-default"
              aria-label="Close date picker"
              onClick={() => setIsDatePickerOpen(false)}
            />
            <motion.section
              className="relative z-10 w-full max-w-[350px] rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,#fbf7ef,#f0eadf)] p-5 text-ink shadow-[0_26px_70px_rgba(35,52,40,0.22)]"
              initial={{ y: 18, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 190, damping: 22 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-sage-500">Jump Date</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.06em]">Choose a lawn</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/76 text-sage-700 ring-1 ring-sage-900/10"
                  aria-label="Close date picker"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <label className="mt-5 block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-500">Date</span>
                <input
                  type="date"
                  value={datePickerValue}
                  max={getMyScapeDateKey(todayDate)}
                  onChange={(event) => setDatePickerValue(event.target.value)}
                  className="mt-2 w-full rounded-[20px] border border-white/70 bg-white/76 px-4 py-3 text-base font-semibold text-[#314238] shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] outline-none ring-1 ring-sage-900/8 focus:ring-2 focus:ring-[#8ea292]"
                />
              </label>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Today", offset: 0 },
                  { label: "7 Days", offset: -7 },
                  { label: "30 Days", offset: -30 },
                ].map((shortcut) => (
                  <button
                    key={shortcut.label}
                    type="button"
                    onClick={() => {
                      const next = new Date(todayDate);
                      next.setDate(todayDate.getDate() + shortcut.offset);
                      setDatePickerValue(getMyScapeDateKey(next));
                    }}
                    className="rounded-full bg-white/62 px-3 py-2 text-xs font-semibold text-sage-700 ring-1 ring-white/80"
                  >
                    {shortcut.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const parsedDate = parseDateKeyAsLocalDate(datePickerValue);
                  if (!parsedDate) {
                    showToast("Choose a valid date");
                    return;
                  }

                  jumpToDay(parsedDate);
                  setIsDatePickerOpen(false);
                }}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#556a5f,#72877b)] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(77,97,86,0.18)]"
              >
                <CalendarDays className="h-4 w-4" />
                Go to Date
              </button>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isSharePanelOpen ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(31,40,35,0.46)] px-5 py-5 backdrop-blur-[7px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 h-full w-full cursor-default"
              aria-label="Close share preview"
              onClick={() => setIsSharePanelOpen(false)}
            />
            <motion.section
              className="relative z-10 flex h-[min(94dvh,760px)] w-full max-w-[390px] flex-col overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,#fbf7ef,#eee9dc)] text-ink shadow-[0_30px_80px_rgba(35,52,40,0.26)]"
              initial={{ y: 18, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 190, damping: 22 }}
            >
              <div className="flex items-start justify-between gap-3 border-b border-sage-900/8 px-5 pb-4 pt-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-sage-500">Share Card</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.06em]">{shareTitle}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSharePanelOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/76 text-sage-700 ring-1 ring-sage-900/10"
                  aria-label="Close share preview"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div
                  className="overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#eef4ec,#dbe7d8)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] ring-1 ring-white/80"
                >
                  <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#f8f5ee_0%,#edf2e8_70%,#e2eadf_100%)]">
                    <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pt-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sage-500">MileScape</p>
                        <h3 className="mt-1 max-w-[190px] text-xl font-semibold leading-none tracking-[-0.06em] text-[#2c3a33]">
                          {summaryTab === "day" ? formatDaySwitcherDate(selectedDayDate) : "My Scape"}
                        </h3>
                      </div>
                      <div className="rounded-full bg-white/72 px-3 py-1.5 text-[11px] font-bold text-sage-700 ring-1 ring-white/80">
                        {placedLandmarks.length} placed
                      </div>
                    </div>

                    <div className="flex h-[430px] justify-center overflow-hidden pt-8">
                      <div className="pointer-events-none h-[620px] w-[560px] shrink-0 origin-top scale-[0.6]">
                        <MyScapeBoard
                          boardRef={sharePreviewBoardRef}
                          assets={liveCatalogAssets}
                          placedLandmarks={placedLandmarks}
                          selectedId={null}
                          draggingId={null}
                          entryReady
                          dragPreview={null}
                          placementPreview={null}
                          isEditMode={false}
                          newTodayIds={new Set()}
                          expanded
                          onItemPointerDown={() => undefined}
                          onSelectItem={() => undefined}
                        />
                      </div>
                    </div>

                    <div className="absolute inset-x-3 bottom-3 z-10 grid grid-cols-3 gap-2">
                      <div className="rounded-[16px] bg-white/82 px-3 py-2 ring-1 ring-white/80">
                        <p className="text-[9px] uppercase tracking-[0.16em] text-sage-500">Distance</p>
                        <p className="mt-1 text-sm font-bold text-[#2c3a33]">{formatDistance(activeStats.distanceKm)}</p>
                      </div>
                      <div className="rounded-[16px] bg-white/82 px-3 py-2 ring-1 ring-white/80">
                        <p className="text-[9px] uppercase tracking-[0.16em] text-sage-500">Runs</p>
                        <p className="mt-1 text-sm font-bold text-[#2c3a33]">{activeStats.runCount}</p>
                      </div>
                      <div className="rounded-[16px] bg-white/82 px-3 py-2 ring-1 ring-white/80">
                        <p className="text-[9px] uppercase tracking-[0.16em] text-sage-500">Unlocks</p>
                        <p className="mt-1 text-sm font-bold text-[#2c3a33]">{activeStats.unlockCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 rounded-[20px] bg-white/62 px-4 py-3 text-sm leading-6 text-sage-700">{shareText}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-sage-900/8 p-4">
                <button
                  type="button"
                  onClick={handleSaveShareImage}
                  disabled={shareActionInProgress !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#556a5f,#72877b)] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(77,97,86,0.18)]"
                >
                  <Download className="h-4 w-4" />
                  {shareActionInProgress === "save" ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={shareActionInProgress !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#7b8f82,#5f7568)] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(77,97,86,0.16)]"
                >
                  <Share2 className="h-4 w-4" />
                  {shareActionInProgress === "share" ? "Sharing..." : "Share"}
                </button>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!isEditMode && capsuleButton ? (
        <div className="absolute left-4 top-[calc(env(safe-area-inset-top,0px)+9.25rem)] z-40">{capsuleButton}</div>
      ) : null}
    </motion.div>
  );
};
