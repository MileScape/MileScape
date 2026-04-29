export type GachaDecorRarity = "Common" | "Uncommon" | "Rare";

export interface GachaDecorReward {
  id: string;
  name: string;
  description: string;
  rarity: GachaDecorRarity;
  blueprintValue: number;
  icon: "barrier" | "bench" | "tree";
}

export type AtmosphereEffectType = "skybox" | "particle" | "ground";

export interface AtmosphereReward {
  id: string;
  name: string;
  description: string;
  effectType: AtmosphereEffectType;
  costBlueprints: number;
}

export const gachaDecorRewards: GachaDecorReward[] = [
  {
    id: "mini-road-barrier",
    name: "Mini Road Barrier",
    description: "A small course marker for the edges of My Scape.",
    rarity: "Common",
    blueprintValue: 1,
    icon: "barrier",
  },
  {
    id: "park-bench",
    name: "Park Bench",
    description: "A quiet rest spot for routes that deserve a pause.",
    rarity: "Uncommon",
    blueprintValue: 2,
    icon: "bench",
  },
  {
    id: "ordinary-maple-tree",
    name: "Maple Tree",
    description: "A simple tree that softens the running lawn.",
    rarity: "Common",
    blueprintValue: 1,
    icon: "tree",
  },
  {
    id: "tall-pine-tree",
    name: "Tall Pine Tree",
    description: "A vertical evergreen accent for scenic corners.",
    rarity: "Rare",
    blueprintValue: 4,
    icon: "tree",
  },
];

export const atmosphereRewards: AtmosphereReward[] = [
  {
    id: "dusk-skybox",
    name: "Dusk Skybox",
    description: "Warm evening light for the My Scape horizon.",
    effectType: "skybox",
    costBlueprints: 8,
  },
  {
    id: "snowfall-effect",
    name: "Snowfall",
    description: "Soft snow drifting across the board.",
    effectType: "particle",
    costBlueprints: 10,
  },
  {
    id: "sakura-fall-effect",
    name: "Sakura Drift",
    description: "Pink petals floating through the scene.",
    effectType: "particle",
    costBlueprints: 10,
  },
  {
    id: "moss-ground",
    name: "Moss Ground",
    description: "A richer green surface material for the lawn.",
    effectType: "ground",
    costBlueprints: 6,
  },
  {
    id: "stone-ground",
    name: "Stone Path Ground",
    description: "A cool stone-tinted base for urban collections.",
    effectType: "ground",
    costBlueprints: 6,
  },
];
