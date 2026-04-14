import { Link } from "react-router-dom";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { buttonStyles } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { getRouteProgress } from "../utils/progress";

export const ExplorePage = () => {
  const { routes, state } = useAppState();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Destinations"
        title="Choose an abstract landmark world"
        description="These route visuals are intentionally illustration-like so the app feels playful and symbolic instead of photo-real."
      />
      <div className="grid gap-5">
        {routes.map((route) => (
          <Link
            key={route.id}
            to={`/routes/${route.id}`}
            className="rounded-[30px] bg-white p-5 shadow-card ring-1 ring-sage-100"
          >
            <div className="flex items-center gap-4">
              <RouteArtwork routeId={route.id} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-sage-500">
                  {route.city}, {route.country}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-ink">{route.name}</h3>
                <p className="mt-2 text-sm leading-6 text-sage-700">{route.description}</p>
                <p className="mt-3 text-sm font-medium text-sage-700">
                  Progress: {getRouteProgress(route.id, state).completedDistanceKm} / {route.totalDistanceKm} km
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link to="/run/setup" className={buttonStyles({ fullWidth: true })}>
        Continue to run setup
      </Link>
    </div>
  );
};
