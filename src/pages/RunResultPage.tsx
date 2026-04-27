import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle2, Flag, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { RunPosterCard } from "../components/run/RunPosterCard";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { buttonStyles } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { achievementLabel } from "../pages/PaceportDetailPage";
import { formatDistance, getProgressPercent } from "../utils/progress";

const defaultRunPosterImage = "/posters/run-cover.jpg";
const defaultMissionPosterImage = "/posters/mission-cover.jpg";
const routePosterImages: Record<string, string> = {
  "west-lake-loop": "/posters/westlake.jpg",
  "central-park-loop": "/posters/centralpark.jpg",
  "tokyo-city-route": "/posters/Tokyo.jpg",
  "lisbon-tram-route": "/posters/Lisbon.jpg",
  "barcelona-coast-route": "/posters/Barcelona.jpg",
  "london-landmark-route": "/posters/london.jpg",
  "paris-eiffel-route": "/posters/paris.jpg",
  "mount-fuji-route": "/posters/fuji.jpg",
  "aurora-harbor-route": "/posters/Reykjavik.jpg",
  "melbourne-laneway-route": "/posters/Melbourne.jpg",
};

const formatPace = (distanceKm: number) => {
  const paceMinutes = Math.max(4.6, 7.8 - Math.min(distanceKm, 12) * 0.12);
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - minutes) * 60);
  const normalizedSeconds = seconds === 60 ? 0 : seconds;
  const normalizedMinutes = seconds === 60 ? minutes + 1 : minutes;
  return `${normalizedMinutes}:${String(normalizedSeconds).padStart(2, "0")} /km`;
};

const estimateAverageHeartRate = (distanceKm: number, fromWearable: boolean) => {
  const base = fromWearable ? 152 : 146;
  return `${Math.round(base + Math.min(distanceKm, 12) * 2.2)} bpm`;
};

const getJourneyLoopMetrics = (totalLoggedDistanceKm: number, routeDistanceKm: number) => {
  const cycleCount = Math.floor(totalLoggedDistanceKm / routeDistanceKm) + 1;
  const progressKm =
    totalLoggedDistanceKm === 0
      ? 0
      : totalLoggedDistanceKm % routeDistanceKm === 0
        ? routeDistanceKm
        : totalLoggedDistanceKm % routeDistanceKm;

  return { cycleCount, progressKm };
};

const ResultHero = ({
  imageUrl,
}: {
  imageUrl: string;
}) => (
  <div className="fixed inset-x-0 top-0 z-0 h-[68vh] overflow-hidden">
    <img
      src={imageUrl}
      alt=""
      className="h-full w-full object-cover"
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0d1711]/24 via-[#0d1711]/10 to-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(13,23,17,0.03)_0%,rgba(13,23,17,0.08)_36%,rgba(13,23,17,0.42)_100%)]" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f5f3ee] via-[#f5f3ee]/82 to-transparent" />
    <div className="pointer-events-none absolute inset-x-0 bottom-[-36px] h-32 bg-[#f5f3ee]/72 blur-2xl" />
    <div className="pointer-events-none absolute inset-x-6 bottom-10 h-24 rounded-[999px] bg-[#f5f3ee]/58 blur-3xl" />
  </div>
);

const ResultHeroCopy = ({
  eyebrow,
  title,
  meta,
  progress,
}: {
  eyebrow: string;
  title: string;
  meta: string;
  progress: import("framer-motion").MotionValue<number>;
}) => {
  const opacity = useTransform(progress, [0, 0.26], [1, 0]);
  const y = useTransform(progress, [0, 0.26], [0, -16]);

  return (
    <motion.div className="relative z-20 mt-[33vh] px-6 text-white" style={{ opacity, y }}>
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/72">{eyebrow}</p>
      <h1 className="mt-3 text-[2.7rem] font-semibold leading-[0.92] tracking-[-0.06em]">{title}</h1>
      <p className="mt-5 max-w-[26ch] text-sm text-white/80">{meta}</p>
    </motion.div>
  );
};

