import { CheckCircle2, Lock, X } from "lucide-react";
import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeHex, CalendarMedalIcon, CountryPrizeBadge } from "../components/achievements/AchievementBadges";
import { CountryAchievementCard } from "../components/achievements/CountryAchievementCard";
import {
  achievementImages,
  buildCountryAchievementSets,
  countRunDays,
  formatDate,
  getDisplayCountry
} from "../data/achievements";
import type { BadgeAsset } from "../data/achievements";
import { useAppState } from "../hooks/useAppState";
import { cn } from "../utils/cn";

type AchievementCopy = {
  unlocked: string;
  badgeList: string;
  details: string;
  badge: string;
  countryPrize: string;
  close: string;
  progress: string;
  routes: string;
  landmarks: string;
  decorations: string;
  unlockTime: string;
  notUnlocked: string;
};

const COUNTRY_WHEEL_STEP = 36;
const COUNTRY_WHEEL_OFFSETS = [-2, -1, 0, 1, 2];
const COUNTRY_DRAG_SENSITIVITY = 0.95;
const COUNTRY_INERTIA_FRICTION = 0.92;
const COUNTRY_MIN_INERTIA_VELOCITY = 0.02;
const COUNTRY_SNAP_DURATION_MS = 180;

const getAchievementCopy = (language: "en" | "zh"): AchievementCopy =>
  language === "zh"
    ? {
      unlocked: "已解锁",
      badgeList: "徽章列表",
      details: "国家成就详情",
      badge: "成就徽章",
      countryPrize: "国家大奖章",
      close: "关闭",
      progress: "成就进度",
      routes: "路线",
      landmarks: "地标",
      decorations: "装饰",
      unlockTime: "解锁时间",
      notUnlocked: "未解锁",
    }
    : {
      unlocked: "Unlocked",
      badgeList: "Badge list",
      details: "Country achievement detail",
      badge: "Achievement badge",
      countryPrize: "Country prize badge",
      close: "Close",
      progress: "Achievement progress",
      routes: "Routes",
      landmarks: "Landmarks",
      decorations: "Decorations",
      unlockTime: "Unlocked",
      notUnlocked: "Locked",
    };

