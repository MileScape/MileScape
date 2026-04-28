import { Coins } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PaceportSummaryCard, type PaceportRouteSummary } from "../components/paceport/PaceportSummaryCard";
import { WorldProgressMap, type PaceportCountrySummary } from "../components/paceport/WorldProgressMap";
import { useAppState } from "../hooks/useAppState";
import type { Route } from "../types";
import { getPaceportSummary } from "../utils/paceport";

const countryCodeByName: Record<string, string> = {
  Australia: "AU",
  Egypt: "EG",
  Spain: "ES",
  France: "FR",
  Italy: "IT",
  Japan: "JP",
  "South Korea": "KR",
  Taiwan: "TW",
  Thailand: "TH",
  "United Kingdom": "GB",
  "United States": "US"
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
  const { routes, state, purchaseRoute, t } = useAppState();
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const countryPillsRef = useRef<HTMLDivElement | null>(null);

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
    if (!selectedCountryCode) {
      return;
    }

    if (!countryCollections.some((country) => country.code === selectedCountryCode)) {
      setSelectedCountryCode(null);
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
    selectedCountryCode
      ? countryCollections.find((country) => country.code === selectedCountryCode) ?? null
      : null;
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

  const handleUnlock = (routeId: string) => {
    const result = purchaseRoute(routeId);
    setToast(result.message);
  };

  useEffect(() => {
    if (!selectedCountryCode || !countryPillsRef.current) {
      return;
    }

    const activePill = countryPillsRef.current.querySelector<HTMLButtonElement>(`[data-country-code="${selectedCountryCode}"]`);
    activePill?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedCountryCode]);

  return (
    <div className="relative -mx-4 -mt-[calc(5.4rem+1.95rem)] min-h-screen bg-canvas">
      <div className="pointer-events-none fixed left-1/2 top-0 z-[80] flex w-full max-w-[430px] -translate-x-1/2 justify-end px-4 pt-20">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/1 px-3.5 py-2 text-[11px] font-medium text-white shadow-[0_12px_30px_rgba(24,43,29,0.18)] ring-1 ring-white/34 backdrop-blur-[18px] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.28),0_12px_30px_rgba(24,43,29,0.18)]">
          <Coins className="h-4 w-4 text-white/92" />
          <span className="text-sm font-semibold text-white">{state.currentStamps}</span>
          <span className="text-white/84">Stamps</span>
        </div>
      </div>

      <section className="relative h-[calc(100vh+5.65rem)] min-h-[700px] overflow-hidden">
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

        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 pt-6">
          {toast ? (
            <div className="max-w-[220px] rounded-full bg-sage-700 px-4 py-2 text-[11px] font-medium text-white shadow-[0_10px_28px_rgba(24,43,29,0.14)]">
              {toast}
            </div>
          ) : (
            <div />
          )}
        </div>

        <div className="absolute bottom-52 left-0 right-0 z-10 overflow-x-auto px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div ref={countryPillsRef} className="flex min-w-max gap-2">
            {countryCollections.map((country) => {
              const active = country.code === selectedCountry?.code;
              const unlockedRouteCount = country.routes.filter((route) => route.status !== "locked").length;

              return (
                <button
                  key={country.code}
                  type="button"
                  data-country-code={country.code}
                  onClick={() => setSelectedCountryCode((current) => (current === country.code ? null : country.code))}
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

        <div className="absolute bottom-40 left-6 right-6 z-10 flex items-center justify-between rounded-full bg-white/58 px-4 py-2.5 text-[11px] font-medium text-sage-600 shadow-[0_12px_30px_rgba(34,49,38,0.07)] ring-1 ring-white/80 backdrop-blur-xl">
          <span>{exploredDestinationCount} unlocked maps</span>
          <span>{completedDestinationCount} completed</span>
        </div>
      </section>

      {selectedCountry ? (
        <section className="relative z-20 mt-6">
          <PaceportSummaryCard
            countryName={selectedCountry.name}
            routes={selectedCountry.routes}
            currentStamps={state.currentStamps}
            onUnlock={handleUnlock}
          />
        </section>
      ) : (
        <section className="relative z-20 -mt-36 rounded-t-[34px] border-t border-white/75 bg-[linear-gradient(180deg,rgba(250,249,245,0.97)_0%,rgba(245,243,238,0.99)_100%)] px-6 pb-5 pt-4 shadow-[0_-16px_34px_rgba(34,49,38,0.08)]">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-sage-900/10" />
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-sage-500">Paceport</p>
          <h2 className="mt-1.5 font-destination-display text-[1.95rem] leading-[0.95] tracking-[0.01em] text-ink">
            Collect the World
          </h2>
          <p className="mt-4 text-[13px] leading-5 text-sage-600">
            Every run lights up a piece of the world.
          </p>
        </section>
      )}
    </div>
  );
};
