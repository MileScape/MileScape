import { useCallback } from "react";
import { gachaDecorRewards, type GachaDecorReward } from "../data/gachaRewards";
import { routes } from "../data/routes";
import type { Route, RouteTier } from "../types";

type GachaRarity = RouteTier;
type GachaRewardKind = "route" | "decor";

interface GachaWeightBand {
  tier: GachaRarity;
  weight: number;
}

export type GachaDrawResult =
  | {
      kind: "route";
      map: Route;
      isDuplicate: boolean;
      blueprintsGained: number;
      drawnTier: GachaRarity;
    }
  | {
      kind: "decor";
      decor: GachaDecorReward;
      isDuplicate: boolean;
      blueprintsGained: number;
      drawnTier: GachaDecorReward["rarity"];
    };

interface RewardKindWeightBand {
  kind: GachaRewardKind;
  weight: number;
}

interface DecorWeightBand {
  rarity: GachaDecorReward["rarity"];
  weight: number;
}

interface LegacyRouteDrawResult {
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

const REWARD_KIND_WEIGHTS: RewardKindWeightBand[] = [
  { kind: "route", weight: 45 },
  { kind: "decor", weight: 55 }
];

const DECOR_WEIGHTS: DecorWeightBand[] = [
  { rarity: "Common", weight: 58 },
  { rarity: "Uncommon", weight: 30 },
  { rarity: "Rare", weight: 12 }
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

const selectRewardKind = () => {
  const roll = Math.random() * 100;
  let threshold = 0;

  for (const { kind, weight } of REWARD_KIND_WEIGHTS) {
    threshold += weight;

    if (roll < threshold) {
      return kind;
    }
  }

  return "route" as const;
};

const selectDecorRarity = () => {
  const roll = Math.random() * 100;
  let threshold = 0;

  for (const { rarity, weight } of DECOR_WEIGHTS) {
    threshold += weight;

    if (roll < threshold) {
      return rarity;
    }
  }

  return "Common" as const;
};

const selectRouteFromTier = (tier: GachaRarity) => {
  const candidates = poolByTier[tier];

  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const fallbackPool = gachaPool.filter((route) => poolByTier[route.tier].length > 0);
  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
};

const selectDecor = () => {
  const rarity = selectDecorRarity();
  const candidates = gachaDecorRewards.filter((reward) => reward.rarity === rarity);
  const pool = candidates.length > 0 ? candidates : gachaDecorRewards;
  return pool[Math.floor(Math.random() * pool.length)];
};

const performRouteDraw = (currentUnlockedMapIds: string[]): LegacyRouteDrawResult => {
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
};

export const useGachaLogic = () => {
  const performDraw = useCallback((currentUnlockedMapIds: string[], currentDecorIds: string[] = []): GachaDrawResult => {
    const hasLockedRoutes = gachaPool.some((route) => !currentUnlockedMapIds.includes(route.id));
    const shouldDrawDecor = selectRewardKind() === "decor" || !hasLockedRoutes;

    if (shouldDrawDecor) {
      const decor = selectDecor();
      const isDuplicate = currentDecorIds.includes(decor.id);

      return {
        kind: "decor",
        decor,
        isDuplicate,
        blueprintsGained: isDuplicate ? decor.blueprintValue : 0,
        drawnTier: decor.rarity
      };
    }

    return {
      kind: "route",
      ...performRouteDraw(currentUnlockedMapIds)
    };
  }, []);

  return {
    performDraw
  };
};
