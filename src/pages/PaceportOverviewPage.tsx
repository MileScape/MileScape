import { Coins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GachaTriggerButton } from "../components/paceport/GachaTriggerButton";
import { PaceportSummaryCard, type PaceportRouteSummary } from "../components/paceport/PaceportSummaryCard";
import { WorldProgressMap, type PaceportCountrySummary } from "../components/paceport/WorldProgressMap";
import { useAppState } from "../hooks/useAppState";
import { usePaceportGachaAdapter } from "../hooks/usePaceportGachaAdapter";
import type { Route } from "../types";
import { getPaceportSummary } from "../utils/paceport";

const countryCodeByName: Record<string, string> = {
  China: "CN",
  "United States": "US",
  Japan: "JP",
  Portugal: "PT",
  Spain: "ES",
  "United Kingdom": "GB",
  France: "FR",
  Iceland: "IS",
  Australia: "AU"
};

interface CountryCollection {
  code: string;
  name: string;
  routes: PaceportRouteSummary[];
}

const toRouteSummary = (route: Route, state: ReturnType<typeof useAppState>["state"]): PaceportRouteSummary => {
  const summary = getPaceportSummary(route, state);

  return {
    route,
    status: summary.progress.completed ? "completed" : summary.status,
    completedDistanceKm: summary.progress.completedDistanceKm,
    progressPercent: summary.progressPercent,
    unlockedLandmarkCount: summary.unlockedLandmarkCount,
    runCount: summary.runCount,
    achievementTier: summary.achievementTier,
    completed: summary.progress.completed
  };
};

const withLocalUnlock = (summary: PaceportRouteSummary, isLocallyUnlocked: boolean): PaceportRouteSummary =>
  isLocallyUnlocked && summary.status === "locked"
    ? {
        ...summary,
        status: "owned"
      }
    : summary;

