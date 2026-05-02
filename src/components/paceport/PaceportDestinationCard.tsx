import { ArrowRight, CheckCircle2, Lock, Route as RouteIcon, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import type { AchievementTier, PaceportStatus, Route } from "../../types";
import { formatCountryName } from "../../utils/location";
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
  achievementTier
}: PaceportDestinationCardProps) => (
  <Link
    to={`/paceport/${route.id}`}
    className="group rounded-[28px] bg-white/74 px-4 py-4 ring-1 ring-sage-900/8 backdrop-blur-xl transition hover:bg-white/84"
  >
    <div className="flex items-start gap-4">
      <div className="relative shrink-0">
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
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">
              {route.city.toUpperCase()} · {formatCountryName(route.country, { uppercase: true })}
            </p>
            <h3 className="mt-1 text-[1.08rem] font-semibold tracking-[-0.02em] text-ink">{route.name}</h3>
            <p className="mt-2 text-sm text-sage-600">
              {formatDistance(completedDistanceKm)} / {formatDistance(route.totalDistanceKm)} km · {unlockedLandmarkCount} / {route.landmarks.length} landmarks · {runCount} runs
            </p>
          </div>
          <span className="rounded-full bg-sage-100/70 px-2.5 py-1 text-[11px] font-medium text-sage-700">
            {statusLabels[status]}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {route.crewOnly ? (
            <span className="rounded-full bg-sky-100/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-sky-700">
              PaceCrew Only
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/82 px-2.5 py-1 text-[11px] font-medium text-sage-700 ring-1 ring-sage-900/8">
            <Trophy className="h-3.5 w-3.5" />
            {tierLabels[achievementTier]}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-sage-900/6 pt-3 text-sm">
          <span className="text-sage-500">{Math.round(progressPercent)}% explored</span>
          <span className="inline-flex items-center gap-1 text-sage-600">
            View
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </div>
  </Link>
);
