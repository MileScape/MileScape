import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatCard } from "../components/ui/StatCard";
import { HistoryList } from "../components/profile/HistoryList";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, getRouteProgress } from "../utils/progress";

export const DashboardPage = () => {
  const { routes, state, resetDemo } = useAppState();
  const totalDistance = state.runHistory.reduce((sum, run) => sum + run.distanceKm, 0);
  const routesInProgress = routes.filter((route) => {
    const progress = getRouteProgress(route.id, state);
    return progress.completedDistanceKm > 0 && !progress.completed;
  }).length;
  const completedRoutes = routes.filter((route) => getRouteProgress(route.id, state).completed)
    .length;
  const unlockedLandmarks = state.routeProgress.reduce(
    (sum, entry) => sum + entry.unlockedLandmarkIds.length,
    0,
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Dashboard"
        title="Your running journey so far"
        description="A compact profile view that surfaces the metrics most useful for a coursework MVP demo."
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total distance" value={formatDistance(totalDistance)} hint="Across all simulated runs" />
        <StatCard label="Routes in progress" value={String(routesInProgress)} hint="Active travel stories" />
        <StatCard label="Completed routes" value={String(completedRoutes)} hint="Fully explored journeys" />
        <StatCard label="Landmarks unlocked" value={String(unlockedLandmarks)} hint="Collectible memories found" />
      </div>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Recent Runs"
          title="History"
          description="Simple local run history gives continuity to the demo and supports future streak features."
        />
        {state.runHistory.length > 0 ? (
          <HistoryList history={state.runHistory} routes={routes} />
        ) : (
          <div className="rounded-[28px] bg-sage-50 p-5 ring-1 ring-sage-100">
            <p className="text-sm leading-6 text-sage-700">
              No runs yet. Use the setup page to create the first result state.
            </p>
          </div>
        )}
      </section>

      <Button variant="secondary" fullWidth onClick={resetDemo}>
        Reset demo data
      </Button>
    </div>
  );
};
