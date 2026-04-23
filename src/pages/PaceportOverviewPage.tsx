import { useEffect, useMemo, useState } from "react";
import { PaceportSummaryCard, type PaceportRouteSummary } from "../components/paceport/PaceportSummaryCard";
import { WorldProgressMap, type PaceportCountrySummary } from "../components/paceport/WorldProgressMap";
import { useAppState } from "../hooks/useAppState";
import type { Route } from "../types";
import { getPaceportSummary } from "../utils/paceport";

const countryCodeByName: Record<string, string> = {
  China: "CN",
  "United States": "US",
  Japan: "JP",
  Portugal: "PT",
  "South Korea": "KR",
  France: "FR",
  Iceland: "IS",
  Singapore: "SG",
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

export const PaceportOverviewPage = () => {
  const { routes, state, t } = useAppState();
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);

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

      collection.routes.push(toRouteSummary(route, state));
      collections.set(code, collection);
    });

    return Array.from(collections.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [routes, state]);

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
    const selectableCountries = countryCollections.filter((country) =>
      country.routes.some((route) => route.status !== "locked"),
    );

    if (!selectableCountries.length) {
      setSelectedCountryCode(null);
      return;
    }

    if (!selectedCountryCode || !selectableCountries.some((country) => country.code === selectedCountryCode)) {
      setSelectedCountryCode(selectableCountries[0].code);
    }
  }, [countryCollections, selectedCountryCode]);

  const selectedCountry =
    countryCollections.find((country) => country.code === selectedCountryCode) ?? countryCollections[0] ?? null;
  const selectedCountryIsUnlocked = selectedCountry?.routes.some((route) => route.status !== "locked") ?? false;
  const selectedMapCountryCode = selectedCountryIsUnlocked ? selectedCountry?.code ?? null : null;
  const illuminatedCountryCount = countryCollections.filter((country) =>
    country.routes.some((route) => route.status !== "locked"),
  ).length;
  const exploredDestinationCount = countryCollections.reduce(
    (sum, country) => sum + country.routes.filter((route) => route.status !== "locked").length,
    0,
  );
  const lockedDestinationCount = countryCollections.reduce(
    (sum, country) => sum + country.routes.filter((route) => route.status === "locked").length,
    0,
  );
  const completedDestinationCount = countryCollections.reduce(
    (sum, country) => sum + country.routes.filter((route) => route.completed).length,
    0,
  );

  return (
<div className="-mx-4 -mt-[calc(5.4rem+1.95rem)] min-h-screen bg-canvas">
  <section className="relative h-[calc(100vh+5.65rem)] min-h-[700px] overflow-hidden">
    <div className="absolute inset-0">
      <WorldProgressMap
        countries={mapCountries}
        selectedCountryCode={selectedMapCountryCode}
        onSelectCountry={setSelectedCountryCode}
      />
    </div>

    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(245,243,238,0.42)_0%,rgba(245,243,238,0.16)_52%,rgba(245,243,238,0)_100%)]" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),rgba(255,255,255,0)_72%)]" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f5f3ee] via-[#f5f3ee]/84 to-transparent" />

    <div className="relative z-10 flex justify-end px-6 pt-60">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/64 px-3.5 py-2 text-[11px] font-medium text-sage-600 shadow-[0_10px_28px_rgba(24,43,29,0.07)] ring-1 ring-white/80 backdrop-blur-xl">
            <span className="text-sm font-semibold text-ink">{illuminatedCountryCount}</span>
            <span>Lit countries</span>
          </div>
        </div>

        <div className="absolute bottom-40 left-6 right-6 z-10 flex items-center justify-between rounded-full bg-white/58 px-4 py-2.5 text-[11px] font-medium text-sage-600 shadow-[0_12px_30px_rgba(34,49,38,0.07)] ring-1 ring-white/80 backdrop-blur-xl">
          <span>{exploredDestinationCount} unlocked maps</span>
          <span>{completedDestinationCount} completed</span>
        </div>
      </section>

      {selectedCountry && selectedCountryIsUnlocked ? (
        <section className="relative z-20 mt-6">
        <PaceportSummaryCard
          countryName={selectedCountry.name}
          routes={selectedCountry.routes}
        />
        </section>
      ) : (
        <section className="relative z-20 -mt-36 rounded-t-[34px] border-t border-white/75 bg-[linear-gradient(180deg,rgba(250,249,245,0.97)_0%,rgba(245,243,238,0.99)_100%)] px-6 pb-5 pt-4 shadow-[0_-16px_34px_rgba(34,49,38,0.08)]">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-sage-900/10" />
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-sage-500">Paceport</p>
          <h2 className="mt-1.5 font-destination-display text-[1.95rem] leading-[0.95] tracking-[0.01em] text-ink">
            {t("app.paceport")}
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-sage-600">
            Unlocked countries will illuminate here. {lockedDestinationCount} route maps are still waiting in the shop.
          </p>
        </section>
      )}
    </div>
  );
};