const PosterTransitionShell = ({
  poster,
  backFace,
  children,
}: {
  poster: ReactNode;
  backFace: ReactNode;
  children: ReactNode;
}) => {
  const [showIntro, setShowIntro] = useState(true);
  const [isPressed, setIsPressed] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const holdTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handlePressStart = () => {
    clearHoldTimer();
    setIsPressed(true);
    holdTimerRef.current = window.setTimeout(() => {
      setIsFlipped(true);
    }, 240);
  };

  const handlePressEnd = () => {
    clearHoldTimer();
    setIsPressed(false);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="poster-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.94)_0%,rgba(233,240,235,0.96)_38%,rgba(218,228,220,0.98)_100%)] px-6"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.65),transparent_24%),radial-gradient(circle_at_50%_86%,rgba(120,146,132,0.10),transparent_28%)]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 36, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -28 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative w-full max-w-[360px]"
            >
              <button
                type="button"
                onPointerDown={handlePressStart}
                onPointerUp={handlePressEnd}
                onPointerLeave={() => {
                  clearHoldTimer();
                  setIsPressed(false);
                }}
                onPointerCancel={() => {
                  clearHoldTimer();
                  setIsPressed(false);
                }}
                className="relative block w-full cursor-pointer rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-3 text-left shadow-[0_20px_56px_rgba(63,84,72,0.08)] backdrop-blur-[20px]"
                aria-label="Press and hold to flip poster"
              >
                <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.006)_30%,rgba(255,255,255,0)_100%)]" />
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0, scale: isPressed ? 0.988 : 1 }}
                  transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div style={{ backfaceVisibility: "hidden" }}>
                    {poster}
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    {backFace}
                  </div>
                </motion.div>
              </button>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.45, ease: "easeOut" }}
                className="mt-4 flex flex-col items-center gap-2 text-center"
              >
                <p className="text-xs tracking-[0.08em] text-[#4a5d55]/58">
                  {isFlipped ? "Flipped postcard preview" : "Press and hold to flip"}
                </p>
                {isFlipped ? (
                  <button
                    type="button"
                    onClick={() => setShowIntro(false)}
                    className="rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#243228]/54 transition hover:text-[#243228]/76"
                  >
                    See details
                  </button>
                ) : null}
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: showIntro ? 0.18 : 0, ease: "easeOut" }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
};

const PosterBackFace = ({
  eyebrow,
  title,
  primaryValue,
  secondaryValue,
  footer,
}: {
  eyebrow: string;
  title: string;
  primaryValue: string;
  secondaryValue: string;
  footer: string;
}) => (
  <section className="relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(245,247,241,0.96),rgba(225,236,228,0.92))] p-5 shadow-[0_24px_80px_rgba(76,88,110,0.10)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_34%),radial-gradient(circle_at_bottom,rgba(180,202,188,0.24),transparent_40%)]" />
    <div className="relative space-y-4">
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-sage-500">{eyebrow}</p>
      <h3 className="max-w-[12ch] text-[2.1rem] font-semibold leading-[0.94] tracking-[-0.06em] text-ink">{title}</h3>
    </div>
    <div className="relative space-y-3">
      <div className="rounded-[22px] bg-white/56 px-4 py-4 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-sage-500">Distance</p>
        <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-ink">{primaryValue}</p>
      </div>
      <div className="rounded-[22px] bg-white/42 px-4 py-4 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-sage-500">Impact</p>
        <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink">{secondaryValue}</p>
      </div>
      <p className="pt-1 text-xs uppercase tracking-[0.18em] text-sage-500">{footer}</p>
    </div>
  </section>
);

