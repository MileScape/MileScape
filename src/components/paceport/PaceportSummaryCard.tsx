import { ArrowRight, Lock, MapPinned, Route as RouteIcon, Stamp } from "lucide-react";
import { Link } from "react-router-dom";
import type { AchievementTier, PaceportStatus, Route } from "../../types";
import { cn } from "../../utils/cn";
import { formatCountryName } from "../../utils/location";
import { formatDistance } from "../../utils/progress";

export interface PaceportRouteSummary {
  route: Route;
  status: PaceportStatus;
  completedDistanceKm: number;
  progressPercent: number;
  unlockedLandmarkCount: number;
  runCount: number;
  achievementTier: AchievementTier;
  completed: boolean;
}

interface PaceportSummaryCardProps {
  countryName: string;
  routes: PaceportRouteSummary[];
  currentStamps: number;
  onUnlock: (routeId: string) => void;
}

const statusLabels: Record<PaceportStatus, string> = {
  locked: "Locked",
  owned: "Ready",
  in_progress: "Active",
  completed: "Complete"
};

const routeSortOrder: Record<PaceportStatus, number> = {
  completed: 0,
  in_progress: 1,
  owned: 2,
  locked: 3
};

export const PaceportSummaryCard = ({ countryName, routes, currentStamps, onUnlock }: PaceportSummaryCardProps) => {
  const sortedRoutes = [...routes].sort((a, b) => {
    if (routeSortOrder[a.status] !== routeSortOrder[b.status]) {
      return routeSortOrder[a.status] - routeSortOrder[b.status];
    }
    if (b.progressPercent !== a.progressPercent) {
      return b.progressPercent - a.progressPercent;
    }
    return a.route.name.localeCompare(b.route.name);
  });

  const unlockedRoutes = sortedRoutes.filter((summary) => summary.status !== "locked");
  const totalDistanceKm = sortedRoutes.reduce((sum, summary) => sum + summary.route.totalDistanceKm, 0);
  const completedDistanceKm = sortedRoutes.reduce((sum, summary) => sum + summary.completedDistanceKm, 0);
  const countryProgressPercent = totalDistanceKm > 0 ? Math.round((completedDistanceKm / totalDistanceKm) * 100) : 0;

  return (
    <section className="relative z-20 -mt-[9.75rem] rounded-t-[34px] border-t border-white/75 bg-[linear-gradient(180deg,rgba(250,249,245,0.97)_0%,rgba(245,243,238,0.99)_100%)] px-6 pb-8 pt-4 shadow-[0_-16px_34px_rgba(34,49,38,0.08)] backdrop-blur-2xl">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-sage-900/10" />
      <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-sage-500">PACEPORT COUNTRY / REGION</p>
      <h2 className="mt-1.5 truncate font-destination-display text-[1.95rem] leading-[0.94] tracking-[0.01em] text-ink">
        {formatCountryName(countryName)}
      </h2>
      <p className="mt-1.5 text-[13px] leading-5 text-sage-600">
        {unlockedRoutes.length} unlocked / {routes.length} route maps · {countryProgressPercent}% explored
      </p>

      <div className="mt-7 space-y-4 border-t border-sage-900/8 pt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sage-500">Routes</p>
        <div className="space-y-3">
          {sortedRoutes.map((summary) => {
            const { route } = summary;
            const locked = summary.status === "locked";
            const canUnlock = currentStamps >= route.priceStamps;
            const cardClassName = cn(
              "group block rounded-[24px] px-4 py-4 ring-1 transition",
              locked
                ? "bg-white/42 text-sage-500 ring-sage-900/6"
                : "bg-white/72 text-ink ring-sage-900/8 hover:bg-white/88",
            );

            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-sage-500">{route.city}</p>
                    <h3 className={cn("mt-1 truncate text-base font-semibold tracking-[-0.02em]", locked && "text-sage-500")}>
                      {route.name}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                      summary.status === "completed" && "bg-sage-700 text-white",
                      summary.status === "in_progress" && "bg-sage-100 text-sage-700",
                      summary.status === "owned" && "bg-white text-sage-700 ring-1 ring-sage-900/8",
                      summary.status === "locked" && "bg-sage-900/5 text-sage-500",
                    )}
                  >
                    {statusLabels[summary.status]}
                  </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sage-900/8">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", locked ? "bg-sage-300/45" : "bg-sage-700")}
                    style={{ width: `${locked ? 0 : Math.round(summary.progressPercent)}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-sage-600">
                  <span className="inline-flex items-center gap-1">
                    {locked ? <Lock className="h-3.5 w-3.5" /> : <RouteIcon className="h-3.5 w-3.5" />}
                    {locked ? `${route.priceStamps} stamps` : `${formatDistance(summary.completedDistanceKm)} / ${formatDistance(route.totalDistanceKm)}`}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPinned className="h-3.5 w-3.5" />
                    {summary.unlockedLandmarkCount}/{route.landmarks.length}
                  </span>
                  {locked ? (
                    <span className="ml-auto text-sage-500">{canUnlock ? "Ready to unlock" : "Need more stamps"}</span>
                  ) : (
                    <span className="ml-auto inline-flex items-center gap-1 font-medium text-sage-600">
                      View
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  )}
                </div>
              </>
            );

            if (!locked) {
              return (
                <Link key={route.id} to={`/paceport/${route.id}`} className={cardClassName}>
                  {content}
                </Link>
              );
            }

            return (
              <div key={route.id} className={cardClassName}>
                {content}
                <button
                  type="button"
                  onClick={() => onUnlock(route.id)}
                  disabled={!canUnlock}
                  className={cn(
                    "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition",
                    canUnlock
                      ? "bg-sage-700 text-white hover:bg-sage-800"
                      : "bg-sage-900/5 text-sage-400",
                  )}
                >
                  <Stamp className="h-4 w-4" />
                  {canUnlock ? `Unlock for ${route.priceStamps}` : `${currentStamps} / ${route.priceStamps} stamps`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
