import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatCard } from "../components/ui/StatCard";
import { HistoryList } from "../components/profile/HistoryList";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, getRouteProgress } from "../utils/progress";

export const DashboardPage = () => {
  const { routes, state, resetDemo, setDebugModeEnabled, setLanguage, setSliderMaxDistanceKm, t } = useAppState();
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
  const ownedRoutes = new Set([...state.purchasedRouteIds, ...state.unlockedCrewDestinationIds]).size;

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
        title={t("dashboard.title")}
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard label={t("dashboard.totalDistance")} value={formatDistance(totalDistance)} hint="" />
        <StatCard label={t("dashboard.stampBalance")} value={String(state.currentStamps)} hint="" />
        <StatCard label={t("dashboard.routesInProgress")} value={String(routesInProgress)} hint="" />
        <StatCard label={t("dashboard.ownedRoutes")} value={String(ownedRoutes)} hint="" />
        <StatCard label={t("dashboard.completedRoutes")} value={String(completedRoutes)} hint="" />
        <StatCard label={t("dashboard.landmarksUnlocked")} value={String(unlockedLandmarks)} hint="" />
      </div>

      <section className="space-y-4">
        <SectionHeader eyebrow={t("dashboard.settings")} title={t("dashboard.runDistanceRange")} />
        <div className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">{t("dashboard.customMaxDistance")}</p>
              <p className="mt-1 text-sm text-sage-600">0 to {state.sliderMaxDistanceKm} km</p>
            </div>
            <div className="rounded-full bg-sage-50 px-4 py-2 text-sm font-medium text-sage-700">
              {t("dashboard.max100")}
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
              {t("dashboard.save")}
            </Button>
          </div>

          <p className="mt-3 text-xs text-sage-500">
            {sliderMaxValid
              ? t("dashboard.savedRange")
              : t("dashboard.enterRange")}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow={t("dashboard.settings")} title={t("dashboard.language")} />
        <div className="grid grid-cols-2 gap-3 rounded-[28px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`rounded-[22px] px-4 py-4 text-sm font-semibold transition ${
              state.language === "en" ? "bg-sage-700 text-white" : "bg-sage-50 text-ink"
            }`}
          >
            {t("dashboard.english")}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("zh")}
            className={`rounded-[22px] px-4 py-4 text-sm font-semibold transition ${
              state.language === "zh" ? "bg-sage-700 text-white" : "bg-sage-50 text-ink"
            }`}
          >
            {t("dashboard.chinese")}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow={t("dashboard.settings")} title="Debug Mode" />
        <div className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">Unlock all maps and landmarks</p>
              <p className="mt-1 text-sm text-sage-600">
                When enabled, all destinations become available and every landmark is treated as unlocked.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDebugModeEnabled(!(state.debugModeEnabled ?? false))}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                state.debugModeEnabled ? "bg-sage-700" : "bg-sage-200"
              }`}
              aria-pressed={state.debugModeEnabled ?? false}
              aria-label="Toggle debug mode"
            >
              <span
                className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition ${
                  state.debugModeEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow={t("dashboard.history")} title={t("dashboard.history")} />
        {state.runHistory.length > 0 ? (
          <HistoryList history={state.runHistory} routes={routes} />
        ) : (
          <div className="rounded-[28px] bg-sage-50 p-5 ring-1 ring-sage-100">
            <p className="text-sm text-sage-700">{t("dashboard.noRuns")}</p>
          </div>
        )}
      </section>

      <Button variant="secondary" fullWidth onClick={resetDemo}>
        {t("dashboard.resetDemo")}
      </Button>
    </div>
  );
};