export const PaceportOverviewPage = () => {
  const { routes, state, purchaseRoute, t } = useAppState();
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const {
    accessibleRouteIds,
    routeBlueprints,
    totalDraws,
    displayStamps,
    drawCostStamps,
    canAffordDraw,
    registerUnlockedRoute,
    registerBlueprints
  } = usePaceportGachaAdapter(state);

  const countryCollections = useMemo(() => {
    const collections = new Map<string, CountryCollection>();

    routes.forEach((route) => {
      const code = countryCodeByName[route.country];
      if (!code) {
        return;
      }

      const collection = collections.get(code) ?? {
        code,
        name: route.country,
        routes: []
      };

      const summary = toRouteSummary(route, state);
      collection.routes.push(withLocalUnlock(summary, accessibleRouteIds.includes(route.id)));
      collections.set(code, collection);
    });

    return Array.from(collections.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [accessibleRouteIds, routes, state]);

  const mapCountries = useMemo<PaceportCountrySummary[]>(
    () =>
      countryCollections.map((country) => {
        const totalProgress = country.routes.reduce((sum, route) => sum + route.progressPercent, 0);
        const unlockedRouteCount = country.routes.filter((route) => route.status !== "locked").length;

        return {
          code: country.code,
          name: country.name,
          routeCount: country.routes.length,
          unlockedRouteCount,
          lockedRouteCount: country.routes.length - unlockedRouteCount,
          completedRouteCount: country.routes.filter((route) => route.completed).length,
          visitedRouteCount: country.routes.filter((route) => route.runCount > 0 || route.completedDistanceKm > 0).length,
          progressPercent: Math.round(totalProgress / country.routes.length)
        };
      }),
    [countryCollections],
  );

  useEffect(() => {
    if (!countryCollections.length) {
      setSelectedCountryCode(null);
      return;
    }

    if (!selectedCountryCode || !countryCollections.some((country) => country.code === selectedCountryCode)) {
      const firstUnlockedCountry = countryCollections.find((country) =>
        country.routes.some((route) => route.status !== "locked"),
      );
      setSelectedCountryCode((firstUnlockedCountry ?? countryCollections[0]).code);
    }
  }, [countryCollections, selectedCountryCode]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const selectedCountry =
    countryCollections.find((country) => country.code === selectedCountryCode) ?? countryCollections[0] ?? null;
  const selectableCountryCount = countryCollections.length;
  const exploredDestinationCount = countryCollections.reduce(
    (sum, country) => sum + country.routes.filter((route) => route.status !== "locked").length,
    0,
  );
  const lockedDestinationCount = countryCollections.reduce(
    (sum, country) => sum + country.routes.filter((route) => route.status === "locked").length,
    0,
  );
  const handleUnlock = (routeId: string) => {
    const result = purchaseRoute(routeId);
    setToast(result.message);
  };

  const handleGachaMapUnlocked = (mapId: string) => {
    const route = routes.find((entry) => entry.id === mapId);
    if (!route) {
      setToast("Route draw completed, but the destination could not be resolved.");
      return;
    }

    registerUnlockedRoute(mapId);
    setToast(`${route.name} route access granted via Paceport Draw.`);
  };

  const handleBlueprintsGained = (amount: number) => {
    registerBlueprints(amount);
    setToast(`+${amount} Route Blueprints added for My Scape.`);
  };

  return (
    <div className="relative -mx-4 -mt-[calc(5.4rem+1.95rem)] min-h-screen bg-canvas">
      <section className="relative h-[calc(100svh+3.75rem)] min-h-[41rem] max-h-[48rem] overflow-hidden">
        <div className="absolute inset-0">
          <WorldProgressMap
            countries={mapCountries}
            selectedCountryCode={selectedCountry?.code ?? null}
            onSelectCountry={setSelectedCountryCode}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(245,243,238,0.42)_0%,rgba(245,243,238,0.16)_52%,rgba(245,243,238,0)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),rgba(255,255,255,0)_72%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f5f3ee] via-[#f5f3ee]/84 to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-24">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/68 px-3.5 py-2 text-[11px] font-medium text-sage-700 shadow-[0_12px_30px_rgba(24,43,29,0.16)] ring-1 ring-white/80 backdrop-blur-xl">
                <span className="text-sm font-semibold text-ink">{selectableCountryCount}</span>
                <span>Countries</span>
              </div>
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#f7f4ed] px-3.5 py-2 text-[11px] font-medium text-sage-700 shadow-[0_12px_30px_rgba(24,43,29,0.18)] ring-1 ring-[#ebe4d8]">
                <Coins className="h-4 w-4 text-sage-700" />
                <span className="text-sm font-semibold text-ink">{displayStamps}</span>
                <span>Stamps</span>
              </div>
            </div>

            {toast ? (
              <div className="pointer-events-auto max-w-[240px] rounded-full bg-sage-700 px-4 py-2 text-[11px] font-medium text-white shadow-[0_10px_28px_rgba(24,43,29,0.14)]">
                {toast}
              </div>
            ) : null}

            <div className="pointer-events-auto rounded-[22px] bg-white/58 px-4 py-3 text-[11px] font-medium text-sage-700 shadow-[0_12px_32px_rgba(34,49,38,0.08)] ring-1 ring-white/75 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <span>{accessibleRouteIds.length} route maps accessible</span>
                <span>{routeBlueprints} blueprints</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-sage-500">
                <span>{totalDraws} total draws</span>
                <span>{exploredDestinationCount} unlocked</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[5.75rem] right-5 z-20">
          <GachaTriggerButton
            currentUnlockedMaps={accessibleRouteIds}
            onMapUnlocked={handleGachaMapUnlocked}
            onBlueprintsGained={handleBlueprintsGained}
            canDraw={canAffordDraw}
            costStamps={drawCostStamps}
          />
        </div>

        <div className="absolute inset-x-0 bottom-8 z-10 overflow-x-auto px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {countryCollections.map((country) => {
              const active = country.code === selectedCountry?.code;
              const unlockedRouteCount = country.routes.filter((route) => route.status !== "locked").length;

              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => setSelectedCountryCode(country.code)}
                  className={`rounded-full px-3.5 py-2 text-[11px] font-medium shadow-[0_10px_24px_rgba(34,49,38,0.08)] ring-1 transition ${
                    active
                      ? "bg-sage-700 text-white ring-sage-700"
                      : "bg-white/66 text-sage-700 ring-white/80 backdrop-blur-xl"
                  }`}
                >
                  <span>{country.name}</span>
                  <span className={active ? "ml-2 text-white/72" : "ml-2 text-sage-500"}>
                    {unlockedRouteCount}/{country.routes.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {selectedCountry ? (
        <section className="relative z-20 -mt-6">
          <PaceportSummaryCard
            countryName={selectedCountry.name}
            routes={selectedCountry.routes}
            currentStamps={displayStamps}
            onUnlock={handleUnlock}
          />
        </section>
      ) : (
        <section className="relative z-20 -mt-6 rounded-t-[34px] border-t border-white/75 bg-[linear-gradient(180deg,rgba(250,249,245,0.97)_0%,rgba(245,243,238,0.99)_100%)] px-6 pb-5 pt-4 shadow-[0_-16px_34px_rgba(34,49,38,0.08)]">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-sage-900/10" />
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-sage-500">Paceport</p>
          <h2 className="mt-1.5 font-destination-display text-[1.95rem] leading-[0.95] tracking-[0.01em] text-ink">
            {t("app.paceport")}
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-sage-600">
            Unlocked countries will illuminate here. {lockedDestinationCount} route maps are still waiting to be unlocked.
          </p>
        </section>
      )}
    </div>
  );
};
