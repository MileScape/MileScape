import { ChevronLeft, ChevronRight, Landmark } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { MyScapeAssetTray } from "../components/myscape/MyScapeAssetTray";
import { MyScapeBoard } from "../components/myscape/MyScapeBoard";
import { MyScapeHeader } from "../components/myscape/MyScapeHeader";
import { MyScapeToolbar } from "../components/myscape/MyScapeToolbar";
import { useAppState } from "../hooks/useAppState";
import type { MyScapePlacedLandmark } from "../types";
import {
  MY_SCAPE_MAX_SCALE,
  MY_SCAPE_MIN_SCALE,
  buildMyScapeChartData,
  buildMyScapeUnlockTimeline,
  createPlacedLandmark,
  formatMyScapePeriodLabel,
  getNextZIndex,
  getPeriodEnd,
  getPeriodStart,
  isFuturePeriod,
  normalizeBoardPosition,
  resolveUnlockedLandmarkAssets,
  restoreMyScapeLayout,
  serializeMyScapeLayout,
  shiftAnchorDate,
  type MyScapeChartPoint,
  type MyScapeUnlockEvent,
  type MyScapeViewMode,
} from "../utils/myScape";
import { saveMyScapeLayout } from "../utils/storage";

const viewModes: Array<{ key: MyScapeViewMode; label: string }> = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const formatDistance = (value: number) => `${Number(value.toFixed(1))} km`;

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

