import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { routes } from "../data/routes";
import type { AppContextValue, AppState } from "../types";
import { applyRunToState, createInitialState } from "../utils/progress";
import { clearState, loadState, saveState } from "../utils/storage";

export const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState>(() => loadState() ?? createInitialState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo<AppContextValue>(
    () => ({
      routes,
      state,
      selectRoute: (routeId) => {
        setState((current) => ({ ...current, selectedRouteId: routeId }));
      },
      completeRun: (routeId, distanceKm) => {
        const route = routes.find((entry) => entry.id === routeId);

        if (!route) {
          throw new Error(`Unknown route: ${routeId}`);
        }

        const { nextState, summary } = applyRunToState(state, route, distanceKm);
        setState(nextState);
        return summary;
      },
      resetDemo: () => {
        clearState();
        setState(createInitialState());
      }
    }),
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
