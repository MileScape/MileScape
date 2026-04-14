import { ArrowRight, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";
import type { Route } from "../../types";
import { formatDistance, getProgressPercent } from "../../utils/progress";
import { ProgressBar } from "../ui/ProgressBar";

interface RouteCardProps {
  route: Route;
  completedDistanceKm: number;
}

export const RouteCard = ({ route, completedDistanceKm }: RouteCardProps) => {
  const progressPercent = getProgressPercent(route, completedDistanceKm);

  return (
    <Link
      to={`/routes/${route.id}`}
      className="overflow-hidden rounded-[28px] bg-white shadow-card ring-1 ring-sage-100 transition hover:-translate-y-0.5"
    >
      <div
        className="h-44 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(36, 50, 40, 0.05), rgba(36, 50, 40, 0.35)), url(${route.coverImage})` }}
      />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sage-500">
              {route.city}, {route.country}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-ink">{route.name}</h3>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 text-sage-400" />
        </div>

        <p className="text-sm leading-6 text-sage-700">{route.description}</p>

        <div className="rounded-3xl bg-sage-50 p-4">
          <div className="mb-3 flex items-center justify-between text-sm text-sage-700">
            <span className="inline-flex items-center gap-2">
              <MapPinned className="h-4 w-4" />
              {formatDistance(completedDistanceKm)} explored
            </span>
            <span>{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} />
          <p className="mt-3 text-xs text-sage-600">
            {route.landmarks.length} landmarks across {formatDistance(route.totalDistanceKm)}
          </p>
        </div>
      </div>
    </Link>
  );
};
