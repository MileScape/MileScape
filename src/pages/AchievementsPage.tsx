import { CheckCircle2, Lock, X } from "lucide-react";
import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeHex,
  getBadgeMedalClassNames,
  getBadgeSilhouetteStyle,
  isBadgeRoundSilhouette
} from "../components/achievements/AchievementBadges";
import {
  buildCountryAchievementSets,
  formatDate,
  getDisplayCountry
} from "../data/achievements";
import type { BadgeAsset, CountryAchievementSet } from "../data/achievements";
import { useAppState } from "../hooks/useAppState";
import { cn } from "../utils/cn";

type AchievementCopy = {
  countryPrize: string;
  close: string;
  routes: string;
  landmarks: string;
  decorations: string;
  flipHint: string;
  unlockTime: string;
  unlockConditionPrefix: string;
  notUnlocked: string;
  pageHeading: string;
};

const getAchievementCopy = (language: "en" | "zh"): AchievementCopy =>
  language === "zh"
    ? {
      countryPrize: "国家大奖章",
      close: "关闭",
      routes: "路线",
      landmarks: "地标",
      decorations: "装饰",
      flipHint: "点击翻转",
      unlockTime: "解锁时间",
      unlockConditionPrefix: "解锁",
      notUnlocked: "未解锁",
      pageHeading: "Achievements",
    }
    : {
      countryPrize: "Country prize badge",
      close: "Close",
      routes: "Routes",
      landmarks: "Landmarks",
      decorations: "Decorations",
      flipHint: "Tap to flip",
      unlockTime: "Unlocked",
      unlockConditionPrefix: "Unlock",
      notUnlocked: "Locked",
      pageHeading: "Achievements",
    };

type FlattenedAchievement = {
  asset: BadgeAsset;
  countrySet: CountryAchievementSet;
};

const badgeLayoutVariants = [
  {
    shell: "translate-x-0",
    frame: "rotate-[-5deg] translate-y-0",
    badgeWrap: "scale-[1.03]",
    accent: "from-[#f4ead7]/85 via-white/20 to-[#dce9dc]/70"
  },
  {
    shell: "translate-x-3",
    frame: "rotate-[6deg]",
    badgeWrap: "scale-[0.92]",
    accent: "from-[#e3edf3]/80 via-white/15 to-[#f3dfcf]/65"
  },
  {
    shell: "-translate-x-2",
    frame: "rotate-[-2deg]",
    badgeWrap: "scale-[1]",
    accent: "from-[#e7eee6]/80 via-white/10 to-[#f2e2c8]/65"
  },
  {
    shell: "translate-x-1",
    frame: "rotate-[4deg]",
    badgeWrap: "scale-[0.96]",
    accent: "from-[#f2e3d0]/80 via-white/15 to-[#d9e8e0]/60"
  },
  {
    shell: "-translate-x-3",
    frame: "rotate-[-7deg]",
    badgeWrap: "scale-[1.04]",
    accent: "from-[#dfe9d8]/85 via-white/10 to-[#eadfd6]/65"
  },
  {
    shell: "translate-x-2",
    frame: "rotate-[3deg]",
    badgeWrap: "scale-[0.9]",
    accent: "from-[#efe5d7]/80 via-white/10 to-[#dbe3ef]/65"
  }
] as const;

const passportStampLayoutVariants = [
  { top: 18, xOffset: 0, rotate: -8, scale: 1.02, labelX: -18, labelY: 4, curve: -16 },
  { top: 44, xOffset: 26, rotate: 7, scale: 0.92, labelX: 24, labelY: -2, curve: 18 },
  { top: 70, xOffset: -14, rotate: -3, scale: 1, labelX: -28, labelY: -12, curve: -22 },
  { top: 30, xOffset: 42, rotate: 12, scale: 0.88, labelX: 30, labelY: 2, curve: 20 },
  { top: 62, xOffset: 6, rotate: -11, scale: 1.05, labelX: 16, labelY: -8, curve: 14 },
  { top: 84, xOffset: 34, rotate: 5, scale: 0.94, labelX: -22, labelY: -20, curve: -18 },
  { top: 22, xOffset: -24, rotate: 3, scale: 0.96, labelX: 26, labelY: 3, curve: 16 },
  { top: 52, xOffset: 54, rotate: -6, scale: 1.01, labelX: -24, labelY: -6, curve: -20 },
  { top: 76, xOffset: -38, rotate: 9, scale: 0.9, labelX: 28, labelY: -14, curve: 22 },
  { top: 38, xOffset: -6, rotate: -13, scale: 1.06, labelX: -16, labelY: 0, curve: -14 },
] as const;

