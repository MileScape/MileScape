import { PaceportDestinationCard } from "../components/paceport/PaceportDestinationCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { getPaceportSummary } from "../utils/paceport";

export const PaceportOverviewPage = () => {
  const { routes, state, t } = useAppState();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={t("app.paceport")}
        title={t("paceport.title")}
      />

      <div className="grid gap-4">
        {routes.map((route) => {
          const summary = getPaceportSummary(route, state);
          const sourceCrewName =
            route.sourceCrewId
              ? state.paceCrews.find((crew) => crew.id === route.sourceCrewId)?.name
              : undefined;

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
              sourceCrewName={sourceCrewName}
            />
          );
        })}
      </div>
    </div>
  );
};
