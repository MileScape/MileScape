import { ChevronLeft, ChevronRight, Landmark } from "lucide-react";
import { useMemo, useState } from "react";
import { useAppState } from "../hooks/useAppState";
import {
  buildMyScapeChartData,
  buildMyScapeUnlockTimeline,
  formatMyScapePeriodLabel,
  getPeriodEnd,
  getPeriodStart,
  isFuturePeriod,
  type MyScapeChartPoint,
  type MyScapeUnlockEvent,
  type MyScapeViewMode,
  shiftAnchorDate,
} from "../utils/myScape";

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

export const MyScapePage = () => {
  const { routes, state } = useAppState();
  const [viewMode, setViewMode] = useState<MyScapeViewMode>("day");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const today = new Date();

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

  return (
    <div className="-mx-4 -mt-1 min-h-screen bg-[linear-gradient(180deg,#edf3ed_0%,#f5f3ee_38%,#f5f3ee_100%)] pb-10">
      <section className="px-4 pb-8 pt-3 text-ink">
        <div className="mx-auto max-w-md">
          <div className="rounded-[18px] bg-white/76 p-1 shadow-[0_14px_34px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
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

          <div className="mt-5 flex items-center justify-between">
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

          <div className="mt-5">
            <MyScapeIsland
              featuredUnlock={featuredUnlock}
              unlockCount={unlocksInPeriod.length}
              totalDistanceKm={totalDistanceKm}
            />
          </div>
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
