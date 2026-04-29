import { Check, ChevronLeft, ChevronRight, Grid3X3, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { MyScapeBoard } from "../components/myscape/MyScapeBoard";
import { useAppState } from "../hooks/useAppState";
import type { MyScapePlacedLandmark } from "../types";
import { saveMyScapeLayout } from "../utils/storage";
import {
  buildMyScapeChartData,
  buildMyScapeUnlockTimeline,
  clampGridPosition,
  createPlacedLandmark,
  formatMyScapePeriodLabel,
  getMyScapeYearDemoAssets,
  getPeriodEnd,
  getPeriodStart,
  getItemZIndex,
  gridToScreen,
  isFuturePeriod,
  isGridCellOccupied,
  MY_SCAPE_GRID_COLUMNS,
  MY_SCAPE_GRID_ROWS,
  resolveUnlockedLandmarkAssets,
  restoreMyScapeLayout,
  screenToGrid,
  serializeMyScapeLayout,
  shiftAnchorDate,
  type MyScapeChartPoint,
  type MyScapeUnlockEvent,
  type MyScapeViewMode,
} from "../utils/myScape";

const viewModes: Array<{ key: MyScapeViewMode; label: string }> = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const formatDistance = (value: number) => `${Number(value.toFixed(1))} km`;
const MY_SCAPE_ZOOM_MIN = 0.82;
const MY_SCAPE_ZOOM_MAX = 1.28;
const MY_SCAPE_ZOOM_STEP = 0.08;

const getPeriodSummaryText = (mode: MyScapeViewMode) => {
  if (mode === "day") {
    return "Today's running memory";
  }
  if (mode === "week") {
    return "This week's running memory";
  }
  if (mode === "month") {
    return "This month's running memory";
  }
  return "This year's running memory";
};

const getLawnTitle = (mode: MyScapeViewMode, anchorDate: Date) => {
  if (mode === "day") {
    return "Today's Lawn";
  }
  if (mode === "week") {
    return "Week's Lawn";
  }
  if (mode === "month") {
    return `${anchorDate.toLocaleDateString("en-US", { month: "long" })}'s Lawn`;
  }
  return `${anchorDate.getFullYear()}'s Lawn`;
};

const MyScapeChartCard = ({
  title,
  points,
  emptyText,
}: {
  title: string;
  points: MyScapeChartPoint[];
  emptyText: string;
}) => {
  const maxValue = Math.max(...points.map((point) => point.value), 0);
  const visiblePoints =
    points.length > 12 ? points.filter((_, index) => index % Math.ceil(points.length / 12) === 0).slice(0, 12) : points;

  return (
    <section className="rounded-[24px] bg-white/82 px-4 py-4 shadow-[0_16px_38px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {maxValue <= 0 ? (
        <div className="mt-4 flex h-[180px] items-center justify-center rounded-[18px] bg-sage-50/70 text-sm text-sage-500">
          {emptyText}
        </div>
      ) : (
        <div className="mt-4">
          <div
            className="grid h-[180px] items-end gap-1 rounded-[18px] bg-sage-50/70 px-3 pb-3 pt-6"
            style={{ gridTemplateColumns: `repeat(${Math.max(visiblePoints.length, 1)}, minmax(0, 1fr))` }}
          >
            {visiblePoints.map((point) => (
              <div key={point.label} className="flex min-w-0 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-full bg-[linear-gradient(180deg,rgba(189,208,192,0.95)_0%,rgba(78,98,88,1)_100%)]"
                  style={{ height: `${Math.max(8, (point.value / maxValue) * 120)}px` }}
                />
                <span className="w-full text-center text-[9px] leading-3 text-sage-500">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export const MyScapePage = () => {
  const { routes, state } = useAppState();
  const [viewMode, setViewMode] = useState<MyScapeViewMode>("day");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [boardZoom, setBoardZoom] = useState(1);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null);
  const [placedLandmarks, setPlacedLandmarks] = useState<MyScapePlacedLandmark[]>(() => restoreMyScapeLayout());
  const [yearDemoLandmarks, setYearDemoLandmarks] = useState<MyScapePlacedLandmark[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    itemId: string;
    pointerOffsetX: number;
    pointerOffsetY: number;
    previousCol: number;
    previousRow: number;
  } | null>(null);
  const today = new Date();

  const unlockedAssets = useMemo(
    () => resolveUnlockedLandmarkAssets(routes, state.routeProgress),
    [routes, state.routeProgress],
  );
  const yearDemoAssets = useMemo(() => getMyScapeYearDemoAssets(), []);
  const assets = useMemo(() => (viewMode === "year" ? yearDemoAssets : unlockedAssets), [unlockedAssets, viewMode, yearDemoAssets]);
  const assetIds = useMemo(() => new Set(unlockedAssets.map((asset) => asset.id)), [unlockedAssets]);

  useEffect(() => {
    setPlacedLandmarks((current) => {
      const seen = new Set<string>();
      return current.filter((item) => {
        if (!assetIds.has(item.landmarkId) || seen.has(item.landmarkId)) {
          return false;
        }

        seen.add(item.landmarkId);
        return true;
      });
    });
  }, [assetIds]);

  useEffect(() => {
    if (viewMode !== "year") {
      return;
    }

    const layout = [
      { id: "tokyo-tower", col: 2, row: 2, scale: 1.02 },
      { id: "eiffel-tower-demo", col: 3, row: 1, scale: 0.98 },
      { id: "london-bridge-demo", col: 4, row: 0, scale: 1.06 },
      { id: "statue-of-liberty", col: 1, row: 3, scale: 1.06 },
      { id: "shibuya", col: 3, row: 2, scale: 1.26 },
      { id: "eiffel-tower-demo", col: 5, row: 2, scale: 0.96 },
      { id: "statue-of-liberty", col: 6, row: 1, scale: 1.12 },
      { id: "senso-ji", col: 6, row: 3, scale: 1.02 },
      { id: "big-ben-demo", col: 2, row: 5, scale: 1.02 },
      { id: "sydney-opera-demo", col: 4, row: 6, scale: 1.04 },
      { id: "big-ben-demo", col: 5, row: 5, scale: 1.04 },
    ] as const;

    setYearDemoLandmarks(
      layout.map((entry, index) => ({
        id: `year-demo-${entry.id}-${index}`,
        landmarkId: entry.id,
        col: entry.col,
        row: entry.row,
        scale: entry.scale,
        zIndex: getItemZIndex(entry.col, entry.row),
      })),
    );
  }, [viewMode]);

  useEffect(() => {
    const activeLandmarks = viewMode === "year" ? yearDemoLandmarks : placedLandmarks;
    if (!selectedId || activeLandmarks.some((item) => item.id === selectedId)) {
      return;
    }

    setSelectedId(null);
  }, [placedLandmarks, selectedId, viewMode, yearDemoLandmarks]);

  const unlockTimeline = useMemo(
    () => buildMyScapeUnlockTimeline(routes, state.runHistory),
    [routes, state.runHistory],
  );

  const periodStart = useMemo(() => getPeriodStart(anchorDate, viewMode), [anchorDate, viewMode]);
  const periodEnd = useMemo(() => getPeriodEnd(anchorDate, viewMode), [anchorDate, viewMode]);

  const runsInPeriod = useMemo(
    () =>
      state.runHistory.filter((entry) => {
        const completedAt = new Date(entry.completedAt).getTime();
        return completedAt >= periodStart.getTime() && completedAt < periodEnd.getTime();
      }),
    [periodEnd, periodStart, state.runHistory],
  );

  const unlocksInPeriod = useMemo(
    () =>
      unlockTimeline.filter((entry) => {
        const unlockedAt = new Date(entry.unlockedAt).getTime();
        return unlockedAt >= periodStart.getTime() && unlockedAt < periodEnd.getTime();
      }),
    [periodEnd, periodStart, unlockTimeline],
  );

  const totalDistanceKm = runsInPeriod.reduce((sum, entry) => sum + entry.distanceKm, 0);
  const runCount = runsInPeriod.length;
  const chartData = useMemo(
    () => buildMyScapeChartData(state.runHistory, anchorDate, viewMode),
    [anchorDate, state.runHistory, viewMode],
  );
  const nextPeriodDisabled = isFuturePeriod(shiftAnchorDate(anchorDate, viewMode, 1), viewMode);
  const selectedItem = useMemo(
    () => (viewMode === "year" ? yearDemoLandmarks : placedLandmarks).find((item) => item.id === selectedId) ?? null,
    [placedLandmarks, selectedId, viewMode, yearDemoLandmarks],
  );

  useEffect(() => {
    if (viewMode === "year") {
      return;
    }

    const board = boardRef.current;
    if (!board) {
      return;
    }

    setPlacedLandmarks((current) =>
      unlockedAssets.reduce((next, asset) => {
        if (!asset.imageSrc || !assetIds.has(asset.id) || next.some((item) => item.landmarkId === asset.id)) {
          return next;
        }

        return [
          ...next,
          createPlacedLandmark(asset.id, next, asset.defaultScale ?? 1),
        ];
      }, current),
    );
  }, [assetIds, unlockedAssets]);

  useEffect(() => {
    if (viewMode === "year") {
      return;
    }

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
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "year") {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      saveMyScapeLayout(serializeMyScapeLayout(placedLandmarks));
    }, 120);

    return () => window.clearTimeout(saveTimer);
  }, [placedLandmarks]);

  const handleItemPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => {
    if (!isEditMode || viewMode === "year") {
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

    const anchorPoint = gridToScreen(item.col, item.row, board.clientWidth, board.clientHeight);
    const localPointerX = (event.clientX - boardRect.left) / boardZoom;
    const localPointerY = (event.clientY - boardRect.top) / boardZoom;
    dragStateRef.current = {
      itemId,
      pointerOffsetX: localPointerX - anchorPoint.x,
      pointerOffsetY: localPointerY - anchorPoint.y,
      previousCol: item.col,
      previousRow: item.row,
    };
    setDraggingId(itemId);
    setDragPreview(anchorPoint);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const board = boardRef.current;
      const dragState = dragStateRef.current;
      if (!board || !dragState || viewMode === "year") {
        return;
      }
      
      const boardRect = board.getBoundingClientRect();
      const localPointerX = (event.clientX - boardRect.left) / boardZoom;
      const localPointerY = (event.clientY - boardRect.top) / boardZoom;
      setDragPreview({
        x: localPointerX - dragState.pointerOffsetX,
        y: localPointerY - dragState.pointerOffsetY,
      });
    };

    const handlePointerUp = () => {
      const board = boardRef.current;
      const dragState = dragStateRef.current;
      
      if (!board || !dragState || viewMode === "year") {
        dragStateRef.current = null;
        setDraggingId(null);
        setDragPreview(null);
        return;
      }

      const finalPreview = dragPreview ?? gridToScreen(dragState.previousCol, dragState.previousRow, board.clientWidth, board.clientHeight);
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
            // TODO: Replace this single-cell fallback when multi-cell landmarks/decorations are introduced.
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
      
      dragStateRef.current = null;
      setDraggingId(null);
      setDragPreview(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [boardZoom, dragPreview, viewMode]);

  const placementPreview = useMemo(() => {
    if (!isEditMode || viewMode === "year") {
      return null;
    }

    if (draggingId && dragPreview && boardRef.current) {
      const snapped = screenToGrid(dragPreview.x, dragPreview.y, boardRef.current.clientWidth, boardRef.current.clientHeight);
      const clamped = clampGridPosition(snapped.col, snapped.row);
      const valid = !isGridCellOccupied(clamped.col, clamped.row, placedLandmarks, draggingId);
      return {
        col: clamped.col,
        row: clamped.row,
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
  }, [dragPreview, draggingId, isEditMode, placedLandmarks, selectedItem, viewMode]);

  const displayedLandmarks = viewMode === "year" ? yearDemoLandmarks : placedLandmarks;

  return (
    <div className="-mx-4 -mt-[calc(5.4rem+1.95rem)] h-screen overflow-hidden bg-[linear-gradient(180deg,#f3f1eb_0%,#f6f4ef_100%)] text-ink">
      <section className="relative h-[64vh] min-h-[520px] overflow-hidden">
        <MyScapeBoard
          boardRef={boardRef}
          assets={assets}
          placedLandmarks={displayedLandmarks}
          selectedId={selectedId}
          draggingId={draggingId}
          dragPreview={dragPreview}
          placementPreview={placementPreview}
          isEditMode={isEditMode && viewMode !== "year"}
          zoom={viewMode === "year" ? 1 : boardZoom}
          expanded={viewMode === "year"}
          onItemPointerDown={handleItemPointerDown}
          onSelectItem={setSelectedId}
        />
        {viewMode !== "year" ? (
          <div className="absolute inset-x-5 top-[calc(env(safe-area-inset-top,0px)+5.75rem)] z-20 flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-1 rounded-full bg-white/82 px-2 py-2 text-[#34463b] shadow-[0_18px_36px_rgba(35,52,40,0.12)] ring-1 ring-white/80 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setBoardZoom((current) => Math.max(MY_SCAPE_ZOOM_MIN, Number((current - MY_SCAPE_ZOOM_STEP).toFixed(2))))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-50/80 text-sage-700 transition hover:bg-sage-100"
                aria-label="Zoom out lawn"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="min-w-[4.2rem] text-center">
                <p className="text-[10px] uppercase tracking-[0.22em] text-sage-500">Zoom</p>
                <p className="text-sm font-semibold text-[#34463b]">{Math.round(boardZoom * 100)}%</p>
              </div>
              <button
                type="button"
                onClick={() => setBoardZoom((current) => Math.min(MY_SCAPE_ZOOM_MAX, Number((current + MY_SCAPE_ZOOM_STEP).toFixed(2))))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-50/80 text-sage-700 transition hover:bg-sage-100"
                aria-label="Zoom in lawn"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsEditMode((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-[0_18px_36px_rgba(35,52,40,0.12)] ring-1 backdrop-blur-xl transition ${
                isEditMode
                  ? "bg-[linear-gradient(180deg,rgba(72,95,81,0.96),rgba(49,69,58,0.96))] text-white ring-white/30"
                  : "bg-white/82 text-[#34463b] ring-white/80"
              }`}
            >
              {isEditMode ? <Check className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              {isEditMode ? "Done Arranging" : "Arrange"}
            </button>
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(243,241,235,0)_0%,rgba(243,241,235,0.96)_100%)]" />
      </section>

      <section className="relative z-10 -mt-8 h-[44vh] min-h-[200px] rounded-t-[38px] bg-[linear-gradient(180deg,rgba(247,245,239,0.98),rgba(244,241,234,1))] px-6 pb-10 pt-6 shadow-[0_-20px_40px_rgba(35,52,40,0.08)] ring-1 ring-white/75">
        <div className="mx-auto flex h-full max-w-md flex-col overflow-y-auto overscroll-contain pr-1">
          <div className="mb-8 space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-sage-500">My Scape</p>
            <h1 className="font-destination-display text-[3rem] leading-[0.92] tracking-[0.01em] text-[#2e3e35]">
              {getLawnTitle(viewMode, anchorDate)}
            </h1>
            {viewMode !== "year" ? (
              <p className="max-w-[24rem] text-sm leading-6 text-sage-600">
                {isEditMode
                  ? `Drag items across the ${MY_SCAPE_GRID_COLUMNS}×${MY_SCAPE_GRID_ROWS} isometric lawn. They snap into place when you release.`
                  : "Unlock landmarks through runs, then enter Arrange mode to curate your lawn."}
              </p>
            ) : null}
          </div>

          <section className="rounded-[26px] bg-white/84 p-2 shadow-[0_18px_40px_rgba(35,52,40,0.08)] ring-1 ring-white/88 backdrop-blur-xl">
            <div className="grid grid-cols-4 gap-2">
              {viewModes.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => {
                    setViewMode(mode.key);
                    setAnchorDate(today);
                  }}
                  className={`rounded-[16px] px-3 py-3 text-sm font-medium transition ${
                    viewMode === mode.key
                      ? "bg-[linear-gradient(180deg,#5f7567,#42574b)] text-white shadow-[0_14px_24px_rgba(45,62,53,0.16)]"
                      : "bg-sage-50/70 text-sage-500"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAnchorDate((current) => shiftAnchorDate(current, viewMode, -1))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/72 text-sage-700 ring-1 ring-[#e6e0d4]"
                aria-label="View previous period"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-center">
                <p className="text-xl font-semibold tracking-[-0.03em] text-[#2f3f35]">{formatMyScapePeriodLabel(anchorDate, viewMode)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-sage-500">{getPeriodSummaryText(viewMode)}</p>
              </div>

              <button
                type="button"
                onClick={() => setAnchorDate((current) => shiftAnchorDate(current, viewMode, 1))}
                disabled={nextPeriodDisabled}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/72 text-sage-700 ring-1 ring-[#e6e0d4] disabled:opacity-35"
                aria-label="View next period"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-[26px] bg-white/58 px-4 py-4 ring-1 ring-white/75">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-sage-500">Distance</p>
                <p className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[#2f3f35]">{formatDistance(totalDistanceKm)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-sage-500">Runs</p>
                <p className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[#2f3f35]">{runCount}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-sage-500">Unlocks</p>
                <p className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-[#2f3f35]">{unlocksInPeriod.length}</p>
              </div>
            </div>
          </section>
          </div>

          <MyScapeChartCard title="Distance Distribution" points={chartData} emptyText="No run data in this period" />

          <section className="mt-4 rounded-[24px] bg-white/82 px-4 py-4 shadow-[0_16px_38px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-ink">Unlocked This Period</h3>
            {unlocksInPeriod.length > 0 ? (
              <div className="mt-4 space-y-3">
                {unlocksInPeriod
                  .slice(-3)
                  .reverse()
                  .map((item: MyScapeUnlockEvent) => (
                    <div key={`${item.id}-${item.unlockedAt}`} className="rounded-[18px] bg-sage-50/70 px-4 py-3">
                      <p className="text-sm font-semibold text-ink">{item.name}</p>
                      <p className="mt-1 text-xs text-sage-600">
                        {item.routeName} · {item.city}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[18px] bg-sage-50/70 px-4 py-6 text-sm text-sage-500">
                No new landmarks unlocked in this period.
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
};
