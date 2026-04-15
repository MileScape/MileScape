import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatCard } from "../components/ui/StatCard";
import { HistoryList } from "../components/profile/HistoryList";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, getRouteProgress } from "../utils/progress";

export const DashboardPage = () => {
  const { routes, state, resetDemo, setSliderMaxDistanceKm } = useAppState();
  const [sliderMaxInput, setSliderMaxInput] = useState(String(state.sliderMaxDistanceKm));
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
  const ownedRoutes = state.purchasedRouteIds.length;

  useEffect(() => {
    setSliderMaxInput(String(state.sliderMaxDistanceKm));
  }, [state.sliderMaxDistanceKm]);

  const parsedSliderMaxInput = Number(sliderMaxInput);
  const sliderMaxValid =
    Number.isFinite(parsedSliderMaxInput) &&
    parsedSliderMaxInput >= 1 &&
    parsedSliderMaxInput <= 100;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Dashboard"
        title="Your running journey so far"
        description="A compact profile view that surfaces the metrics most useful for a coursework MVP demo."
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total distance" value={formatDistance(totalDistance)} hint="Across all simulated runs" />
        <StatCard label="Stamp balance" value={String(state.currentStamps)} hint="Spend these in the shop" />
        <StatCard label="Routes in progress" value={String(routesInProgress)} hint="Active travel stories" />
        <StatCard label="Owned routes" value={String(ownedRoutes)} hint="Unlocked destinations in Paceport" />
        <StatCard label="Completed routes" value={String(completedRoutes)} hint="Fully explored journeys" />
        <StatCard label="Landmarks unlocked" value={String(unlockedLandmarks)} hint="Collectible memories found" />
      </div>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Settings"
          title="Run distance range"
          description="Set the maximum distance shown on the run setup slider. This lets heavier runners drag across a larger range without putting custom input on the main screen."
        />
        <div className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">Custom max distance</p>
              <p className="mt-1 text-sm text-sage-600">
                Current slider range: 0 to {state.sliderMaxDistanceKm} km
              </p>
            </div>
            <div className="rounded-full bg-sage-50 px-4 py-2 text-sm font-medium text-sage-700">
              Max 100 km
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex flex-1 items-center rounded-[20px] bg-sage-50 px-4 py-3 ring-1 ring-sage-100">
              <input
                type="number"
                inputMode="decimal"
                min="1"
                max="100"
                step="1"
                value={sliderMaxInput}
                onChange={(event) => setSliderMaxInput(event.target.value)}
                className="w-full border-none bg-transparent text-lg font-semibold text-ink outline-none"
              />
              <span className="text-sm font-medium text-sage-500">km</span>
            </div>
            <Button
              onClick={() => {
                if (sliderMaxValid) {
                  setSliderMaxDistanceKm(parsedSliderMaxInput);
                }
              }}
              disabled={!sliderMaxValid}
            >
              Save
            </Button>
          </div>

          <p className="mt-3 text-xs text-sage-500">
            {sliderMaxValid
              ? "The run setup slider will use this new maximum distance."
              : "Enter a whole number between 1 and 100."}
          </p>
        </div>
      </section>

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
