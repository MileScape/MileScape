import { CheckCircle2, Lock, Route as RouteIcon, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import type { AchievementTier, PaceportStatus, Route } from "../../types";
import { formatDistance } from "../../utils/progress";
import { ProgressRing } from "./ProgressRing";

interface PaceportDestinationCardProps {
  route: Route;
  status: PaceportStatus;
  progressPercent: number;
  completedDistanceKm: number;
  unlockedLandmarkCount: number;
  runCount: number;
  achievementTier: AchievementTier;
  sourceCrewName?: string;
}

const tierLabels: Record<AchievementTier, string> = {
  none: "No Tier",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  prism: "Prism"
};

const statusLabels: Record<PaceportStatus, string> = {
  locked: "Locked",
  owned: "Owned",
  in_progress: "In Progress",
  completed: "Completed"
};

export const PaceportDestinationCard = ({
  route,
  status,
  progressPercent,
  completedDistanceKm,
  unlockedLandmarkCount,
  runCount,
  achievementTier,
  sourceCrewName
}: PaceportDestinationCardProps) => (
  <Link
    to={`/paceport/${route.id}`}
    className="rounded-[30px] bg-white p-4 shadow-card ring-1 ring-sage-100 transition hover:-translate-y-0.5"
  >
    <div className="flex items-start gap-4">
      <div className="relative">
        <ProgressRing value={progressPercent} />
        <div className="absolute inset-0 flex items-center justify-center">
          {status === "locked" ? (
            <Lock className="h-5 w-5 text-sage-400" />
          ) : status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-sage-700" />
          ) : (
            <RouteIcon className="h-5 w-5 text-sage-600" />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sage-500">
              {route.city}, {route.country}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-ink">{route.name}</h3>
            {route.crewOnly ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  PaceCrew Only
                </span>
                {sourceCrewName ? (
                  <span className="text-xs text-sage-500">From PaceCrew: {sourceCrewName}</span>
                ) : null}
              </div>
            ) : null}
          </div>
          <span className="rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-700">
            {statusLabels[status]}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[20px] bg-sage-50 p-3">
            <p className="text-sage-500">Progress</p>
            <p className="mt-1 font-semibold text-ink">
              {formatDistance(completedDistanceKm)} / {formatDistance(route.totalDistanceKm)}
            </p>
          </div>
          <div className="rounded-[20px] bg-sage-50 p-3">
            <p className="text-sage-500">Landmarks</p>
            <p className="mt-1 font-semibold text-ink">
              {unlockedLandmarkCount}/{route.landmarks.length}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="inline-flex items-center gap-2 text-sage-600">
            <Sparkles className="h-4 w-4" />
            {runCount} runs
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sage-700 ring-1 ring-sage-100">
            <Trophy className="h-4 w-4" />
            {tierLabels[achievementTier]}
          </span>
        </div>
      </div>
    </div>
  </Link>
);
