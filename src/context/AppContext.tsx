import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { routes } from "../data/routes";
import type { AppContextValue, AppState } from "../types";
import { applyRunToState, createInitialState, normalizeState } from "../utils/progress";
import { clearState, loadState, saveState } from "../utils/storage";
import { isRouteOwned } from "../utils/shop";

export const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState>(() => normalizeState(loadState()));

  useEffect(() => {
    saveState(state);
  }, [state]);

  const playableRoutes = routes.filter((route) => isRouteOwned(route.id, state.purchasedRouteIds));

  const value = useMemo<AppContextValue>(
    () => ({
      routes,
      playableRoutes,
      state,
      selectRoute: (routeId) => {
        setState((current) =>
          current.purchasedRouteIds.includes(routeId)
            ? { ...current, selectedRouteId: routeId }
            : current,
        );
      },
      completeRun: (routeId, distanceKm) => {
        const route = routes.find((entry) => entry.id === routeId);

        if (!route) {
          throw new Error(`Unknown route: ${routeId}`);
        }

        let summary = null as ReturnType<typeof applyRunToState>["summary"] | null;
        setState((current) => {
          const result = applyRunToState(current, route, distanceKm);
          summary = result.summary;
          return result.nextState;
        });
        if (!summary) {
          throw new Error("Run summary could not be generated");
        }
        return summary;
      },
      purchaseRoute: (routeId) => {
        const route = routes.find((entry) => entry.id === routeId);

        if (!route) {
          return { success: false, message: "Route not found" };
        }

        if (state.purchasedRouteIds.includes(routeId)) {
          return { success: false, message: "Already owned" };
        }

        if (state.currentStamps < route.priceStamps) {
          return { success: false, message: "Insufficient Stamps" };
        }

        setState((current) => ({
          ...current,
          currentStamps: current.currentStamps - route.priceStamps,
          purchasedRouteIds: [...current.purchasedRouteIds, routeId]
        }));

        return { success: true, message: `${route.name} unlocked` };
      },
      resetDemo: () => {
        clearState();
        setState(createInitialState());
      }
    }),
    [playableRoutes, state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
