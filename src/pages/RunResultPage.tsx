import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Flag, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
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
};

const PosterTransitionShell = ({
  poster,
  children,
}: {
  poster: ReactNode;
  children: ReactNode;
}) => {
  const [showIntro, setShowIntro] = useState(true);

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
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <button
                  type="button"
                  onClick={() => setShowIntro(false)}
                  className="relative block w-full cursor-pointer rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] p-3 text-left shadow-[0_24px_72px_rgba(63,84,72,0.10)] backdrop-blur-[24px]"
                  aria-label="Close poster preview"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.008)_30%,rgba(255,255,255,0)_100%)]" />
                  {poster}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.45, ease: "easeOut" }}
                className="mt-5 flex flex-col items-center gap-3 text-center"
              >
                <p className="text-sm text-[#4a5d55]">点击海报继续查看本次跑步结果</p>
                <button
                  type="button"
                  onClick={() => setShowIntro(false)}
                  className="rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(255,255,255,0.24))] px-5 py-3 text-sm font-semibold text-[#243228] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_14px_30px_rgba(36,50,40,0.06)] backdrop-blur-lg transition hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.56),rgba(255,255,255,0.30))]"
                >
                  查看结果
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: showIntro ? 0.18 : 0, ease: "easeOut" }}
        className="space-y-6"
      >
        {poster}
        {children}
      </motion.div>
    </div>
  );
};

export const RunResultPage = () => {
  const { routes, state, t } = useAppState();
  const summary = state.lastRunResult;

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
      />
    );

    return (
      <PosterTransitionShell poster={missionPoster}>
        <section className="rounded-[36px] bg-white p-6 shadow-card ring-1 ring-sage-100">
          <div className="space-y-5">
            <div className="flex justify-center">
              <div className="rounded-[32px] bg-gradient-to-br from-sky-50 via-white to-sage-50 p-6 ring-1 ring-sky-100">
                <Flag className="h-10 w-10 text-sky-600" />
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              <Users className="h-4 w-4" />
              {t("run.pacecrewMission")}
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-ink">{t("result.youRan", { distance: formatDistance(summary.runDistanceKm) })}</h1>
              <p className="mt-3 text-sm text-sage-700">
                {mission.title}: {formatDistance(summary.appliedDistanceKm)} / {formatDistance(mission.targetDistanceKm)}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] bg-sage-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("result.overflowMission")}</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{formatDistance(summary.overflowDistanceKm)}</p>
              </div>
              <div className="rounded-[24px] bg-sage-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("result.stampsEarned")}</p>
                <p className="mt-2 text-3xl font-semibold text-ink">+{totalMissionStamps}</p>
                <p className="mt-2 text-sm text-sage-700">Base {summary.earnedStamps} · Return {summary.depositReturnedStamps} · Reward {summary.missionRewardStamps}</p>
              </div>
              <div className="rounded-[24px] bg-sage-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("result.missionState")}</p>
                <p className="mt-2 text-2xl font-semibold text-ink">
                  {summary.missionCompletedAfterRun ? t("result.completed") : "Accepted"}
                </p>
                <p className="mt-2 text-sm text-sage-700">{crew.name}</p>
              </div>
              <div className="rounded-[24px] bg-sage-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("result.stampBalance")}</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{summary.updatedStampsBalance}</p>
              </div>
            </div>
            <ProgressBar value={missionProgressPercent} />
          </div>
        </section>

        {unlockedDestination ? (
          <section className="rounded-[30px] bg-sky-50 p-5 ring-1 ring-sky-100">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-700">{t("paceport.pacecrewOnly")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{unlockedDestination.name} unlocked</h2>
          </section>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Link to={`/pacecrew/${crew.id}`} className={buttonStyles({ fullWidth: true })}>
            {t("result.openPaceCrew")}
          </Link>
          <Link to="/paceport" className={buttonStyles({ fullWidth: true, variant: "secondary" })}>
            {t("result.viewPaceport")}
          </Link>
        </div>
      </PosterTransitionShell>
    );
  }

  const route = routes.find((entry) => entry.id === summary.routeId);

  if (!route) {
    return <Navigate to="/paceport" replace />;
  }

  const progressPercent = getProgressPercent(route, summary.updatedDistanceKm);
  const routePosterImage = routePosterImages[route.id] ?? defaultRunPosterImage;
  const personalPoster = (
    <RunPosterCard
      imageUrl={routePosterImage}
      title={route.name}
      subtitle={`${route.city} · ${route.country}`}
    />
  );

  return (
    <PosterTransitionShell poster={personalPoster}>
      <section className="rounded-[36px] bg-white p-6 shadow-card ring-1 ring-sage-100">
        <div className="space-y-5">
          <div className="flex justify-center">
            <RouteArtwork routeId={route.id} size="md" />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-sage-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage-700">
            <CheckCircle2 className="h-4 w-4" />
            {t("result.runCompleted")}
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">{t("result.youRan", { distance: formatDistance(summary.runDistanceKm) })}</h1>
            <p className="mt-3 text-sm text-sage-700">
                {route.name}: {formatDistance(summary.updatedDistanceKm)} / {formatDistance(route.totalDistanceKm)}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("result.overflow")}</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{formatDistance(summary.overflowDistanceKm)}</p>
              </div>
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("result.stampsEarned")}</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="text-3xl font-semibold text-ink">+{summary.earnedStamps}</p>
                <p className="text-sm font-medium text-sage-700">{t("result.balance", { count: summary.updatedStampsBalance })}</p>
              </div>
            </div>
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("result.runCount")}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.updatedRunCount}</p>
              <p className="mt-2 text-sm text-sage-700">
                Achievement tier: {achievementLabel[summary.updatedAchievementTier]}
              </p>
            </div>
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("result.destinationStatus")}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.destinationCompletedAfterRun ? t("result.completed") : t("result.active")}</p>
            </div>
          </div>
          <ProgressBar value={progressPercent} />
        </div>
      </section>

      <section className="space-y-4">
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
                  className="rounded-[28px] bg-white p-4 shadow-card ring-1 ring-sage-100"
                >
                  <div className="flex gap-4">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-sage-100 to-sky-100">
                      <Sparkles className="h-8 w-8 text-sage-700" />
                    </div>
                    <div>
                      <p className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sage-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        Landmark unlocked
                      </p>
                      <h3 className="mt-3 text-lg font-semibold text-ink">{landmark.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-sage-700">{landmark.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] bg-sage-50 p-5 ring-1 ring-sage-100">
              <p className="text-sm text-sage-700">{t("result.noNewLandmark")}</p>
            </div>
          )}
        </AnimatePresence>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link to={`/paceport/${route.id}`} className={buttonStyles({ fullWidth: true })}>
          {t("result.openPaceport")}
        </Link>
        <Link to="/paceport" className={buttonStyles({ fullWidth: true, variant: "secondary" })}>
          {t("result.viewPaceport")}
        </Link>
      </div>
      <Link to="/shop" className={buttonStyles({ fullWidth: true, variant: "secondary" })}>
        {t("result.spendInShop")}
      </Link>
    </PosterTransitionShell>
  );
};
