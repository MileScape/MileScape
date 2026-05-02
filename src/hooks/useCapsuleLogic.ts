import { useMemo } from "react";
import { routes as defaultRoutes } from "../data/routes";
import type { Decoration, Route, RouteTier } from "../types";

export type CapsulePrizeKind = "route_ticket" | "decoration";

export interface CapsuleDecorationPrize extends Decoration {
  capsuleWeight?: number;
}

export interface CapsuleRouteTicketPrize {
  kind: "route_ticket";
  route: Route;
  tier: RouteTier;
  isDuplicate: boolean;
  fragmentsAwarded: number;
}

export interface CapsuleDecorationDrawPrize {
  kind: "decoration";
  decoration: CapsuleDecorationPrize;
  isDuplicate: false;
  fragmentsAwarded: 0;
}

export type CapsuleDrawResult = CapsuleRouteTicketPrize | CapsuleDecorationDrawPrize;

export interface CapsuleAtmosphereEffect {
  id: string;
  name: string;
  description: string;
  costFragments: number;
  previewClassName: string;
}

export interface UseCapsuleLogicOptions {
  routes?: Route[];
  unlockedRouteIds?: string[];
  decorations?: CapsuleDecorationPrize[];
  ownedAtmosphereEffectIds?: string[];
  atmosphereEffects?: CapsuleAtmosphereEffect[];
}

export interface UseCapsuleLogicResult {
  routePool: Route[];
  decorationPool: CapsuleDecorationPrize[];
  atmosphereEffects: CapsuleAtmosphereEffect[];
  drawCapsule: () => CapsuleDrawResult;
  getDuplicateFragmentsForTier: (tier: RouteTier) => number;
  canExchangeEffect: (effectId: string, currentFragments: number) => boolean;
}

const routeTierWeights: Record<RouteTier, number> = {
  Starter: 40,
  Standard: 35,
  Advanced: 20,
  Premium: 5,
};

const duplicateFragmentsByTier: Record<RouteTier, number> = {
  Starter: 1,
  Standard: 2,
  Advanced: 5,
  Premium: 10,
};

export const defaultDecorationPool: CapsuleDecorationPrize[] = [
  {
    id: "capsule-bench",
    name: "Pocket Bench",
    rarity: "common",
    description: "A tiny rest spot for the edge of your Scape lawn.",
    icon: "bench",
    capsuleWeight: 22,
  },
  {
    id: "capsule-road-cone",
    name: "Soft Road Cone",
    rarity: "common",
    description: "A playful marker that says: yes, this grass has traffic laws.",
    icon: "cone",
    capsuleWeight: 22,
  },
  {
    id: "capsule-shrub",
    name: "Round Shrub",
    rarity: "common",
    description: "A low, friendly green blob for filling quiet corners.",
    icon: "shrub",
    capsuleWeight: 18,
  },
  {
    id: "capsule-maple-tree",
    name: "Little Maple Tree",
    rarity: "rare",
    description: "A small ornamental tree. Decorative only, no landmark unlock attached.",
    icon: "tree",
    capsuleWeight: 12,
  },
  {
    id: "capsule-stone-lamp",
    name: "Stone Lawn Lamp",
    rarity: "rare",
    description: "A warm path light for late-night My Scape arranging.",
    icon: "lamp",
    capsuleWeight: 10,
  },
  {
    id: "capsule-picnic-cloth",
    name: "Picnic Cloth",
    rarity: "epic",
    description: "A bright fabric square for making the island feel inhabited.",
    icon: "picnic",
    capsuleWeight: 7,
  },
  {
    id: "capsule-glow-pebble",
    name: "Glow Pebble Set",
    rarity: "legendary",
    description: "Tiny luminous stones, legally distinct from actual magic. Probably.",
    icon: "pebble",
    capsuleWeight: 3,
  },
];

