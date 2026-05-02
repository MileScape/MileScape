import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CapsuleMachineButton } from "../components/myscape/CapsuleMachineButton";
import { MyScapeAssetTray } from "../components/myscape/MyScapeAssetTray";
import { MyScapeBoard } from "../components/myscape/MyScapeBoard";
import { MyScapeHeaderControls } from "../components/myscape/MyScapeHeaderControls";
import { useAppState } from "../hooks/useAppState";
import { defaultDecorationPool } from "../hooks/useCapsuleLogic";
import type { MyScapePlacedLandmark } from "../types";
import { loadMyScapeCapsuleState, saveMyScapeCapsuleState, saveMyScapeLayout } from "../utils/storage";
import {
  buildMyScapeChartData,
  buildMyScapeUnlockTimeline,
  createPlacedLandmark,
  formatMyScapePeriodLabel,
  getMyScapeYearDemoAssets,
  getNextZIndex,
  getPeriodEnd,
  getPeriodStart,
  isFuturePeriod,
  normalizeBoardPosition,
  resolveUnlockedLandmarkAssets,
  restoreMyScapeLayout,
  serializeMyScapeLayout,
  shiftAnchorDate,
  type MyScapeAsset,
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
const longPressDurationMs = 220;

const getPeriodSummaryText = (mode: MyScapeViewMode) => {
  if (mode === "day") {
    return "Today's memory";
  }
  if (mode === "week") {
    return "This week's memory";
  }
  if (mode === "month") {
    return "This month's memory";
  }
  return "This year's memory";
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
        <div className="mt-4 flex h-[160px] items-center justify-center rounded-[18px] bg-sage-50/70 text-sm text-sage-500">
          {emptyText}
        </div>
      ) : (
        <div className="mt-4">
          <div
            className="grid h-[160px] items-end gap-1 rounded-[18px] bg-sage-50/70 px-3 pb-3 pt-6"
            style={{ gridTemplateColumns: `repeat(${Math.max(visiblePoints.length, 1)}, minmax(0, 1fr))` }}
          >
            {visiblePoints.map((point) => (
              <div key={point.label} className="flex min-w-0 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-full bg-[linear-gradient(180deg,rgba(189,208,192,0.95)_0%,rgba(78,98,88,1)_100%)]"
                  style={{ height: `${Math.max(8, (point.value / maxValue) * 108)}px` }}
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
  const navigate = useNavigate();
  const { routes, state } = useAppState();
  const storedCapsuleState = loadMyScapeCapsuleState();
  const [viewMode, setViewMode] = useState<MyScapeViewMode>("day");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [placedLandmarks, setPlacedLandmarks] = useState<MyScapePlacedLandmark[]>(() => restoreMyScapeLayout());
  const [yearDemoLandmarks, setYearDemoLandmarks] = useState<MyScapePlacedLandmark[]>([]);
  const [currentBlueprintFragments, setCurrentBlueprintFragments] = useState(storedCapsuleState?.blueprintFragments ?? 0);
  const [capsuleRouteTicketIds, setCapsuleRouteTicketIds] = useState<string[]>(storedCapsuleState?.capsuleRouteTicketIds ?? []);
  const [capsuleDecorationItems, setCapsuleDecorationItems] = useState<Array<{ instanceId: string; decorationId: string }>>(
    storedCapsuleState?.capsuleDecorationItems ?? [],
  );
  const [ownedAtmosphereEffectIds, setOwnedAtmosphereEffectIds] = useState<string[]>(
    storedCapsuleState?.ownedAtmosphereEffectIds ?? [],
  );
  const boardRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    itemId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const today = new Date();

  const unlockedAssets = useMemo(
    () => resolveUnlockedLandmarkAssets(routes, state.routeProgress),
    [routes, state.routeProgress],
  );
  const yearDemoAssets = useMemo(() => getMyScapeYearDemoAssets(), []);
  const capsuleUnlockedRouteIds = useMemo(
    () => Array.from(new Set([...state.purchasedRouteIds, ...capsuleRouteTicketIds])),
    [capsuleRouteTicketIds, state.purchasedRouteIds],
  );
  const capsuleDecorationAssets = useMemo<MyScapeAsset[]>(() => {
    const collected: MyScapeAsset[] = [];

    capsuleDecorationItems.forEach((item) => {
      const decoration = defaultDecorationPool.find((entry) => entry.id === item.decorationId);

      if (!decoration) {
        return;
      }

      collected.push({
        id: item.instanceId,
        name: decoration.name,
        description: decoration.description,
        routeId: "capsule-machine",
        routeName: "Capsule Machine",
        city: "My Scape",
        country: "Collection",
        image: decoration.image,
        imageSrc: decoration.image,
        assetType: "decor",
        defaultScale: decoration.rarity === "legendary" ? 1.02 : 0.9,
        rarity: decoration.rarity,
        icon: decoration.icon,
      });
    });

    return collected;
  }, [capsuleDecorationItems]);
  const liveAssets = useMemo(() => [...unlockedAssets, ...capsuleDecorationAssets], [capsuleDecorationAssets, unlockedAssets]);
  const assets = useMemo(() => (viewMode === "year" ? yearDemoAssets : liveAssets), [liveAssets, viewMode, yearDemoAssets]);
  const liveAssetIdSet = useMemo(() => new Set(liveAssets.map((asset) => asset.id)), [liveAssets]);

  useEffect(() => {
    setPlacedLandmarks((current) => current.filter((item) => liveAssetIdSet.has(item.landmarkId)));
  }, [liveAssetIdSet]);

  useEffect(() => {
    if (viewMode !== "year") {
      return;
    }

    const board = boardRef.current;
    if (!board) {
      return;
    }

    const width = board.clientWidth;
    const height = board.clientHeight;
    const layout = [
      { id: "tokyo-tower", x: 0.02, y: 0.28, scale: 1.02 },
      { id: "eiffel-tower-demo", x: 0.16, y: 0.06, scale: 0.98 },
      { id: "london-bridge-demo", x: 0.34, y: 0.01, scale: 1.06 },
      { id: "statue-of-liberty", x: 0.12, y: 0.46, scale: 1.06 },
      { id: "shibuya", x: 0.36, y: 0.18, scale: 1.26 },
      { id: "eiffel-tower-demo", x: 0.57, y: 0.26, scale: 0.96 },
      { id: "statue-of-liberty", x: 0.69, y: 0.02, scale: 1.12 },
      { id: "senso-ji", x: 0.82, y: 0.28, scale: 1.02 },
      { id: "big-ben-demo", x: 0.24, y: 0.62, scale: 1.02 },
      { id: "sydney-opera-demo", x: 0.42, y: 0.7, scale: 1.04 },
      { id: "big-ben-demo", x: 0.64, y: 0.56, scale: 1.04 },
    ] as const;

    setYearDemoLandmarks(
      layout.map((entry, index) => ({
        id: `year-demo-${entry.id}-${index}`,
        landmarkId: entry.id,
        x: normalizeBoardPosition({ x: width * entry.x, y: height * entry.y }, width, height, entry.scale).x,
        y: normalizeBoardPosition({ x: width * entry.x, y: height * entry.y }, width, height, entry.scale).y,
        scale: entry.scale,
        zIndex: index + 1,
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

  useEffect(() => {
    if (viewMode === "year") {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      saveMyScapeLayout(serializeMyScapeLayout(placedLandmarks));
    }, 120);

    return () => window.clearTimeout(saveTimer);
  }, [placedLandmarks, viewMode]);

  useEffect(() => {
    saveMyScapeCapsuleState({
      blueprintFragments: currentBlueprintFragments,
      capsuleRouteTicketIds,
      capsuleDecorationItems,
      ownedAtmosphereEffectIds,
    });
  }, [capsuleDecorationItems, capsuleRouteTicketIds, currentBlueprintFragments, ownedAtmosphereEffectIds]);

  const handleItemPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => {
    const board = boardRef.current;
    const target = event.currentTarget;
    if (!board) {
      return;
    }

    event.preventDefault();
    target.setPointerCapture(event.pointerId);
    const boardRect = board.getBoundingClientRect();
    const activeLandmarks = viewMode === "year" ? yearDemoLandmarks : placedLandmarks;
    const item = activeLandmarks.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }
    setSelectedId(itemId);

    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = window.setTimeout(() => {
      dragStateRef.current = {
        itemId,
        offsetX: event.clientX - boardRect.left - item.x,
        offsetY: event.clientY - boardRect.top - item.y,
      };

      const raiseZIndex = (current: MyScapePlacedLandmark[]) =>
        current.map((entry) =>
          entry.id === itemId
            ? {
                ...entry,
                zIndex: getNextZIndex(current),
              }
            : entry,
        );

      if (viewMode === "year") {
        setYearDemoLandmarks(raiseZIndex);
        return;
      }

      setPlacedLandmarks(raiseZIndex);
    }, longPressDurationMs);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const board = boardRef.current;
      const dragState = dragStateRef.current;
      if (!board || !dragState) {
        return;
      }

      const boardRect = board.getBoundingClientRect();
      const updateLandmarks = (current: MyScapePlacedLandmark[]) =>
        current.map((item) => {
          if (item.id !== dragState.itemId) {
            return item;
          }

          const nextPosition = normalizeBoardPosition(
            {
              x: event.clientX - boardRect.left - dragState.offsetX,
              y: event.clientY - boardRect.top - dragState.offsetY,
            },
            board.clientWidth,
            board.clientHeight,
            item.scale,
          );

          return {
            ...item,
            x: nextPosition.x,
            y: nextPosition.y,
          };
        });

      if (viewMode === "year") {
        setYearDemoLandmarks(updateLandmarks);
        return;
      }

      setPlacedLandmarks(updateLandmarks);
    };

    const handlePointerUp = () => {
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      dragStateRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [viewMode]);

  const displayedLandmarks = viewMode === "year" ? yearDemoLandmarks : placedLandmarks;

  const handlePlaceFromBackpack = (assetId: string) => {
    if (viewMode === "year") {
      return;
    }

    const board = boardRef.current;
    const asset = liveAssets.find((entry) => entry.id === assetId);

    if (!board || !asset) {
      return;
    }

    setPlacedLandmarks((current) => [
      ...current,
      createPlacedLandmark(
        asset.id,
        current,
        board.clientWidth,
        board.clientHeight,
        asset.defaultScale ?? 1,
      ),
    ]);
  };

  const handleReturnToBox = (itemId: string) => {
    if (viewMode === "year") {
      return;
    }

    setPlacedLandmarks((current) => current.filter((item) => item.id !== itemId));
    setSelectedId((current) => (current === itemId ? null : current));
  };

  const capsuleButton =
    viewMode !== "year" ? (
      <CapsuleMachineButton
        className="shadow-[0_18px_34px_rgba(45,62,53,0.2)]"
        buttonMode="compact"
        routes={routes}
        currentFragments={currentBlueprintFragments}
        unlockedRouteIds={capsuleUnlockedRouteIds}
        ownedAtmosphereEffectIds={ownedAtmosphereEffectIds}
        onRouteTicketWon={(route) => {
          setCapsuleRouteTicketIds((current) => (current.includes(route.id) ? current : [...current, route.id]));
        }}
        onDecorationWon={(decoration) => {
          setCapsuleDecorationItems((current) => [
            ...current,
            {
              instanceId: crypto.randomUUID(),
              decorationId: decoration.id,
            },
          ]);
        }}
        onFragmentsGained={(fragments) => {
          setCurrentBlueprintFragments((current) => current + fragments);
        }}
        onExchangeAtmosphereEffect={(effect) => {
          if (ownedAtmosphereEffectIds.includes(effect.id) || currentBlueprintFragments < effect.costFragments) {
            return;
          }

          setCurrentBlueprintFragments((current) => current - effect.costFragments);
          setOwnedAtmosphereEffectIds((current) => [...current, effect.id]);
        }}
      />
    ) : null;

  return (
    <div className="relative isolate box-border flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#f3f1eb_0%,#f6f4ef_100%)] pt-[calc(env(safe-area-inset-top,0px)+4.45rem)] text-ink">
      <MyScapeHeaderControls
        arrangeActive={false}
        showArrange={false}
        onBack={() => navigate("/run/setup")}
        onToggleArrange={() => undefined}
      />
      <section
        className={`relative shrink-0 overflow-hidden ${
          viewMode === "year" ? "h-[43%] min-h-[300px] max-h-[390px]" : "h-[41%] min-h-[285px] max-h-[360px]"
        }`}
      >
        <MyScapeBoard
          boardRef={boardRef}
          assets={assets}
          placedLandmarks={displayedLandmarks}
          selectedId={selectedId}
          expanded={viewMode === "year"}
          onItemPointerDown={handleItemPointerDown}
          onSelectItem={setSelectedId}
          onReturnToBox={handleReturnToBox}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(243,241,235,0)_0%,rgba(243,241,235,0.94)_100%)]" />
        {capsuleButton ? <div className="absolute bottom-7 right-5 z-40">{capsuleButton}</div> : null}
      </section>

      <section className="relative z-10 -mt-2 flex min-h-0 flex-1 flex-col rounded-t-[34px] bg-[linear-gradient(180deg,rgba(248,246,240,0.98),rgba(244,241,234,1))] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.35rem)] pt-6 shadow-[0_-18px_38px_rgba(35,52,40,0.08)] ring-1 ring-white/75">
        <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-sage-500">My Scape</p>
              <h1 className="font-destination-display text-[2.6rem] leading-[0.92] tracking-[0.01em] text-[#2e3e35]">
                {getLawnTitle(viewMode, anchorDate)}
              </h1>
            </div>

            <section className="rounded-[24px] bg-white/84 p-2 shadow-[0_18px_40px_rgba(35,52,40,0.08)] ring-1 ring-white/88 backdrop-blur-xl">
              <div className="grid grid-cols-4 gap-2">
                {viewModes.map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => {
                      setViewMode(mode.key);
                      setAnchorDate(today);
                    }}
                    className={`rounded-[14px] px-3 py-2.5 text-sm font-medium transition ${
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

            <section className="space-y-4">
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
                  <p className="text-lg font-semibold tracking-[-0.03em] text-[#2f3f35]">{formatMyScapePeriodLabel(anchorDate, viewMode)}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-sage-500">{getPeriodSummaryText(viewMode)}</p>
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

              <div className="grid grid-cols-3 gap-3 rounded-[24px] bg-white/58 px-4 py-4 ring-1 ring-white/75">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-sage-500">Distance</p>
                  <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[#2f3f35]">{formatDistance(totalDistanceKm)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-sage-500">Runs</p>
                  <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[#2f3f35]">{runCount}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-sage-500">Fragments</p>
                  <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[#2f3f35]">{currentBlueprintFragments}</p>
                </div>
              </div>
            </section>

            {viewMode !== "year" ? (
              <MyScapeAssetTray
                assets={liveAssets}
                placedItems={placedLandmarks}
                onPlace={handlePlaceFromBackpack}
              />
            ) : null}

            <MyScapeChartCard title="Distance Distribution" points={chartData} emptyText="No run data in this period" />

            <section className="rounded-[24px] bg-white/82 px-4 py-4 shadow-[0_16px_38px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
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
        </div>
      </section>
    </div>
  );
};
