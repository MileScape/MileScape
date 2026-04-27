import { Award } from "lucide-react";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { getRouteProgress } from "../utils/progress";

export const AchievementsPage = () => {
  const { routes, state } = useAppState();
  const unlockedEntries = routes.flatMap((route) => {
    const progress = getRouteProgress(route.id, state);
    return route.landmarks
      .filter((landmark) => progress.unlockedLandmarkIds.includes(landmark.id))
      .map((landmark) => ({ route, landmark }));
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Collection"
        title="Unlocked landmarks and route memories"
        description="This page acts as a simple achievements gallery for the MVP and can evolve into a badge system later."
      />

      <section className="rounded-[30px] bg-white p-5 shadow-card ring-1 ring-sage-100">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sage-50 p-3 text-sage-700">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{unlockedEntries.length} memories unlocked</p>
            <p className="text-sm text-sage-600">Across {routes.length} themed routes</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {unlockedEntries.length > 0 ? (
          unlockedEntries.map(({ route, landmark }) => (
            <div
              key={landmark.id}
              className="rounded-[28px] bg-white p-4 shadow-card ring-1 ring-sage-100"
            >
              <div className="flex items-center gap-4">
                <RouteArtwork routeId={route.id} size="sm" />
                <div className="min-w-0 flex-1 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-sage-500">{route.name}</p>
                <h3 className="text-xl font-semibold text-ink">{landmark.name}</h3>
                <p className="text-sm leading-6 text-sage-700">{landmark.description}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[28px] bg-sage-50 p-5 ring-1 ring-sage-100">
            <p className="text-sm leading-6 text-sage-700">
              No memories unlocked yet. Start a short run and the first landmark should arrive quickly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
