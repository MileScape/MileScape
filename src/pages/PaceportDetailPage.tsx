import { Lock, MapPin, Trophy } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { LandmarkTimeline } from "../components/route/LandmarkTimeline";
import { buttonStyles } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { getAchievementTier } from "../utils/achievement";
import { getPaceportSummary } from "../utils/paceport";
import { formatDistance } from "../utils/progress";

export const achievementLabel = {
  none: "No Tier",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  prism: "Prism"
} as const;

export const PaceportDetailPage = () => {
  const { routeId } = useParams();
  const { routes, state, selectRoute, t } = useAppState();
  const route = routes.find((entry) => entry.id === routeId);

  if (!route) {
    return <Navigate to="/paceport" replace />;
  }

  const summary = getPaceportSummary(route, state);
  const owned = summary.status !== "locked";
  const achievementTier = getAchievementTier(summary.runCount);

  return (
    <div className="space-y-6">
      <section className="rounded-[36px] bg-white p-6 shadow-card ring-1 ring-sage-100">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-sage-50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sage-700">
            <MapPin className="h-4 w-4" />
            {route.city}, {route.country}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-ink">{route.name}</h1>
            {route.crewOnly ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  {t("paceport.pacecrewOnly")}
                </span>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-sage-500">Status</p>
              <p className="mt-2 font-semibold text-ink">
                {owned ? summary.status.replace("_", " ") : "locked"}
              </p>
            </div>
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-sage-500">Progress</p>
              <p className="mt-2 font-semibold text-ink">
                {formatDistance(summary.progress.completedDistanceKm)}
              </p>
            </div>
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-sage-500">Runs</p>
              <p className="mt-2 font-semibold text-ink">{summary.runCount}</p>
            </div>
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-sage-500">Tier</p>
              <p className="mt-2 inline-flex items-center gap-2 font-semibold text-ink">
                <Trophy className="h-4 w-4 text-sage-600" />
                {achievementLabel[achievementTier]}
              </p>
            </div>
          </div>

          <ProgressBar value={summary.progressPercent} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="Landmarks" title={t("paceport.destinationUnlocks")} />
        <LandmarkTimeline
          landmarks={route.landmarks}
          unlockedIds={summary.progress.unlockedLandmarkIds}
        />
      </section>

      {owned && !route.crewOnly ? (
        <Link
          to="/run/setup"
          className={buttonStyles({ fullWidth: true })}
          onClick={() => selectRoute(route.id)}
        >
          {t("paceport.startRun")}
        </Link>
      ) : owned && route.crewOnly ? (
        <div className="rounded-[28px] bg-sky-50 px-5 py-4 ring-1 ring-sky-100">
          <p className="text-xs uppercase tracking-[0.18em] text-sky-700">{t("paceport.exclusiveTeamReward")}</p>
        </div>
      ) : (
        <Link to="/shop" className={buttonStyles({ fullWidth: true })}>
          <span className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {t("paceport.unlockInShop")}
          </span>
        </Link>
      )}
    </div>
  );
};