const MyScapeIsland = ({
  featuredUnlock,
  unlockCount,
  totalDistanceKm,
}: {
  featuredUnlock: MyScapeUnlockEvent | null;
  unlockCount: number;
  totalDistanceKm: number;
}) => {
  return (
    <div className="relative flex h-[320px] items-center justify-center overflow-visible">
      <div className="absolute inset-x-4 top-6 h-24 rounded-full bg-[radial-gradient(circle,rgba(190,213,195,0.36),rgba(190,213,195,0)_72%)] blur-2xl" />
      <div className="absolute bottom-7 left-1/2 h-14 w-[272px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(57,77,63,0.22),rgba(57,77,63,0)_72%)] blur-md" />

      <div className="relative h-[250px] w-[296px]">
        <svg viewBox="0 0 296 250" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="myscape-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e9f0e7" />
              <stop offset="48%" stopColor="#d7e4d5" />
              <stop offset="100%" stopColor="#bdd0c0" />
            </linearGradient>
            <linearGradient id="myscape-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8ea192" />
              <stop offset="100%" stopColor="#6f8374" />
            </linearGradient>
            <linearGradient id="myscape-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7b8f80" />
              <stop offset="100%" stopColor="#607367" />
            </linearGradient>
            <linearGradient id="myscape-soil-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#98866d" />
              <stop offset="100%" stopColor="#7c6b55" />
            </linearGradient>
            <linearGradient id="myscape-soil-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#877662" />
              <stop offset="100%" stopColor="#6e5e4d" />
            </linearGradient>
            <pattern id="myscape-grid" width="37" height="18.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <path d="M 37 0 L 0 0 0 18.5" fill="none" stroke="rgba(96,121,109,0.18)" strokeWidth="1" />
            </pattern>
            <pattern id="myscape-soil-dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="6" fill="rgba(134,115,91,0.24)" />
              <circle cx="23" cy="22" r="5" fill="rgba(171,152,126,0.14)" />
            </pattern>
          </defs>

          <polygon points="148,24 280,94 148,164 16,94" fill="url(#myscape-top)" />
          <polygon points="16,94 148,164 148,222 16,152" fill="url(#myscape-left)" />
          <polygon points="280,94 148,164 148,222 280,152" fill="url(#myscape-right)" />

          <polygon points="16,106 148,176 148,222 16,152" fill="url(#myscape-soil-left)" />
          <polygon points="280,106 148,176 148,222 280,152" fill="url(#myscape-soil-right)" />
          <polygon points="16,106 148,176 148,222 16,152" fill="url(#myscape-soil-dots)" opacity="0.9" />
          <polygon points="280,106 148,176 148,222 280,152" fill="url(#myscape-soil-dots)" opacity="0.78" />

          <polygon points="148,24 280,94 148,164 16,94" fill="url(#myscape-grid)" opacity="0.78" />
          <polygon points="148,24 280,94 148,164 16,94" fill="rgba(255,255,255,0.16)" style={{ filter: "blur(0.5px)" }} />
          <path d="M148 24 L280 94" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
          <path d="M148 24 L16 94" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <path d="M16 94 L148 164 L280 94" fill="none" stroke="rgba(96,121,109,0.24)" strokeWidth="1.5" />
          <path d="M16 94 L16 152 L148 222 L280 152 L280 94" fill="none" stroke="rgba(70,88,52,0.14)" strokeWidth="1.5" />

          <ellipse cx="148" cy="144" rx="36" ry="12" fill="rgba(84,104,91,0.12)" />
        </svg>
      </div>

      {featuredUnlock ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-[34%] flex-col items-center">
          <div className="mb-[-10px] h-5 w-24 rounded-full bg-[radial-gradient(circle,rgba(71,95,80,0.2),rgba(71,95,80,0)_72%)] blur-[2px]" />
          <div className="w-[126px] rounded-[24px] border border-white/78 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(241,244,239,0.98))] px-4 py-4 text-center shadow-[0_18px_36px_rgba(44,62,49,0.14)] backdrop-blur">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,rgba(220,232,221,0.95),rgba(189,208,192,0.95))] text-sage-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
              <Landmark className="h-4 w-4" />
            </div>
            <p className="mt-2 text-[11px] font-semibold leading-4 text-ink">{featuredUnlock.name}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-sage-500">{featuredUnlock.city}</p>
          </div>
        </div>
      ) : null}

      <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs text-sage-600">
        <span>{formatDistance(totalDistanceKm)}</span>
        <span>{unlockCount} unlocks</span>
      </div>
    </div>
  );
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
  const visiblePoints = points.length > 12
    ? points.filter((_, index) => index % Math.ceil(points.length / 12) === 0).slice(0, 12)
    : points;

  return (
    <section className="rounded-[24px] bg-white/82 px-4 py-4 shadow-[0_16px_38px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {maxValue <= 0 ? (
        <div className="mt-4 flex h-[180px] items-center justify-center rounded-[18px] bg-sage-50/70 text-sm text-sage-500">
          {emptyText}
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex h-[180px] items-end gap-1.5 rounded-[18px] bg-sage-50/70 px-3 pb-3 pt-6">
            {visiblePoints.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-full bg-[linear-gradient(180deg,rgba(189,208,192,0.95)_0%,rgba(78,98,88,1)_100%)]"
                  style={{ height: `${Math.max(8, (point.value / maxValue) * 120)}px` }}
                />
                <span className="text-[9px] text-sage-500">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

interface DragState {
  itemId: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

export const MyScapePage = () => {
  const { routes, state } = useAppState();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<MyScapeViewMode>("day");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [placedLandmarks, setPlacedLandmarks] = useState<MyScapePlacedLandmark[]>(() => restoreMyScapeLayout());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const today = new Date();

  const unlockedAssets = useMemo(
    () => resolveUnlockedLandmarkAssets(routes, state.routeProgress),
    [routes, state.routeProgress],
  );
  const unlockedAssetIds = useMemo(() => new Set(unlockedAssets.map((asset) => asset.id)), [unlockedAssets]);

  useEffect(() => {
    setPlacedLandmarks((current) => current.filter((item) => unlockedAssetIds.has(item.landmarkId)));
  }, [unlockedAssetIds]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const selectedExists = placedLandmarks.some((item) => item.id === selectedId);
    if (!selectedExists) {
      setSelectedId(null);
    }
  }, [placedLandmarks, selectedId]);

  useEffect(() => {
    if (!saveMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSaveMessage(null), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [saveMessage]);

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const board = boardRef.current;
      if (!board) {
        return;
      }

      const movingItem = placedLandmarks.find((item) => item.id === dragState.itemId);
      if (!movingItem) {
        return;
      }

      const rect = board.getBoundingClientRect();
      const nextPoint = normalizeBoardPosition(
        {
          x: event.clientX - rect.left - dragState.offsetX,
          y: event.clientY - rect.top - dragState.offsetY,
        },
        rect.width,
        rect.height,
        movingItem.scale,
      );

      setPlacedLandmarks((current) =>
        current.map((item) =>
          item.id === dragState.itemId
            ? { ...item, x: nextPoint.x, y: nextPoint.y }
            : item,
        ),
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId === dragState.pointerId) {
        setDragState(null);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragState, placedLandmarks]);

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
  const featuredUnlock = unlocksInPeriod[unlocksInPeriod.length - 1] ?? null;
  const chartData = useMemo(
    () => buildMyScapeChartData(state.runHistory, anchorDate, viewMode),
    [anchorDate, state.runHistory, viewMode],
  );
  const nextPeriodDisabled = isFuturePeriod(shiftAnchorDate(anchorDate, viewMode, 1), viewMode);
  const placedLandmarkIds = placedLandmarks.map((item) => item.landmarkId);
  const canEditSelection = Boolean(selectedId);

  const handlePlaceAsset = (landmarkId: string) => {
    if (placedLandmarkIds.includes(landmarkId)) {
      const existingItem = placedLandmarks.find((item) => item.landmarkId === landmarkId);
      if (existingItem) {
        setSelectedId(existingItem.id);
      }
      return;
    }

    const boardWidth = boardRef.current?.clientWidth ?? 320;
    const boardHeight = boardRef.current?.clientHeight ?? 430;
    const nextItem = createPlacedLandmark(landmarkId, placedLandmarks, boardWidth, boardHeight);

    setPlacedLandmarks((current) => [...current, nextItem]);
    setSelectedId(nextItem.id);
  };

  const handleItemPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const targetItem = placedLandmarks.find((item) => item.id === itemId);
    if (!targetItem) {
      return;
    }

    const rect = board.getBoundingClientRect();
    const nextZIndex = getNextZIndex(placedLandmarks);

    setPlacedLandmarks((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, zIndex: nextZIndex } : item,
      ),
    );
    setSelectedId(itemId);
    setDragState({
      itemId,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left - targetItem.x,
      offsetY: event.clientY - rect.top - targetItem.y,
    });
  };

  const updateSelectedScale = (direction: "up" | "down") => {
    if (!selectedId || !boardRef.current) {
      return;
    }

    const board = boardRef.current;
    const rect = board.getBoundingClientRect();

    setPlacedLandmarks((current) =>
      current.map((item) => {
        if (item.id !== selectedId) {
          return item;
        }

        const nextScale = direction === "up"
          ? Math.min(MY_SCAPE_MAX_SCALE, Number((item.scale + 0.1).toFixed(2)))
          : Math.max(MY_SCAPE_MIN_SCALE, Number((item.scale - 0.1).toFixed(2)));
        const nextPoint = normalizeBoardPosition(
          { x: item.x, y: item.y },
          rect.width,
          rect.height,
          nextScale,
        );

        return {
          ...item,
          scale: nextScale,
          x: nextPoint.x,
          y: nextPoint.y,
        };
      }),
    );
  };

  const handleRemoveSelection = () => {
    if (!selectedId) {
      return;
    }

    setPlacedLandmarks((current) => current.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  };

  const handleSaveLayout = () => {
    saveMyScapeLayout(serializeMyScapeLayout(placedLandmarks));
    setSaveMessage("Layout saved");
  };

  return (
    <div className="-mx-4 -mt-1 min-h-screen bg-[linear-gradient(180deg,#edf3ed_0%,#f5f3ee_38%,#f5f3ee_100%)] pb-10">
      <section className="px-4 pb-8 pt-3 text-ink">
        <div className="mx-auto max-w-md space-y-4">
          <MyScapeHeader />

          {saveMessage ? (
            <div className="rounded-[22px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-[0_14px_36px_rgba(40,62,50,0.18)]">
              {saveMessage}
            </div>
          ) : null}

          <MyScapeBoard
            boardRef={boardRef}
            assets={unlockedAssets}
            placedLandmarks={placedLandmarks}
            selectedId={selectedId}
            onItemPointerDown={handleItemPointerDown}
            onSelectItem={setSelectedId}
          />

          <MyScapeToolbar
            canEditSelection={canEditSelection}
            onScaleDown={() => updateSelectedScale("down")}
            onScaleUp={() => updateSelectedScale("up")}
            onRemove={handleRemoveSelection}
            onSave={handleSaveLayout}
          />

          <MyScapeAssetTray
            assets={unlockedAssets}
            placedLandmarkIds={placedLandmarkIds}
            onPlace={handlePlaceAsset}
          />

          <div className="rounded-[24px] bg-white/72 px-4 py-4 shadow-[0_16px_38px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sage-500">Collected Landmarks</p>
            <p className="mt-2 text-sm leading-6 text-sage-600">
              Every unlocked landmark can now be placed inside your personal board. Drag items to rearrange, scale them from the toolbar, and save your layout locally.
            </p>
          </div>

          <div className="mt-5 rounded-[18px] bg-white/76 p-1 shadow-[0_14px_34px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
            <div className="grid grid-cols-4 gap-1">
              {viewModes.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => {
                    setViewMode(mode.key);
                    setAnchorDate(today);
                  }}
                  className={`rounded-[12px] px-3 py-2 text-sm font-medium transition ${
                    viewMode === mode.key ? "bg-sage-700 text-white" : "text-sage-500"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAnchorDate((current) => shiftAnchorDate(current, viewMode, -1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/76 text-sage-700 shadow-[0_12px_28px_rgba(35,52,40,0.08)] ring-1 ring-white/85"
              aria-label="View previous period"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <p className="text-base font-semibold">{formatMyScapePeriodLabel(anchorDate, viewMode)}</p>
              <p className="mt-1 text-xs text-sage-500">{getPeriodSummaryText(viewMode)}</p>
            </div>

            <button
              type="button"
              onClick={() => setAnchorDate((current) => shiftAnchorDate(current, viewMode, 1))}
              disabled={nextPeriodDisabled}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/76 text-sage-700 shadow-[0_12px_28px_rgba(35,52,40,0.08)] ring-1 ring-white/85 disabled:opacity-35"
              aria-label="View next period"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <MyScapeIsland
            featuredUnlock={featuredUnlock}
            unlockCount={unlocksInPeriod.length}
            totalDistanceKm={totalDistanceKm}
          />
        </div>
      </section>

      <section className="rounded-t-[32px] bg-transparent px-4 pb-10 pt-5">
        <div className="mx-auto max-w-md space-y-4">
          <section className="rounded-[24px] bg-white/82 px-4 py-4 shadow-[0_16px_38px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
            <h2 className="text-sm font-semibold text-ink">Period Overview</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-[18px] bg-sage-50/70 px-3 py-3">
                <p className="text-[11px] text-sage-500">Distance</p>
                <p className="mt-2 text-lg font-semibold text-ink">{formatDistance(totalDistanceKm)}</p>
              </div>
              <div className="rounded-[18px] bg-sage-50/70 px-3 py-3">
                <p className="text-[11px] text-sage-500">Runs</p>
                <p className="mt-2 text-lg font-semibold text-ink">{runCount}</p>
              </div>
              <div className="rounded-[18px] bg-sage-50/70 px-3 py-3">
                <p className="text-[11px] text-sage-500">Unlocks</p>
                <p className="mt-2 text-lg font-semibold text-ink">{unlocksInPeriod.length}</p>
              </div>
            </div>
          </section>

          <MyScapeChartCard
            title="Distance Distribution"
            points={chartData}
            emptyText="No run data in this period"
          />

          <section className="rounded-[24px] bg-white/82 px-4 py-4 shadow-[0_16px_38px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-ink">Unlocked This Period</h3>
            {unlocksInPeriod.length > 0 ? (
              <div className="mt-4 space-y-3">
                {unlocksInPeriod.slice(-3).reverse().map((item) => (
                  <div key={`${item.id}-${item.unlockedAt}`} className="rounded-[18px] bg-sage-50/70 px-4 py-3">
                    <p className="text-sm font-semibold text-ink">{item.name}</p>
                    <p className="mt-1 text-xs text-sage-600">
                      {item.routeName} · {item.city}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[18px] bg-sage-50/70 px-4 py-6 text-sm text-sage-500">No new landmarks unlocked in this period.</div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
};