export const defaultAtmosphereEffects: CapsuleAtmosphereEffect[] = [
  {
    id: "snowfall",
    name: "Snowfall",
    description: "Gentle snow particles drift over My Scape.",
    costFragments: 8,
    previewClassName: "from-slate-100 via-sky-100 to-white",
  },
  {
    id: "dusk-skybox",
    name: "Dusk Skybox",
    description: "A warm golden-hour sky wraps the lawn.",
    costFragments: 10,
    previewClassName: "from-amber-200 via-rose-200 to-indigo-300",
  },
  {
    id: "sakura-fall",
    name: "Sakura Drift",
    description: "Soft petals pass through the scene in slow arcs.",
    costFragments: 12,
    previewClassName: "from-pink-100 via-rose-100 to-stone-100",
  },
  {
    id: "custom-turf",
    name: "Custom Turf",
    description: "A richer grass skin for the My Scape ground.",
    costFragments: 15,
    previewClassName: "from-lime-200 via-emerald-300 to-teal-500",
  },
];

const weightedPick = <T,>(entries: T[], getWeight: (entry: T) => number): T | null => {
  const totalWeight = entries.reduce((sum, entry) => sum + Math.max(0, getWeight(entry)), 0);

  if (entries.length === 0 || totalWeight <= 0) {
    return null;
  }

  let cursor = Math.random() * totalWeight;

  for (const entry of entries) {
    cursor -= Math.max(0, getWeight(entry));
    if (cursor <= 0) {
      return entry;
    }
  }

  return entries[entries.length - 1] ?? null;
};

const getRouteWeight = (route: Route) => routeTierWeights[route.tier] ?? 1;

const isPersonalRoute = (route: Route) => route.sourceType !== "pacecrew" && route.crewOnly !== true;

export const getDuplicateFragmentsForTier = (tier: RouteTier) => duplicateFragmentsByTier[tier] ?? 0;

export const buildCapsuleRoutePool = (routes: Route[] = defaultRoutes) => routes.filter(isPersonalRoute);

export const useCapsuleLogic = ({
  routes = defaultRoutes,
  unlockedRouteIds = [],
  decorations = defaultDecorationPool,
  ownedAtmosphereEffectIds = [],
  atmosphereEffects = defaultAtmosphereEffects,
}: UseCapsuleLogicOptions = {}): UseCapsuleLogicResult => {
  const unlockedRouteIdSet = useMemo(() => new Set(unlockedRouteIds), [unlockedRouteIds]);
  const ownedAtmosphereEffectIdSet = useMemo(() => new Set(ownedAtmosphereEffectIds), [ownedAtmosphereEffectIds]);
  const routePool = useMemo(() => buildCapsuleRoutePool(routes), [routes]);

  const drawCapsule = (): CapsuleDrawResult => {
    const canDrawRoute = routePool.length > 0;
    const canDrawDecoration = decorations.length > 0;
    const prizeKind =
      canDrawRoute && canDrawDecoration
        ? weightedPick<CapsulePrizeKind>(["route_ticket", "decoration"], (kind) => (kind === "route_ticket" ? 56 : 44))
        : canDrawRoute
          ? "route_ticket"
          : "decoration";

    if (prizeKind === "route_ticket" && canDrawRoute) {
      const route = weightedPick(routePool, getRouteWeight) ?? routePool[0];
      const isDuplicate = unlockedRouteIdSet.has(route.id);

      return {
        kind: "route_ticket",
        route,
        tier: route.tier,
        isDuplicate,
        fragmentsAwarded: isDuplicate ? getDuplicateFragmentsForTier(route.tier) : 0,
      };
    }

    const decoration = weightedPick(decorations, (item) => item.capsuleWeight ?? 1) ?? decorations[0];

    return {
      kind: "decoration",
      decoration,
      isDuplicate: false,
      fragmentsAwarded: 0,
    };
  };

  const canExchangeEffect = (effectId: string, currentFragments: number) => {
    const effect = atmosphereEffects.find((entry) => entry.id === effectId);
    return Boolean(effect && currentFragments >= effect.costFragments && !ownedAtmosphereEffectIdSet.has(effectId));
  };

  return {
    routePool,
    decorationPool: decorations,
    atmosphereEffects,
    drawCapsule,
    getDuplicateFragmentsForTier,
    canExchangeEffect,
  };
};
