import { useEffect, useMemo, useState } from "react";
import type { AppState } from "../types";
import {
  getPaceportDrawCostStamps,
  getPaceportGachaEventName,
  loadPaceportGachaState,
  persistBlueprintsFromGacha,
  persistDecorFromGacha,
  persistUnlockedRouteFromGacha,
  redeemAtmosphereReward,
  setAtmosphereRewardActive,
  type PaceportGachaPersistedState,
} from "../utils/paceportGachaStorage";

export const usePaceportGachaAdapter = (appState: AppState) => {
  const [meta, setMeta] = useState<PaceportGachaPersistedState>(() => loadPaceportGachaState());

  useEffect(() => {
    const syncMeta = () => setMeta(loadPaceportGachaState());
    const eventName = getPaceportGachaEventName();

    syncMeta();
    window.addEventListener(eventName, syncMeta as EventListener);
    window.addEventListener("storage", syncMeta);

    return () => {
      window.removeEventListener(eventName, syncMeta as EventListener);
      window.removeEventListener("storage", syncMeta);
    };
  }, []);

  const accessibleRouteIds = useMemo(
    () => Array.from(new Set([...appState.purchasedRouteIds, ...meta.unlockedRouteIds])),
    [appState.purchasedRouteIds, meta.unlockedRouteIds],
  );

  const drawCostStamps = getPaceportDrawCostStamps();

  const registerUnlockedRoute = (routeId: string) => {
    setMeta(persistUnlockedRouteFromGacha(routeId));
  };

  const registerBlueprints = (amount: number) => {
    setMeta(persistBlueprintsFromGacha(amount));
  };

  const registerDecor = (decorId: string, duplicateBlueprints = 0) => {
    setMeta(persistDecorFromGacha(decorId, duplicateBlueprints));
  };

  const redeemAtmosphere = (atmosphereId: string, costBlueprints: number) => {
    setMeta(redeemAtmosphereReward(atmosphereId, costBlueprints));
  };

  const setAtmosphereActive = (atmosphereId: string, active: boolean) => {
    setMeta(setAtmosphereRewardActive(atmosphereId, active));
  };

  return {
    accessibleRouteIds,
    unlockedDecorIds: meta.unlockedDecorIds,
    unlockedAtmosphereIds: meta.unlockedAtmosphereIds,
    activeAtmosphereIds: meta.activeAtmosphereIds,
    routeBlueprints: meta.routeBlueprints,
    totalDraws: meta.totalDraws,
    displayStamps: appState.currentStamps,
    drawCostStamps,
    canAffordDraw: appState.currentStamps >= drawCostStamps,
    registerUnlockedRoute,
    registerBlueprints,
    registerDecor,
    redeemAtmosphere,
    setAtmosphereActive,
  };
};
