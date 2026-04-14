import { MapPin } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { LandmarkTimeline } from "../components/route/LandmarkTimeline";
import { buttonStyles } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, getProgressPercent, getRouteProgress } from "../utils/progress";

export const RouteDetailPage = () => {
  const { routeId } = useParams();
  const { routes, state, selectRoute } = useAppState();
  const route = routes.find((entry) => entry.id === routeId);

  if (!route) {
    return <Navigate to="/explore" replace />;
  }

  const progress = getRouteProgress(route.id, state);
  const progressPercent = getProgressPercent(route, progress.completedDistanceKm);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] bg-white px-5 py-6 shadow-card ring-1 ring-sage-100">
        <div className="space-y-5">
          <div className="flex justify-center">
            <RouteArtwork routeId={route.id} label={route.city} />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sage-50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sage-700">
            <MapPin className="h-4 w-4" />
            {route.city}, {route.country}
          </div>
          <div className="space-y-3 text-ink">
            <h1 className="text-3xl font-semibold tracking-tight">{route.name}</h1>
            <p className="max-w-lg text-sm leading-6 text-sage-700">{route.motivation}</p>
          </div>
          <div className="grid gap-4 rounded-[28px] bg-sage-50 p-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">Total route</p>
              <p className="mt-2 text-xl font-semibold text-ink">{formatDistance(route.totalDistanceKm)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">Your progress</p>
              <p className="mt-2 text-xl font-semibold text-ink">{formatDistance(progress.completedDistanceKm)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sage-500">Unlocked</p>
              <p className="mt-2 text-xl font-semibold text-ink">
                {progress.unlockedLandmarkIds.length}/{route.landmarks.length}
              </p>
            </div>
          </div>
          <ProgressBar value={progressPercent} className="bg-sage-100" />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Route Story"
          title="Landmark timeline"
          description={route.description}
        />
        <LandmarkTimeline
          landmarks={route.landmarks}
          unlockedIds={progress.unlockedLandmarkIds}
        />
      </section>

      <Link
        to="/run/setup"
        className={buttonStyles({ fullWidth: true })}
        onClick={() => {
          selectRoute(route.id);
        }}
      >
        Start a run on this route
      </Link>
    </div>
  );
};
