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
    id: "capsule-garden-bench",
    name: "Garden Bench",
    rarity: "common",
    description: "A capsule-only bench for quiet corners.",
    image: "/models/decoration/capsule/garden-bench.png",
    icon: "bench",
    capsuleWeight: 13,
  },
  {
    id: "capsule-safety-cone",
    name: "Road Cone",
    rarity: "common",
    description: "A capsule-only cone for playful lawn layouts.",
    image: "/models/decoration/capsule/road-cone.png",
    icon: "cone",
    capsuleWeight: 13,
  },
  {
    id: "capsule-flower-pot",
    name: "Flower Pot",
    rarity: "common",
    description: "A capsule-only planter for soft color.",
    image: "/models/decoration/capsule/flower-pot.png",
    icon: "flower-pot",
    capsuleWeight: 12,
  },
  {
    id: "capsule-stone-path",
    name: "Stone Path",
    rarity: "common",
    description: "Capsule-only stepping stones for tiny walkways.",
    image: "/models/decoration/capsule/stone-path.png",
    icon: "stone-path",
    capsuleWeight: 12,
  },
  {
    id: "capsule-street-lamp",
    name: "Street Lamp",
    rarity: "rare",
    description: "A capsule-only path light for evening lawn scenes.",
    image: "/models/decoration/capsule/street-lamp.png",
    icon: "lamp",
    capsuleWeight: 9,
  },
  {
    id: "capsule-small-fence",
    name: "Small Fence",
    rarity: "rare",
    description: "A short capsule-only fence piece for simple borders.",
    image: "/models/decoration/capsule/small-fence.png",
    icon: "fence",
    capsuleWeight: 9,
  },
  {
    id: "capsule-picnic-basket",
    name: "Picnic Basket",
    rarity: "rare",
    description: "A capsule-only basket for a cozy grass patch.",
    image: "/models/decoration/capsule/picnic-basket.png",
    icon: "basket",
    capsuleWeight: 8,
  },
  {
    id: "capsule-hollow-log",
    name: "Hollow Log",
    rarity: "rare",
    description: "A capsule-only woodland log for natural scenes.",
    image: "/models/decoration/capsule/hollow-log.png",
    icon: "log",
    capsuleWeight: 8,
  },
  {
    id: "capsule-oak-tree",
    name: "Oak Tree",
    rarity: "epic",
    description: "A capsule-only oak, separate from route rewards.",
    image: "/models/decoration/capsule/oak-tree.png",
    icon: "tree",
    capsuleWeight: 6,
  },
  {
    id: "capsule-fountain",
    name: "Fountain",
    rarity: "legendary",
    description: "A capsule-only fountain for a rare centerpiece.",
    image: "/models/decoration/capsule/fountain.png",
    icon: "fountain",
    capsuleWeight: 3,
  },
];

export const legacyCapsuleDecorationPool: CapsuleDecorationPrize[] = [
  {
    id: "capsule-bench",
    name: "Pocket Bench",
    rarity: "common",
    description: "A tiny rest spot for the edge of your Scape lawn.",
    icon: "bench",
    capsuleWeight: 0,
  },
  {
    id: "capsule-road-cone",
    name: "Soft Road Cone",
    rarity: "common",
    description: "A playful marker that says: yes, this grass has traffic laws.",
    icon: "cone",
    capsuleWeight: 0,
  },
  {
    id: "capsule-shrub",
    name: "Round Shrub",
    rarity: "common",
    description: "A low, friendly green blob for filling quiet corners.",
    icon: "shrub",
    capsuleWeight: 0,
  },
  {
    id: "capsule-maple-tree",
    name: "Little Maple Tree",
    rarity: "rare",
    description: "A small ornamental tree. Decorative only, no landmark unlock attached.",
    icon: "tree",
    capsuleWeight: 0,
  },
  {
    id: "capsule-stone-lamp",
    name: "Stone Lawn Lamp",
    rarity: "rare",
    description: "A warm path light for late-night My Scape arranging.",
    icon: "lamp",
    capsuleWeight: 0,
  },
  {
    id: "capsule-picnic-cloth",
    name: "Picnic Cloth",
    rarity: "epic",
    description: "A bright fabric square for making the island feel inhabited.",
    icon: "picnic",
    capsuleWeight: 0,
  },
  {
    id: "capsule-glow-pebble",
    name: "Glow Pebble Set",
    rarity: "legendary",
    description: "Tiny luminous stones, legally distinct from actual magic. Probably.",
    icon: "pebble",
    capsuleWeight: 0,
  },
];

export const capsuleDecorationCatalog = [...defaultDecorationPool, ...legacyCapsuleDecorationPool];

export const defaultAtmosphereEffects: CapsuleAtmosphereEffect[] = [
  {
    id: "snowfall",
    name: "Snowfall",
    description: "Gentle snow particles drift over My Scape.",
    costFragments: 10,
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
    costFragments: 10,
    previewClassName: "from-pink-100 via-rose-100 to-stone-100",
  },
  {
    id: "custom-turf",
    name: "Custom Turf",
    description: "A richer grass skin for the My Scape ground.",
    costFragments: 10,
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
const normalizePoolName = (value: string) => value.trim().toLowerCase();

export const getDuplicateFragmentsForTier = (tier: RouteTier) => duplicateFragmentsByTier[tier] ?? 0;

export const buildCapsuleRoutePool = (routes: Route[] = defaultRoutes) => routes.filter(isPersonalRoute);
export const buildCapsuleDecorationPool = (
  routes: Route[] = defaultRoutes,
  decorations: CapsuleDecorationPrize[] = defaultDecorationPool,
) => {
  const runDecorationIds = new Set(routes.flatMap((route) => route.decorations?.map((decoration) => decoration.id) ?? []));
  const runDecorationNames = new Set(
    routes.flatMap((route) => route.decorations?.map((decoration) => normalizePoolName(decoration.name)) ?? []),
  );

  return decorations.filter(
    (decoration) => !runDecorationIds.has(decoration.id) && !runDecorationNames.has(normalizePoolName(decoration.name)),
  );
};

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
  const decorationPool = useMemo(() => buildCapsuleDecorationPool(routes, decorations), [decorations, routes]);

  const drawCapsule = (): CapsuleDrawResult => {
    const canDrawRoute = routePool.length > 0;
    const canDrawDecoration = decorationPool.length > 0;
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

    const decoration = weightedPick(decorationPool, (item) => item.capsuleWeight ?? 1) ?? decorationPool[0];

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
    decorationPool,
    atmosphereEffects,
    drawCapsule,
    getDuplicateFragmentsForTier,
    canExchangeEffect,
  };
};
