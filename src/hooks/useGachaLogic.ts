import { useCallback } from "react";
import { routes } from "../data/routes";
import type { Route, RouteTier } from "../types";

type GachaRarity = RouteTier;

interface GachaWeightBand {
  tier: GachaRarity;
  weight: number;
}

export interface GachaDrawResult {
  map: Route;
  isDuplicate: boolean;
  blueprintsGained: number;
  drawnTier: GachaRarity;
}

const GACHA_WEIGHTS: GachaWeightBand[] = [
  { tier: "Starter", weight: 40 },
  { tier: "Standard", weight: 35 },
  { tier: "Advanced", weight: 20 },
  { tier: "Premium", weight: 5 }
];

const DUPLICATE_BLUEPRINT_REWARD: Record<GachaRarity, number> = {
  Starter: 1,
  Standard: 2,
  Advanced: 5,
  Premium: 10
};

const gachaPool = routes.filter((route) => route.sourceType !== "pacecrew");

const poolByTier = GACHA_WEIGHTS.reduce<Record<GachaRarity, Route[]>>(
  (accumulator, { tier }) => {
    accumulator[tier] = gachaPool.filter((route) => route.tier === tier);
    return accumulator;
  },
  {
    Starter: [],
    Standard: [],
    Advanced: [],
    Premium: []
  }
);

const selectTier = () => {
  const roll = Math.random() * 100;
  let threshold = 0;

  for (const { tier, weight } of GACHA_WEIGHTS) {
    threshold += weight;

    if (roll < threshold) {
      return tier;
    }
  }

  return "Starter" as const;
};

const selectRouteFromTier = (tier: GachaRarity) => {
  const candidates = poolByTier[tier];

  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const fallbackPool = gachaPool.filter((route) => poolByTier[route.tier].length > 0);
  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
};

export const useGachaLogic = () => {
  const performDraw = useCallback((currentUnlockedMapIds: string[]): GachaDrawResult => {
    const drawnTier = selectTier();
    const map = selectRouteFromTier(drawnTier);
    const isDuplicate = currentUnlockedMapIds.includes(map.id);
    const blueprintsGained = isDuplicate ? DUPLICATE_BLUEPRINT_REWARD[map.tier] : 0;

    return {
      map,
      isDuplicate,
      blueprintsGained,
      drawnTier
    };
  }, []);

  return {
    performDraw
  };
};