export const RunResultPage = () => {
  const { routes, state, t } = useAppState();
  const summary = state.lastRunResult;
  const statusCardRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: statusCardRef,
    offset: ["start 85%", "start 28%"],
  });
  const posterDateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  useEffect(() => {
    if (!summary) {
      return;
    }

    const preloadImage = (imageUrl: string) => {
      const img = new Image();
      img.decoding = "async";
      img.src = imageUrl;
    };

    if (summary.runTargetType === "personal" && summary.routeId) {
      preloadImage(routePosterImages[summary.routeId] ?? defaultRunPosterImage);
      return;
    }

    if (summary.runTargetType === "pacecrew_mission") {
      const unlockedDestinationId = summary.unlockedDestinationIds?.[0];
      const unlockedDestination = unlockedDestinationId
        ? routes.find((entry) => entry.id === unlockedDestinationId)
        : null;
      preloadImage(unlockedDestination?.coverImage ?? defaultMissionPosterImage);
    }
  }, [routes, summary]);

  if (!summary) {
    return <Navigate to="/run/setup" replace />;
  }

  if (summary.runTargetType === "pacecrew_mission") {
    const mission = state.paceCrewMissions.find((entry) => entry.id === summary.missionId);
    const crew = state.paceCrews.find((entry) => entry.id === summary.crewId);
    const unlockedDestination = summary.unlockedDestinationIds?.[0]
      ? routes.find((entry) => entry.id === summary.unlockedDestinationIds?.[0])
      : null;

    if (!mission || !crew) {
      return <Navigate to="/pacecrew" replace />;
    }

    const totalMissionStamps =
      summary.earnedStamps + summary.missionRewardStamps + summary.depositReturnedStamps;
    const missionProgressPercent = Math.min(100, Math.round((summary.updatedDistanceKm / mission.targetDistanceKm) * 100));
    const missionPoster = (
      <RunPosterCard
        imageUrl={unlockedDestination?.coverImage ?? defaultMissionPosterImage}
        title={mission.title}
        subtitle={crew.name}
        dateLabel={posterDateLabel}
        topLabel=""
      />
    );
    const missionBackFace = (
      <PosterBackFace
        eyebrow="Mission Result"
        title={mission.title}
        primaryValue={formatDistance(summary.runDistanceKm)}
        secondaryValue={`+${totalMissionStamps} stamps`}
        footer={`${crew.name} · ${summary.sourceName ?? "MileScape"}`}
      />
    );

    return (
      <PosterTransitionShell poster={missionPoster} backFace={missionBackFace}>
        <div className="relative min-h-screen bg-canvas pb-8">
          <ResultHero imageUrl={unlockedDestination?.coverImage ?? defaultMissionPosterImage} />
          <ResultHeroCopy
            eyebrow={t("run.pacecrewMission")}
            title={t("result.youRan", { distance: formatDistance(summary.runDistanceKm) })}
            meta={`${mission.title} · ${crew.name}`}
            progress={scrollYProgress}
          />

          <section
            ref={statusCardRef}
            className="relative z-20 mt-4 rounded-t-[34px] border-t border-white/82 bg-[linear-gradient(180deg,rgba(250,249,245,0.97)_0%,rgba(245,243,238,0.99)_100%)] px-6 pb-8 pt-6 shadow-[0_-20px_40px_rgba(34,49,38,0.10)] backdrop-blur-2xl"
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sage-500">MISSION STATUS</p>
                <h2 className="text-[2.2rem] leading-[0.94] tracking-[-0.05em] text-ink">
                  {summary.missionCompletedAfterRun ? t("result.completed") : "Accepted"}
                </h2>
                <p className="text-[1.05rem] leading-7 text-ink">
                  <span>{formatDistance(summary.appliedDistanceKm)} / {formatDistance(mission.targetDistanceKm)}</span>
                  <span className="px-2 text-sage-400">·</span>
                  <span className="text-sage-600">{mission.title}</span>
                </p>
                <p className="text-sm text-sage-700">
                  Source: {summary.dataSource === "wearable" ? summary.sourceName ?? "Wearable" : summary.sourceName ?? "App input"}
                </p>
                {summary.fallbackReason ? <p className="text-xs text-sage-500">{summary.fallbackReason}</p> : null}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-sage-900/8 pt-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">{t("result.stampsEarned")}</p>
                  <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-ink">+{totalMissionStamps}</p>
                  <p className="mt-2 text-xs text-sage-500">Base {summary.earnedStamps} · Return {summary.depositReturnedStamps}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">{t("result.stampBalance")}</p>
                  <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-ink">{summary.updatedStampsBalance}</p>
                  <p className="mt-2 text-xs text-sage-500">{crew.name}</p>
                </div>
              </div>

              <div className="border-t border-sage-900/8 pt-5">
                <ProgressBar value={missionProgressPercent} />
              </div>

              {unlockedDestination ? (
                <div className="border-t border-sage-900/8 pt-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-sky-700">{t("paceport.pacecrewOnly")}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{unlockedDestination.name} unlocked</h3>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to={`/pacecrew/${crew.id}`} className={buttonStyles({ fullWidth: true })}>
                  {t("result.openPaceCrew")}
                </Link>
                <Link to="/paceport" className={buttonStyles({ fullWidth: true, variant: "secondary" })}>
                  {t("result.viewPaceport")}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </PosterTransitionShell>
    );
  }

  const route = routes.find((entry) => entry.id === summary.routeId);

  if (!route) {
    return <Navigate to="/paceport" replace />;
  }

  const totalLoggedDistanceKm = state.runHistory
    .filter((entry) => entry.runTargetType === "personal" && entry.routeId === route.id)
    .reduce((sum, entry) => sum + entry.distanceKm, 0);
  const previousTotalDistanceKm = Math.max(0, totalLoggedDistanceKm - summary.runDistanceKm);
  const journeyLoop = getJourneyLoopMetrics(totalLoggedDistanceKm, route.totalDistanceKm);
  const progressPercent = getProgressPercent(route, journeyLoop.progressKm);
  const routePosterImage = routePosterImages[route.id] ?? defaultRunPosterImage;
  const paceValue = formatPace(summary.runDistanceKm);
  const averageHeartRate = estimateAverageHeartRate(summary.runDistanceKm, summary.dataSource === "wearable");
  const routeCompletedThisRun =
    previousTotalDistanceKm < route.totalDistanceKm && totalLoggedDistanceKm >= route.totalDistanceKm;
  const personalPoster = (
    <RunPosterCard
      imageUrl={routePosterImage}
      title={route.name}
      subtitle={`${route.city} · ${route.country}`}
      dateLabel={posterDateLabel}
      topLabel=""
    />
  );
  const personalBackFace = (
    <PosterBackFace
      eyebrow="Run Result"
      title={route.name}
      primaryValue={formatDistance(summary.runDistanceKm)}
      secondaryValue={`+${summary.earnedStamps} stamps`}
      footer={`${summary.sourceName ?? "MileScape"} · ${formatDistance(summary.updatedDistanceKm)} total`}
    />
  );

  return (
    <PosterTransitionShell poster={personalPoster} backFace={personalBackFace}>
      <div className="relative min-h-screen bg-canvas pb-8">
        <ResultHero imageUrl={routePosterImage} />
        <ResultHeroCopy
          eyebrow={t("result.runCompleted")}
          title={route.name}
          meta={t("result.youRan", { distance: formatDistance(summary.runDistanceKm) })}
          progress={scrollYProgress}
        />

        <section
          ref={statusCardRef}
          className="relative z-20 mt-10 rounded-t-[34px] border-t border-white/82 bg-[linear-gradient(180deg,rgba(250,249,245,0.97)_0%,rgba(245,243,238,0.99)_100%)] px-6 pb-8 pt-6 shadow-[0_-20px_40px_rgba(34,49,38,0.10)] backdrop-blur-2xl"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sage-500">RUN STATUS</p>
              <h2 className="text-[2.2rem] leading-[0.94] tracking-[-0.05em] text-ink">
                {routeCompletedThisRun ? t("result.completed") : t("result.active")}
              </h2>
              <p className="text-[1.08rem] leading-7 text-ink">
                <span className="font-medium">{formatDistance(previousTotalDistanceKm)} before</span>
                <span className="px-2 text-sage-400">+</span>
                <span className="text-sage-600">{formatDistance(summary.runDistanceKm)} today</span>
              </p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-6 text-sage-600">
                <span className="inline-flex items-center rounded-full bg-sage-900/6 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-sage-700">
                  Loop {journeyLoop.cycleCount}
                </span>
                <span>{route.name}</span>
                <span className="text-sage-400">·</span>
                <span>{formatDistance(route.totalDistanceKm)} route</span>
              </p>
              <p className="text-sm text-sage-700">
                Source: {summary.dataSource === "wearable" ? summary.sourceName ?? "Wearable" : summary.sourceName ?? "App input"}
                {summary.plannedDistanceKm && summary.plannedDistanceKm !== summary.runDistanceKm
                  ? ` · Planned ${formatDistance(summary.plannedDistanceKm)}`
                  : ""}
              </p>
              {summary.fallbackReason ? <p className="text-xs text-sage-500">{summary.fallbackReason}</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-sage-900/8 pt-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">{t("result.stampsEarned")}</p>
                <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-ink">+{summary.earnedStamps}</p>
                <p className="mt-2 text-xs text-sage-500">{t("result.balance", { count: summary.updatedStampsBalance })}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">{t("result.runCount")}</p>
                <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-ink">{summary.updatedRunCount}</p>
                <p className="mt-2 text-xs text-sage-500">{achievementLabel[summary.updatedAchievementTier]}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-sage-900/8 pt-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">Pace</p>
                <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-ink">{paceValue}</p>
                <p className="mt-2 text-xs text-sage-500">Average moving pace</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">Avg heart rate</p>
                <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-ink">{averageHeartRate}</p>
                <p className="mt-2 text-xs text-sage-500">
                  {summary.dataSource === "wearable" ? "Captured from wearable run" : "Estimated from run effort"}
                </p>
              </div>
            </div>

            <div className="border-t border-sage-900/8 pt-5">
              <ProgressBar value={progressPercent} />
              <p className="mt-3 text-sm leading-6 text-sage-600">
                Progress tracks the current route loop, while your total distance keeps accumulating across repeats.
              </p>
            </div>

            <section className="space-y-4 border-t border-sage-900/8 pt-5">
              <SectionHeader
                eyebrow={t("result.unlocks")}
                title={summary.newlyUnlockedLandmarks.length > 0 ? t("result.newMemories") : t("result.noLandmark")}
              />
              <AnimatePresence mode="popLayout">
                {summary.newlyUnlockedLandmarks.length > 0 ? (
                  <div className="space-y-4">
                    {summary.newlyUnlockedLandmarks.map((landmark, index) => (
                      <motion.div
                        key={landmark.id}
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ delay: index * 0.08, duration: 0.35 }}
                        className="border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0"
                      >
                        <p className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sage-700">
                          <Sparkles className="h-3.5 w-3.5" />
                          Landmark unlocked
                        </p>
                        <h3 className="mt-3 text-lg font-semibold text-ink">{landmark.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-sage-700">{landmark.description}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-sage-700">{t("result.noNewLandmark")}</p>
                )}
              </AnimatePresence>
            </section>

            <Link to="/paceport" className={buttonStyles({ fullWidth: true })}>
              {t("result.viewPaceport")}
            </Link>
          </div>
        </section>
      </div>
    </PosterTransitionShell>
  );
};
