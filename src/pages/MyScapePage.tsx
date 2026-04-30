import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrangeInventoryTray } from "../components/myscape/ArrangeInventoryTray";
import { FloatingStatsText } from "../components/myscape/FloatingStatsText";
import { ItemActionMenu } from "../components/myscape/ItemActionMenu";
import { ItemMemoryCard } from "../components/myscape/ItemMemoryCard";
import { MyScapeDayDateSwitcher } from "../components/myscape/MyScapeDayDateSwitcher";
import { MyScapeHeaderControls } from "../components/myscape/MyScapeHeaderControls";
import { NewUnlockToast } from "../components/myscape/NewUnlockToast";
import { ScapeBoardStage } from "../components/myscape/ScapeBoardStage";
import { ScapeBottomTabs, type ScapeSummaryTab } from "../components/myscape/ScapeBottomTabs";
import { useAppState } from "../hooks/useAppState";
import type { MyScapePlacedLandmark } from "../types";
import { saveMyScapeLayout, savePlacedAssetIds } from "../utils/storage";
import {
  buildMyScapeUnlockTimeline,
  clampGridPosition,
  createPlacedLandmark,
  getMyScapeDateKey,
  getItemZIndex,
  gridToScreen,
  isGridCellOccupied,
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
  const { routes, state } = useAppState();
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
  const initialDayScopeKey = `day:${getMyScapeDateKey(todayDate)}`;
  const [placedLandmarks, setPlacedLandmarks] = useState<MyScapePlacedLandmark[]>(() => restoreMyScapeLayout(initialDayScopeKey));
  const [loadedLayoutScopeKey, setLoadedLayoutScopeKey] = useState(initialDayScopeKey);
  const [placedAssetIds, setPlacedAssetIds] = useState<Set<string>>(() => new Set(restorePlacedAssetIds()));
  const boardRef = useRef<HTMLDivElement>(null);
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
  const unlockedAssets = useMemo(() => catalogAssets.filter((asset) => (asset.ownedCount ?? 0) > 0), [catalogAssets]);
  const assetIds = useMemo(() => new Set(catalogAssets.map((asset) => asset.id)), [catalogAssets]);
  const assetMap = useMemo(() => new Map(catalogAssets.map((asset) => [asset.id, asset])), [catalogAssets]);
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
        if (typeof item.col === "number" && typeof item.row === "number") {
          const normalized = clampGridPosition(item.col, item.row);
          const hasConflict = isGridCellOccupied(normalized.col, normalized.row, items, item.id);

          if (!hasConflict && normalized.col === item.col && normalized.row === item.row) {
            return {
              ...item,
              zIndex: getItemZIndex(item.col, item.row),
            };
          }
        }

        const fallback = createPlacedLandmark(item.landmarkId, current.slice(0, index), item.scale);
        return {
          ...item,
          col: fallback.col,
          row: fallback.row,
          zIndex: getItemZIndex(fallback.col, fallback.row),
        };
      }),
    );
  }, []);

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
    if (summaryTab === "day" && !isSelectedDayToday && isEditMode) {
      setIsEditMode(false);
      setActionMenuItemId(null);
      setInfoItemId(null);
    }
  }, [isEditMode, isSelectedDayToday, summaryTab]);

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

    const anchorPoint = gridToScreen(item.col, item.row, board.clientWidth, board.clientHeight);
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

      const finalPreview =
        dragPreview ?? gridToScreen(dragState.previousCol, dragState.previousRow, board.clientWidth, board.clientHeight);
      const snappedGrid = clampGridPosition(
        ...(() => {
          const grid = screenToGrid(finalPreview.x, finalPreview.y, board.clientWidth, board.clientHeight);
          return [grid.col, grid.row] as const;
        })(),
      );

      setPlacedLandmarks((current) =>
        current.map((item) => {
          if (item.id !== dragState.itemId) {
            return item;
          }

          if (isGridCellOccupied(snappedGrid.col, snappedGrid.row, current, item.id)) {
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
      const snapped = screenToGrid(dragPreview.x, dragPreview.y, boardRef.current.clientWidth, boardRef.current.clientHeight);
      const clampedGrid = clampGridPosition(snapped.col, snapped.row);
      const valid = !isGridCellOccupied(clampedGrid.col, clampedGrid.row, placedLandmarks, draggingId);
      return {
        col: clampedGrid.col,
        row: clampedGrid.row,
        valid,
        active: true,
      };
    }

    if (selectedItem) {
      return {
        col: selectedItem.col,
        row: selectedItem.row,
        valid: true,
        active: false,
      };
    }

    return null;
  }, [dragPreview, draggingId, isEditMode, placedLandmarks, selectedItem]);

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
  const scopedCatalogAssets = useMemo(() => catalogAssets, [catalogAssets]);

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
        unlockCount: catalogAssets.filter((asset) => (asset.ownedCount ?? 0) > 0).length,
      },
    }),
    [catalogAssets, dayRuns, dayUnlocks.length, state.runHistory],
  );

  const activeStats = summaryStats[summaryTab];
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
          const isCollectedOnly = summaryTab === "day" && isUnlocked && !dayRouteIds.has(asset.routeId);
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
                return `×${availableCount} LEFT`;
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
    const asset = unlockedAssets.find((entry) => entry.id === assetId);
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

    const created = createPlacedLandmark(asset.id, placedLandmarks, asset.defaultScale ?? 1);
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
        assets={unlockedAssets}
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
            isReturnDropActive={isInventoryDropActive}
            onSelectItem={(assetId) => {
              const asset = scopedCatalogAssets.find((entry) => entry.id === assetId);
              const ownedCount = asset?.assetType === "landmark" ? Math.min(1, asset?.ownedCount ?? 0) : asset?.ownedCount ?? 0;
              if (!asset || ownedCount <= 0) {
                showToast(asset ? `Locked: unlock from ${asset.routeName}` : "Locked");
                return;
              }
              if (summaryTab === "day" && !dayRouteIds.has(asset.routeId)) {
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
    </motion.div>
  );
};
