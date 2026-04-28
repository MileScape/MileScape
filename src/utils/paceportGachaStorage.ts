import type { AppState } from "../types";
import { loadState, saveState } from "./storage";

const PACEPORT_GACHA_KEY = "milescape-paceport-gacha";
const PACEPORT_GACHA_EVENT = "milescape:paceport-gacha-updated";
const DRAW_COST_STAMPS = 50;

export interface PaceportGachaPersistedState {
  unlockedRouteIds: string[];
  unlockedDecorIds: string[];
  unlockedAtmosphereIds: string[];
  activeAtmosphereIds: string[];
  routeBlueprints: number;
  totalDraws: number;
  updatedAt: string;
}

const createDefaultGachaState = (): PaceportGachaPersistedState => ({
  unlockedRouteIds: [],
  unlockedDecorIds: [],
  unlockedAtmosphereIds: [],
  activeAtmosphereIds: [],
  routeBlueprints: 0,
  totalDraws: 0,
  updatedAt: new Date(0).toISOString()
});

const dispatchGachaUpdate = (payload: PaceportGachaPersistedState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(PACEPORT_GACHA_EVENT, { detail: payload }));
};

export const getPaceportGachaEventName = () => PACEPORT_GACHA_EVENT;
export const getPaceportDrawCostStamps = () => DRAW_COST_STAMPS;

export const loadPaceportGachaState = (): PaceportGachaPersistedState => {
  if (typeof window === "undefined") {
    return createDefaultGachaState();
  }

  try {
    const raw = window.localStorage.getItem(PACEPORT_GACHA_KEY);
    if (!raw) {
      return createDefaultGachaState();
    }

    const parsed = JSON.parse(raw) as Partial<PaceportGachaPersistedState>;
    return {
      unlockedRouteIds: Array.isArray(parsed.unlockedRouteIds) ? parsed.unlockedRouteIds : [],
      unlockedDecorIds: Array.isArray(parsed.unlockedDecorIds) ? parsed.unlockedDecorIds : [],
      unlockedAtmosphereIds: Array.isArray(parsed.unlockedAtmosphereIds) ? parsed.unlockedAtmosphereIds : [],
      activeAtmosphereIds: Array.isArray(parsed.activeAtmosphereIds) ? parsed.activeAtmosphereIds : [],
      routeBlueprints: typeof parsed.routeBlueprints === "number" ? parsed.routeBlueprints : 0,
      totalDraws: typeof parsed.totalDraws === "number" ? parsed.totalDraws : 0,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return createDefaultGachaState();
  }
};

export const savePaceportGachaState = (state: PaceportGachaPersistedState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PACEPORT_GACHA_KEY, JSON.stringify(state));
  dispatchGachaUpdate(state);
};

const savePatchedAppState = (patcher: (current: AppState) => AppState) => {
  const current = loadState();
  if (!current) {
    return null;
  }

  const nextState = patcher(current);
  saveState(nextState);
  return nextState;
};

export const persistUnlockedRouteFromGacha = (routeId: string) => {
  const meta = loadPaceportGachaState();
  const nextMeta: PaceportGachaPersistedState = {
    ...meta,
    unlockedRouteIds: meta.unlockedRouteIds.includes(routeId) ? meta.unlockedRouteIds : [...meta.unlockedRouteIds, routeId],
    totalDraws: meta.totalDraws + 1,
    updatedAt: new Date().toISOString()
  };

  savePaceportGachaState(nextMeta);
  savePatchedAppState((current) => ({
    ...current,
    currentStamps: Math.max(0, current.currentStamps - DRAW_COST_STAMPS),
    purchasedRouteIds: current.purchasedRouteIds.includes(routeId)
      ? current.purchasedRouteIds
      : [...current.purchasedRouteIds, routeId]
  }));

  return nextMeta;
};

export const persistBlueprintsFromGacha = (amount: number) => {
  const meta = loadPaceportGachaState();
  const nextMeta: PaceportGachaPersistedState = {
    ...meta,
    routeBlueprints: meta.routeBlueprints + amount,
    totalDraws: meta.totalDraws + 1,
    updatedAt: new Date().toISOString()
  };

  savePaceportGachaState(nextMeta);
  savePatchedAppState((current) => ({
    ...current,
    currentStamps: Math.max(0, current.currentStamps - DRAW_COST_STAMPS)
  }));

  return nextMeta;
};

export const persistDecorFromGacha = (decorId: string, duplicateBlueprints = 0) => {
  const meta = loadPaceportGachaState();
  const alreadyUnlocked = meta.unlockedDecorIds.includes(decorId);
  const nextMeta: PaceportGachaPersistedState = {
    ...meta,
    unlockedDecorIds: alreadyUnlocked ? meta.unlockedDecorIds : [...meta.unlockedDecorIds, decorId],
    routeBlueprints: meta.routeBlueprints + duplicateBlueprints,
    totalDraws: meta.totalDraws + 1,
    updatedAt: new Date().toISOString()
  };

  savePaceportGachaState(nextMeta);
  savePatchedAppState((current) => ({
    ...current,
    currentStamps: Math.max(0, current.currentStamps - DRAW_COST_STAMPS)
  }));

  return nextMeta;
};

export const redeemAtmosphereReward = (atmosphereId: string, costBlueprints: number) => {
  const meta = loadPaceportGachaState();

  if (meta.unlockedAtmosphereIds.includes(atmosphereId) || meta.routeBlueprints < costBlueprints) {
    return meta;
  }

  const nextMeta: PaceportGachaPersistedState = {
    ...meta,
    routeBlueprints: meta.routeBlueprints - costBlueprints,
    unlockedAtmosphereIds: [...meta.unlockedAtmosphereIds, atmosphereId],
    activeAtmosphereIds: [...meta.activeAtmosphereIds, atmosphereId],
    updatedAt: new Date().toISOString()
  };

  savePaceportGachaState(nextMeta);
  return nextMeta;
};

export const setAtmosphereRewardActive = (atmosphereId: string, active: boolean) => {
  const meta = loadPaceportGachaState();

  if (!meta.unlockedAtmosphereIds.includes(atmosphereId)) {
    return meta;
  }

  const nextMeta: PaceportGachaPersistedState = {
    ...meta,
    activeAtmosphereIds: active
      ? Array.from(new Set([...meta.activeAtmosphereIds, atmosphereId]))
      : meta.activeAtmosphereIds.filter((id) => id !== atmosphereId),
    updatedAt: new Date().toISOString()
  };

  savePaceportGachaState(nextMeta);
  return nextMeta;
};