const LOOP_COPIES = 3;
const STAMP_SPACING = 76;
const STAMP_CANVAS_PADDING = 56;
const DETAIL_FLIP_DRAG_SENSITIVITY = 0.9;

const normalizeDetailFlipRotation = (rotation: number) => ((rotation % 360) + 360) % 360;

export const AchievementsPage = () => {
  const { language, routes, state } = useAppState();
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [detailBaseRotation, setDetailBaseRotation] = useState(0);
  const [detailDragRotation, setDetailDragRotation] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const detailDragRef = useRef({
    currentRotation: 0,
    isPointerDown: false,
    moved: false,
    startRotation: 0,
    startX: 0,
    suppressNextClick: false
  });
  const copy = getAchievementCopy(language);

  const countrySets = useMemo(
    () => buildCountryAchievementSets(routes, state.routeProgress, state.runHistory, language),
    [language, routes, state.routeProgress, state.runHistory]
  );

  const achievements = useMemo(
    () =>
      countrySets.flatMap((countrySet) =>
        countrySet.assets.map((asset) => ({
          asset,
          countrySet
        }))
      ),
    [countrySets]
  );

  const selectedAchievement = selectedAchievementId
    ? achievements.find(({ asset }) => asset.id === selectedAchievementId) ?? null
    : null;
  const selectedBadgeSilhouetteStyle = selectedAchievement
    ? getBadgeSilhouetteStyle(selectedAchievement.asset, 0)
    : {};
  const selectedBadgeIsRound = selectedAchievement
    ? isBadgeRoundSilhouette(selectedAchievement.asset, 0)
    : false;
  const selectedBadgeMedalClasses = selectedAchievement
    ? getBadgeMedalClassNames(selectedAchievement.asset)
    : null;
  const selectedUnlockCondition = selectedAchievement
    ? `${copy.unlockConditionPrefix} ${selectedAchievement.asset.name}`
    : "";

  const loopedAchievements = useMemo(
    () =>
      Array.from({ length: LOOP_COPIES }, (_, loopIndex) =>
        achievements.map((achievement, index) => ({
          ...achievement,
          loopIndex,
          renderId: `${achievement.asset.id}-${loopIndex}-${index}`
        }))
      ).flat(),
    [achievements]
  );
  const stampSegmentWidth = Math.max(
    achievements.length * STAMP_SPACING + STAMP_CANVAS_PADDING * 2,
    1440
  );

  useEffect(() => {
    setDetailBaseRotation(0);
    setDetailDragRotation(null);
  }, [selectedAchievementId]);

  const detailRotation = detailDragRotation ?? detailBaseRotation;
  const normalizedDetailRotation = normalizeDetailFlipRotation(detailRotation);
  const detailBackVisible = normalizedDetailRotation >= 90 && normalizedDetailRotation < 270;

  const finishDetailDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (!detailDragRef.current.isPointerDown) {
      return;
    }

    detailDragRef.current.isPointerDown = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!detailDragRef.current.moved) {
      setDetailDragRotation(null);
      return;
    }

    detailDragRef.current.suppressNextClick = true;
    setDetailBaseRotation(Math.round(detailDragRef.current.currentRotation / 180) * 180);
    setDetailDragRotation(null);
  };

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller || achievements.length === 0) {
      return;
    }

    const resetToMiddle = () => {
      scroller.scrollLeft = scroller.scrollWidth / LOOP_COPIES;
    };

    resetToMiddle();

    const handleScroll = () => {
      const segmentWidth = scroller.scrollWidth / LOOP_COPIES;

      if (segmentWidth <= 0) {
        return;
      }

      if (scroller.scrollLeft < segmentWidth * 0.35) {
        scroller.scrollLeft += segmentWidth;
      } else if (scroller.scrollLeft > segmentWidth * 1.65) {
        scroller.scrollLeft -= segmentWidth;
      }
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
    };
  }, [achievements.length]);

  return (
    <div className="relative -mx-4 -mt-1 flex h-[calc(100dvh-5.75rem)] min-h-0 flex-col overflow-hidden px-0 pb-0 pt-0">
      <div className="pointer-events-none absolute left-[-8%] top-8 h-56 w-56 rounded-full bg-[#f4e0b2]/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#dce6f3]/24 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.32] [background-image:radial-gradient(circle_at_center,rgba(129,102,70,0.4)_0_1.2px,transparent_1.35px)] [background-size:15px_15px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(circle_at_center,rgba(216,154,88,0.34)_0_1px,transparent_1.2px)] [background-position:7px_7px] [background-size:15px_15px]" />

      <section className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="px-8 pb-1 pt-1 sm:px-10">
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-ink sm:text-3xl">
            {copy.pageHeading}
          </h1>
        </div>

        <div
          ref={scrollerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden px-0 pb-0 pt-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            className="relative h-full min-w-max px-0 py-3"
            style={{ width: stampSegmentWidth * LOOP_COPIES }}
          >
          {loopedAchievements.map(({ asset, countrySet, renderId }, index) => {
            const variant = badgeLayoutVariants[index % badgeLayoutVariants.length];
            const stampVariant = passportStampLayoutVariants[index % passportStampLayoutVariants.length];
            const itemIndex = index % achievements.length;
            const left =
              Math.floor(index / achievements.length) * stampSegmentWidth +
              STAMP_CANVAS_PADDING +
              itemIndex * STAMP_SPACING +
              stampVariant.xOffset;

            return (
              <button
                key={renderId}
                type="button"
                onClick={() => setSelectedAchievementId(asset.id)}
                className={cn(
                  "group absolute flex h-[202px] w-[210px] flex-col items-center justify-center text-center transition duration-300 sm:h-[218px] sm:w-[228px]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2a51a]/60",
                  variant.shell
                )}
                style={{
                  left,
                  top: `${stampVariant.top}%`,
                  transform: `translate(-50%, -50%) rotate(${stampVariant.rotate}deg) scale(${stampVariant.scale})`
                }}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-[10%] top-6 h-24 rounded-full bg-gradient-to-br opacity-85 blur-2xl transition duration-300 group-hover:scale-110",
                    variant.accent
                  )}
                />
                <div
                  className={cn(
                    "relative flex flex-col items-center transition duration-300 group-hover:-translate-y-1",
                    variant.frame
                  )}
                >
                  <div className={cn("relative", variant.badgeWrap)}>
                    <BadgeHex asset={asset} index={index} featured />
                  </div>
                  <div
                    className="pointer-events-none relative mt-0 h-[58px] w-[190px]"
                    style={{
                      transform: `translate(${stampVariant.labelX}px, ${stampVariant.labelY}px) rotate(${index % 2 === 0 ? "-2deg" : "3deg"})`
                    }}
                  >
                    <svg
                      aria-hidden="true"
                      className="absolute left-1/2 top-0 h-9 w-24 -translate-x-1/2 overflow-visible"
                      viewBox="0 0 96 36"
                    >
                      <path
                        d={`M 48 0 C ${48 + stampVariant.curve} 9 ${48 - stampVariant.curve} 19 48 30`}
                        fill="none"
                        stroke="rgba(129,102,70,0.48)"
                        strokeDasharray="3 4"
                        strokeLinecap="round"
                        strokeWidth="1.25"
                      />
                      <circle cx="48" cy="30" r="3" fill="rgba(129,102,70,0.42)" />
                    </svg>
                    <div className="absolute left-1/2 top-8 max-w-[190px] -translate-x-1/2 rotate-[-1deg] rounded-[6px] bg-[#f7f1df]/64 px-2 py-1 shadow-[0_1px_0_rgba(255,255,255,0.5),inset_0_0_0_1px_rgba(129,102,70,0.08)]">
                      <p className="font-mono text-[0.72rem] font-semibold uppercase leading-tight tracking-[0.16em] text-[#53685f]/78 mix-blend-multiply drop-shadow-[0_1px_0_rgba(255,255,255,0.48)] [font-family:'Courier_New','Courier_Prime','American_Typewriter','Special_Elite',monospace]">
                        {getDisplayCountry(countrySet.country, language)}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          </div>
        </div>
      </section>
      
      {selectedAchievement ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/48 px-5 backdrop-blur-md">
          <div className="relative flex min-h-[420px] w-80 flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setSelectedAchievementId(null)}
              className="absolute right-2 top-4 z-20 rounded-full bg-[#f7f1df]/82 p-2.5 text-sage-700 shadow-[0_10px_30px_rgba(17,31,22,0.2)] ring-1 ring-white/60 backdrop-blur"
              aria-label={copy.close}
            >
              <X className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (detailDragRef.current.suppressNextClick) {
                  detailDragRef.current.suppressNextClick = false;
                  return;
                }

                setDetailBaseRotation((rotation) => rotation + 180);
              }}
              onPointerDown={(event) => {
                detailDragRef.current.isPointerDown = true;
                detailDragRef.current.moved = false;
                detailDragRef.current.startX = event.clientX;
                detailDragRef.current.startRotation = detailBaseRotation;
                detailDragRef.current.currentRotation = detailBaseRotation;
                setDetailDragRotation(detailBaseRotation);
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!detailDragRef.current.isPointerDown) {
                  return;
                }

                const deltaX = event.clientX - detailDragRef.current.startX;

                if (Math.abs(deltaX) > 3) {
                  detailDragRef.current.moved = true;
                }

                const nextRotation =
                  detailDragRef.current.startRotation + deltaX * DETAIL_FLIP_DRAG_SENSITIVITY;

                detailDragRef.current.currentRotation = nextRotation;
                setDetailDragRotation(nextRotation);
              }}
              onPointerUp={finishDetailDrag}
              onPointerCancel={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }

                detailDragRef.current.isPointerDown = false;
                setDetailDragRotation(null);
              }}
              className="group block h-64 w-64 touch-none select-none outline-none [perspective:1000px] focus-visible:ring-2 focus-visible:ring-[#d89a58]/70"
              aria-label={copy.flipHint}
            >
              <div
                className={cn(
                  "relative h-full w-full [transform-style:preserve-3d]",
                  detailDragRotation === null ? "transition-transform duration-700" : "transition-none"
                )}
                style={{ transform: `rotateY(${detailRotation}deg)` }}
              >
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-150 [backface-visibility:hidden]",
                    detailBackVisible && "opacity-0"
                  )}
                >
                  <BadgeHex asset={selectedAchievement.asset} index={0} detail straight />
                </div>

                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#dfffe8] via-[#fff1aa] to-[#f1b7dc] p-8 text-ink drop-shadow-[0_18px_38px_rgba(17,31,22,0.24)] transition-opacity duration-150 [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    selectedBadgeMedalClasses?.state,
                    !detailBackVisible && "opacity-0",
                    selectedBadgeIsRound && "rounded-full"
                  )}
                  style={selectedBadgeSilhouetteStyle}
                >
                  <div
                    className={cn(
                      "absolute inset-5 border border-dashed border-white/24",
                      selectedBadgeIsRound && "rounded-full"
                    )}
                    style={selectedBadgeSilhouetteStyle}
                  />
                  <div
                    className={cn(
                      "absolute inset-[12px] bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.8),rgba(255,253,223,0.42)_45%,rgba(255,198,230,0.28)_100%)] opacity-72 shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),inset_0_-5px_10px_rgba(17,31,22,0.1)]",
                      selectedBadgeIsRound && "rounded-full"
                    )}
                    style={selectedBadgeSilhouetteStyle}
                  />
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.82)_28%,transparent_48%,rgba(255,255,255,0.36)_68%,transparent_100%)]",
                      selectedBadgeIsRound && "rounded-full"
                    )}
                    style={selectedBadgeSilhouetteStyle}
                  />
                  <p className="relative text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#243228]/58">
                    {copy.unlockTime}
                  </p>
                  <p className="relative mt-3 text-2xl font-semibold tracking-[-0.05em] text-ink">
                    {selectedAchievement.asset.unlocked
                      ? selectedAchievement.asset.unlockedAt
                        ? formatDate(selectedAchievement.asset.unlockedAt, language)
                        : "--"
                      : copy.notUnlocked}
                  </p>
                  <div className="relative mt-4 flex items-center gap-2 text-xs font-semibold text-[#243228]/70">
                    {selectedAchievement.asset.unlocked ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    <span>{selectedAchievement.asset.unlocked ? copy.unlockTime : copy.notUnlocked}</span>
                  </div>
                </div>
              </div>
            </button>
            <p className="mt-7 max-w-[300px] rounded-[8px] bg-[#f7f1df]/70 px-3 py-2 text-center font-mono text-[0.76rem] font-semibold uppercase leading-relaxed tracking-[0.14em] text-[#53685f]/82 mix-blend-multiply shadow-[0_1px_0_rgba(255,255,255,0.44),inset_0_0_0_1px_rgba(129,102,70,0.1)] [font-family:'Courier_New','Courier_Prime','American_Typewriter','Special_Elite',monospace]">
              {selectedUnlockCondition}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
