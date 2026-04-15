import { PaceportDestinationCard } from "../components/paceport/PaceportDestinationCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { getPaceportSummary } from "../utils/paceport";

export const PaceportOverviewPage = () => {
  const { routes, state } = useAppState();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Paceport"
        title="Your destinations, progress, and achievements"
        description="Paceport merges destination ownership, route progress, landmark unlocks, and run-based achievement tiers."
      />

      <div className="grid gap-4">
        {routes.map((route) => {
          const summary = getPaceportSummary(route, state);

          return (
            <PaceportDestinationCard
              key={route.id}
              route={route}
              status={summary.status}
              progressPercent={summary.progressPercent}
              completedDistanceKm={summary.progress.completedDistanceKm}
              unlockedLandmarkCount={summary.unlockedLandmarkCount}
              runCount={summary.runCount}
              achievementTier={summary.achievementTier}
            />
          );
        })}
      </div>
    </div>
  );
};