const useAchievementDeckNavigation = (count: number) => {
  const interactionRef = useRef({
    ignoreNextSwipe: false,
    inertiaFrame: 0,
    isPointerDown: false,
    pointerLastY: 0,
    pointerLastTime: 0,
    settleTimer: 0,
    velocity: 0,
    visualOffset: 0,
  });
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visualOffset, setVisualOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex((currentIndex) => {
      const nextIndex = Math.min(currentIndex, Math.max(count - 1, 0));
      activeIndexRef.current = nextIndex;
      return nextIndex;
    });
  }, [count]);

  useEffect(() => () => {
    window.clearTimeout(interactionRef.current.settleTimer);
    window.cancelAnimationFrame(interactionRef.current.inertiaFrame);
  }, []);

  const stopMotion = () => {
    window.clearTimeout(interactionRef.current.settleTimer);
    window.cancelAnimationFrame(interactionRef.current.inertiaFrame);
    interactionRef.current.settleTimer = 0;
    interactionRef.current.inertiaFrame = 0;
  };

  const moveActive = (direction: number) => {
    if (count <= 0) {
      return;
    }

    const nextIndex = (activeIndexRef.current + direction + count) % count;

    if (nextIndex === activeIndexRef.current) {
      return;
    }

    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  };

  const moveActiveBySteps = (steps: number) => {
    if (count <= 0 || steps === 0) {
      return;
    }

    const normalizedSteps = ((steps % count) + count) % count;
    const nextIndex = (activeIndexRef.current - normalizedSteps + count) % count;

    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  };

  const setContinuousOffset = (nextOffset: number) => {
    let normalizedOffset = nextOffset;

    while (normalizedOffset <= -COUNTRY_WHEEL_STEP && count > 1) {
      moveActive(1);
      normalizedOffset += COUNTRY_WHEEL_STEP;
    }

    while (normalizedOffset >= COUNTRY_WHEEL_STEP && count > 1) {
      moveActive(-1);
      normalizedOffset -= COUNTRY_WHEEL_STEP;
    }

    interactionRef.current.visualOffset = normalizedOffset;
    setVisualOffset(normalizedOffset);
  };

  const snapToNearest = () => {
    if (interactionRef.current.ignoreNextSwipe) {
      interactionRef.current.ignoreNextSwipe = false;
      interactionRef.current.velocity = 0;
      setVisualOffset(0);
      interactionRef.current.visualOffset = 0;
      setIsDragging(false);
      return;
    }

    setIsDragging(false);

    const snapSteps = Math.round(interactionRef.current.visualOffset / COUNTRY_WHEEL_STEP);
    const snapOffset = snapSteps * COUNTRY_WHEEL_STEP;

    interactionRef.current.velocity = 0;
    interactionRef.current.visualOffset = snapOffset;
    setVisualOffset(snapOffset);

    interactionRef.current.settleTimer = window.setTimeout(() => {
      if (snapSteps !== 0 && count > 1) {
        moveActiveBySteps(snapSteps);
      }

      interactionRef.current.visualOffset = 0;
      setVisualOffset(0);
    }, COUNTRY_SNAP_DURATION_MS);
  };

  const startInertia = () => {
    if (count <= 1) {
      snapToNearest();
      return;
    }

    let previousTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - previousTime;
      previousTime = now;

      const nextOffset =
        interactionRef.current.visualOffset + interactionRef.current.velocity * elapsed;
      setContinuousOffset(nextOffset);

      interactionRef.current.velocity *= Math.pow(COUNTRY_INERTIA_FRICTION, elapsed / 16);

      if (Math.abs(interactionRef.current.velocity) <= COUNTRY_MIN_INERTIA_VELOCITY) {
        interactionRef.current.inertiaFrame = 0;
        snapToNearest();
        return;
      }

      interactionRef.current.inertiaFrame = window.requestAnimationFrame(tick);
    };

    interactionRef.current.inertiaFrame = window.requestAnimationFrame(tick);
  };

  return {
    activeIndex,
    setActiveIndex: (index: number) => {
      if (count <= 0) {
        return;
      }

      const nextIndex = (index + count) % count;
      stopMotion();
      activeIndexRef.current = nextIndex;
      interactionRef.current.velocity = 0;
      interactionRef.current.visualOffset = 0;
      setVisualOffset(0);
      setIsDragging(false);
      setActiveIndex(nextIndex);
    },
    isDragging,
    visualOffset,
    suppressNextSwipe: () => {
      interactionRef.current.ignoreNextSwipe = true;
    },
    deckHandlers: {
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        stopMotion();
        interactionRef.current.isPointerDown = true;
        interactionRef.current.pointerLastY = event.clientY;
        interactionRef.current.pointerLastTime = performance.now();
        interactionRef.current.velocity = 0;
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsDragging(true);
      },
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
        if (!interactionRef.current.isPointerDown) {
          return;
        }

        const now = performance.now();
        const deltaY = event.clientY - interactionRef.current.pointerLastY;
        const elapsed = Math.max(now - interactionRef.current.pointerLastTime, 1);
        interactionRef.current.pointerLastY = event.clientY;
        interactionRef.current.pointerLastTime = now;
        interactionRef.current.velocity =
          interactionRef.current.velocity * 0.35 + (deltaY / elapsed) * 0.65;
        setContinuousOffset(
          interactionRef.current.visualOffset + deltaY * COUNTRY_DRAG_SENSITIVITY
        );
      },
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
        interactionRef.current.isPointerDown = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        startInertia();
      },
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) => {
        interactionRef.current.isPointerDown = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        snapToNearest();
      },
    }
  };
};

