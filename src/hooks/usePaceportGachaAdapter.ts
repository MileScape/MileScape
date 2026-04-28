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
  type PaceportGachaPersistedState
} from "../utils/paceportGachaStorage";

const readInitialMeta = () => loadPaceportGachaState();

export const usePaceportGachaAdapter = (appState: AppState) => {
  const [meta, setMeta] = useState<PaceportGachaPersistedState>(readInitialMeta);
  const [sessionUnlockedRouteIds, setSessionUnlockedRouteIds] = useState<string[]>([]);
  const [spentThisSession, setSpentThisSession] = useState(0);

  useEffect(() => {
    const syncMeta = () => {
      setMeta(loadPaceportGachaState());
    };

    syncMeta();

    const eventName = getPaceportGachaEventName();
    const onUpdate = () => syncMeta();

    window.addEventListener(eventName, onUpdate as EventListener);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener(eventName, onUpdate as EventListener);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const accessibleRouteIds = useMemo(
    () =>
      Array.from(
        new Set([...appState.purchasedRouteIds, ...meta.unlockedRouteIds, ...sessionUnlockedRouteIds]),
      ),
    [appState.purchasedRouteIds, meta.unlockedRouteIds, sessionUnlockedRouteIds],
  );

  const displayStamps = Math.max(0, appState.currentStamps - spentThisSession);
  const canAffordDraw = displayStamps >= getPaceportDrawCostStamps();

  const registerUnlockedRoute = (routeId: string) => {
    setSessionUnlockedRouteIds((current) => (current.includes(routeId) ? current : [...current, routeId]));
    setSpentThisSession((current) => current + getPaceportDrawCostStamps());
    setMeta(persistUnlockedRouteFromGacha(routeId));
  };

  const registerBlueprints = (amount: number) => {
    setSpentThisSession((current) => current + getPaceportDrawCostStamps());
    setMeta(persistBlueprintsFromGacha(amount));
  };

  const registerDecor = (decorId: string, duplicateBlueprints = 0) => {
    setSpentThisSession((current) => current + getPaceportDrawCostStamps());
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
    displayStamps,
    drawCostStamps: getPaceportDrawCostStamps(),
    canAffordDraw,
    registerUnlockedRoute,
    registerBlueprints,
    registerDecor,
    redeemAtmosphere,
    setAtmosphereActive
  };
};
