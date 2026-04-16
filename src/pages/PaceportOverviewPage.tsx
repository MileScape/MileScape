import { PaceportDestinationCard } from "../components/paceport/PaceportDestinationCard";
import { useAppState } from "../hooks/useAppState";
import { getPaceportSummary } from "../utils/paceport";

export const PaceportOverviewPage = () => {
  const { routes, state, t } = useAppState();
  const ownedCount = routes.filter((route) => getPaceportSummary(route, state).status !== "locked").length;

  return (
    <div className="space-y-8">
      <section className="space-y-2 pt-1">
        <p className="text-[11px] uppercase tracking-[0.28em] text-sage-500">MILESCAPE</p>
        <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-ink">{t("app.paceport")}</h2>
        <p className="text-sm text-sage-600">{t("paceport.title")}</p>
      </section>

      <section className="rounded-[28px] bg-white/70 px-4 py-4 ring-1 ring-sage-900/8 backdrop-blur-xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Archive</p>
            <p className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink">{ownedCount}</p>
          </div>
          <p className="text-sm text-sage-600">{routes.length} destinations</p>
        </div>
      </section>

      <div className="grid gap-3">
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