export const AchievementsPage = () => {
  const { language, routes, state } = useAppState();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const copy = getAchievementCopy(language);

  const countrySets = useMemo(
    () => buildCountryAchievementSets(routes, state.routeProgress, state.runHistory, language),
    [language, routes, state.routeProgress, state.runHistory]
  );

  const {
    activeIndex: activeCountryIndex,
    setActiveIndex: setActiveCountryIndex,
    isDragging,
    visualOffset,
    suppressNextSwipe,
    deckHandlers
  } = useAchievementDeckNavigation(countrySets.length);

  const selectedSet = selectedCountry
    ? countrySets.find((set) => set.country === selectedCountry) ?? null
    : null;
  const unlockedCount = countrySets.filter((set) => set.unlocked).length;
  const totalRunDays = countRunDays(state.runHistory.map((run) => run.completedAt));
  const firstRunAt = state.runHistory.map((run) => run.completedAt).sort()[0] ?? null;
  const calendarAchievement: BadgeAsset = {
    id: "general-run-days",
    name: language === "zh" ? "累计跑步天数" : "Total Running Days",
    image: achievementImages.calendar,
    unlocked: totalRunDays > 0,
    unlockedAt: null,
    unlockCount: totalRunDays
  };

  const wheelCountrySets = COUNTRY_WHEEL_OFFSETS
    .map((offset) => {
      if (countrySets.length === 0) {
        return null;
      }

      const index = (activeCountryIndex + offset + countrySets.length) % countrySets.length;
      return { set: countrySets[index], index, offset };
    })
    .filter((item): item is { set: NonNullable<typeof countrySets[number]>; index: number; offset: number } => Boolean(item))
    .filter((item, itemIndex, items) =>
      items.findIndex((candidate) => candidate.index === item.index) === itemIndex
    );
  const activeCountrySet = countrySets[activeCountryIndex] ?? null;

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-[22px] bg-white p-4 shadow-card ring-1 ring-sage-100">
          <p className="text-2xl font-semibold text-ink">{unlockedCount}</p>
          <p className="mt-1 text-xs font-medium text-sage-600">{copy.unlocked}</p>
        </div>
        <div className="rounded-[22px] bg-white p-4 shadow-card ring-1 ring-sage-100">
          <p className="text-2xl font-semibold text-ink">{countrySets.length}</p>
          <p className="mt-1 text-xs font-medium text-sage-600">{copy.details}</p>
        </div>
      </section>

      <section className="flex justify-center">
        <div className="w-full max-w-[360px] rounded-[8px] bg-white p-5 text-center shadow-[0_18px_42px_rgba(17,31,22,0.13)] ring-1 ring-sage-100">
          <div className="mx-auto flex h-28 w-28 items-center justify-center">
            <CalendarMedalIcon asset={calendarAchievement} />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">
            {language === "zh" ? "通用成就" : "General achievement"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">
            {calendarAchievement.name}
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-3xl font-semibold text-ink">{totalRunDays}</span>
            <span className="text-sm font-semibold text-sage-500">{language === "zh" ? "天" : "days"}</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-sage-500">
            {firstRunAt ? `${language === "zh" ? "首次解锁" : "Unlocked"} ${formatDate(firstRunAt, language)}` : copy.notUnlocked}
          </p>
        </div>
      </section>

      <section className="relative">
        <div className="p-1">
          <div className="px-1 pr-2">
            <div className="relative mx-auto mb-4 h-44 max-w-[360px] overflow-hidden">
              <div
                className="relative h-full touch-none select-none"
                {...deckHandlers}
              >
                <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 h-10 -translate-y-1/2 rounded-full bg-ink/8 ring-1 ring-white/80" />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-gradient-to-b from-[#f7f5ef] to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-gradient-to-t from-[#f7f5ef] to-transparent" />
                {wheelCountrySets.map(({ set, index, offset }) => {
                  const distance = Math.abs(offset);

                  return (
                    <button
                      key={`${set.country}-wheel-${offset}`}
                      type="button"
                      onClick={() => setActiveCountryIndex(index)}
                      className={cn(
                        "absolute left-0 top-1/2 h-8 w-full -translate-y-1/2 rounded-full text-center font-semibold will-change-transform",
                        isDragging ? "transition-none" : "transition-all duration-300 ease-out",
                        offset === 0 ? "text-2xl text-ink" : "text-lg text-sage-500",
                        distance === 1 ? "opacity-55" : "opacity-20"
                      )}
                      style={{
                        transform: `translateY(calc(-50% + ${offset * COUNTRY_WHEEL_STEP + visualOffset}px))`
                      }}
                    >
                      {getDisplayCountry(set.country, language)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-hidden pb-8">
              {activeCountrySet ? (
                <CountryAchievementCard
                  set={activeCountrySet}
                  index={activeCountryIndex}
                  copy={copy}
                  language={language}
                  active
                  onOpen={(country) => {
                    suppressNextSwipe();
                    setSelectedCountry(country);
                  }}
                  onSelect={() => {
                    setActiveCountryIndex(activeCountryIndex);
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {selectedSet ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/42 px-4 backdrop-blur-sm">
          <div className="max-h-[86vh] w-full max-w-[760px] overflow-hidden rounded-[8px] bg-[#f7f5ef] shadow-[0_26px_80px_rgba(17,31,22,0.32)] ring-1 ring-white/80">
            <div className="flex items-start justify-between gap-4 border-b border-sage-100 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-500">{copy.details}</p>
                <h3 className="mt-1 text-xl font-semibold text-ink">
                  {getDisplayCountry(selectedSet.country, language)} {language === "zh" ? "成就套组" : "Achievement Set"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="rounded-full bg-sage-50 p-2 text-sage-700 ring-1 ring-sage-100"
                aria-label={copy.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between rounded-[8px] bg-white p-4 ring-1 ring-sage-100">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-500">{copy.countryPrize}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{getDisplayCountry(selectedSet.country, language)}</p>
                </div>
                <CountryPrizeBadge set={selectedSet} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedSet.assets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className={cn(
                      "relative rounded-[8px] bg-white p-3 shadow-sm ring-1 ring-sage-100",
                      asset.unlocked ? "opacity-100" : "opacity-55 grayscale"
                    )}
                  >
                    <div className="absolute right-3 top-3 rounded-full bg-sage-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-600">
                      {asset.unlockedAt ? formatDate(asset.unlockedAt, language) : copy.notUnlocked}
                    </div>
                    <div className="flex gap-3 pr-20">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center">
                        <BadgeHex asset={asset} index={index} featured />
                      </div>
                      <div className="min-w-0 pt-1">
                        <p className="text-xs font-semibold text-ink">{asset.name}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-500">
                          {copy.badge}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-sage-500">
                          {asset.unlocked ? (
                            <CheckCircle2 className="h-4 w-4 text-sage-600" />
                          ) : (
                            <Lock className="h-4 w-4 text-sage-400" />
                          )}
                          <span>{asset.unlocked ? copy.unlockTime : copy.notUnlocked}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-[8px] bg-white p-3 ring-1 ring-sage-100">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">{copy.routes}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selectedSet.completedRoutes}/{selectedSet.totalRoutes}</p>
                </div>
                <div className="rounded-[8px] bg-white p-3 ring-1 ring-sage-100">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">{copy.landmarks}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selectedSet.unlockedLandmarks}/{selectedSet.totalLandmarks}</p>
                </div>
                <div className="rounded-[8px] bg-white p-3 ring-1 ring-sage-100">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">{copy.decorations}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selectedSet.unlockedDecorations}/{selectedSet.totalDecorations}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
