import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { buttonStyles } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { achievementLabel } from "../pages/PaceportDetailPage";
import { formatDistance, getProgressPercent } from "../utils/progress";

export const RunResultPage = () => {
  const { routes, state } = useAppState();
  const summary = state.lastRunResult;

  if (!summary) {
    return <Navigate to="/run/setup" replace />;
  }

  const route = routes.find((entry) => entry.id === summary.routeId);

  if (!route) {
    return <Navigate to="/paceport" replace />;
  }

  const progressPercent = getProgressPercent(route, summary.updatedDistanceKm);

  return (
    <div className="space-y-6">
      <section className="rounded-[36px] bg-white p-6 shadow-card ring-1 ring-sage-100">
        <div className="space-y-5">
          <div className="flex justify-center">
            <RouteArtwork routeId={route.id} size="md" />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-sage-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage-700">
            <CheckCircle2 className="h-4 w-4" />
            Run completed
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              You ran {formatDistance(summary.runDistanceKm)}
            </h1>
            <p className="mt-3 text-sm leading-6 text-sage-700">
              Applied to {route.name}: {formatDistance(summary.appliedDistanceKm)}. Current destination progress is now{" "}
              {formatDistance(summary.updatedDistanceKm)} of {formatDistance(route.totalDistanceKm)}.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">Overflow</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {formatDistance(summary.overflowDistanceKm)}
              </p>
              <p className="mt-2 text-sm text-sage-700">
                {summary.overflowDistanceKm > 0
                  ? "Extra distance did not increase this destination’s progress."
                  : "No overflow on this run."}
              </p>
            </div>
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">Stamps earned</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="text-3xl font-semibold text-ink">+{summary.earnedStamps}</p>
                <p className="text-sm font-medium text-sage-700">
                  Balance: {summary.updatedStampsBalance}
                </p>
              </div>
            </div>
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">Run count</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.updatedRunCount}</p>
              <p className="mt-2 text-sm text-sage-700">
                Achievement tier: {achievementLabel[summary.updatedAchievementTier]}
              </p>
            </div>
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">Destination status</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {summary.destinationCompletedAfterRun ? "Completed" : "Active"}
              </p>
              <p className="mt-2 text-sm text-sage-700">
                {summary.destinationCompletedAfterRun
                  ? "This destination reached its total route distance."
                  : "Keep running to finish the remaining distance."}
              </p>
            </div>
          </div>
          <ProgressBar value={progressPercent} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Unlocks"
          title={
            summary.newlyUnlockedLandmarks.length > 0
              ? "New memories collected"
              : "No new landmark this time"
          }
          description={
            summary.newlyUnlockedLandmarks.length > 0
              ? "Crossing milestones triggers lightweight celebration states for demo-friendly feedback."
              : "The journey still moved forward. Another short run may unlock the next stop."
          }
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
              <p className="text-sm leading-6 text-sage-700">
                Stay with the same route to build narrative continuity and reach the next unlock faster.
              </p>
            </div>
          )}
        </AnimatePresence>
      </section>

      {summary.destinationCompletedAfterRun ? (
        <section className="rounded-[30px] bg-sage-700 p-5 text-white shadow-card">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Route completed</p>
          <h2 className="mt-2 text-2xl font-semibold">Journey complete</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            This route is now fully explored. The completion state can later expand into a richer celebration screen.
          </p>
        </section>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Link to={`/paceport/${route.id}`} className={buttonStyles({ fullWidth: true })}>
          Open Paceport
        </Link>
        <Link
          to="/paceport"
          className={buttonStyles({ fullWidth: true, variant: "secondary" })}
        >
          View Paceport
        </Link>
      </div>
      <Link to="/shop" className={buttonStyles({ fullWidth: true, variant: "secondary" })}>
        Spend Stamps in shop
      </Link>
    </div>
  );
};
