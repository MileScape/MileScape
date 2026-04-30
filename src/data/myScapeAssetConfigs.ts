export interface MyScapeAssetConfig {
  defaultScale?: number;
  footprintHeight?: number;
  footprintWidth?: number;
  imageSrc?: string;
  offsetX?: number;
  offsetY?: number;
}

export const myScapeAssetConfigs: Record<string, MyScapeAssetConfig> = {
  // Manhattan lights trail
  "statue-of-liberty": {
    defaultScale: 1.8,
    footprintWidth: 2,
    footprintHeight: 2,
    imageSrc: "/models/landmarks/central-park-route/statue-of-liberty.png",
    offsetX: 8,
    offsetY: 9,
  },
  "metropolitan-museum": {
    defaultScale: 1.0,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetX: 0,
    offsetY: 7,
  },
  "chrysler-building": {
    defaultScale: 1.22,
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 0,
  },
  "one-world-trade-center": {
    defaultScale: 1.22,
    footprintWidth: 1,
    footprintHeight: 1,
    offsetY: 15,
  },
  "bethesda-fountain": {
    defaultScale: 0.75,
    offsetY: 15,
  },
  "subway": {
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 8,
  },
  "jazz-club": {
    offsetX: 0,
    offsetY: 10,
    footprintWidth: 2,
  },
  "empire-state-building": {
    defaultScale: 1.5,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 14,
    offsetX: 0,
  },
  "one-vanderbilt-building": {
    defaultScale: 1.12,
    footprintWidth: 1,
    offsetY: 11,
  },
  "rockefeller-center-tree": {
    defaultScale: 1.02,
    footprintWidth: 1,
    offsetX: -1,
    offsetY: 12,
  },

  // Neon Sakura circuit
  "shibuya": {
    defaultScale: 1.16,
    footprintHeight: 3,
    footprintWidth: 3,
    offsetY: 11,
  },
  "senso-ji": {
    defaultScale: 1.14,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 8,
    imageSrc: "/models/landmarks/tokyo-route/senso-ji.png",
  },
  "tokyo-tower": {
    defaultScale: 2,
    footprintWidth: 2,
    footprintHeight: 2,
    imageSrc: "/models/landmarks/tokyo-route/tokyo-tower.png",
    offsetY: 15,
  },
  sakura: {
    defaultScale: 0.65,
    offsetY: 14,
  },
  "maneki-neko": {
    defaultScale: 0.84,
    offsetY: 12,
  },
  omamori: {
    footprintWidth: 2,
    offsetX: 6,
  },
  takoyaki: {
    offsetY: 30,
  },
  sukiyaki: {
    defaultScale: 0.7,
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 10,
    offsetX: 4,
  },
  "torii-gate-decoration": {
    defaultScale: 0.7,
    footprintWidth: 2,
    offsetY: 12,
  },

  // Gaudi conastine walk
  "sagrada-familia": {
    defaultScale: 1.8,
    footprintWidth: 3,
    footprintHeight: 3,
    offsetY: 10,
  },
  bullring: {
    defaultScale: 1.04,
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 8,
  },
  "mestalla-stadium": {
    defaultScale: 1.24,
    footprintWidth: 3,
    footprintHeight: 3,
    offsetY: 12,
  },
  "olive-oil": {
    defaultScale: 0.7,
    offsetY: 15,
  },
  fuet: {
    defaultScale: 0.7,
    footprintHeight: 2,
    offsetY: 18,
  },
  "gambas-al-ajillo": {
    defaultScale: 0.5,
    footprintWidth:1,
    offsetY: 18,
  },
  paella: {
    defaultScale: 0.7,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 12,
  },
  "burnt-basque-cheesecake": {
    defaultScale: 0.65,
    offsetY: 20,
  },
  guernica: {
    defaultScale: 0.9,
    footprintWidth: 3,
    offsetY: 4,
    offsetX: 2,
  },

  // Thames crown trail
  "big-ben": {
    defaultScale: 2,
    imageSrc: "/models/landmarks/london-route/BigBen.png",
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 8,
  },
  "westminster-abbey": {
    defaultScale: 1.7,
    footprintWidth: 3,
    footprintHeight: 3,
    offsetY: 10,
  },
  museum: {
    defaultScale: 1.06,
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 17,
    offsetX: 2,
  },
  "tower-bridge": {
    defaultScale: 1.08,
    footprintWidth: 3,
    footprintHeight: 2,
    imageSrc: "/models/landmarks/london-route/TowerBridge.png",
    offsetY: 12,
  },
  "windsor-castle": {
    defaultScale: 1.06,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 8,
  },
  "english-breakfast": {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 18,
  },
  "newsboy-cap": {
    defaultScale: 0.5,
    footprintWidth: 1,
    offsetY: 14,
  },
  "fish-and-chips": {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 18,
  },
  "red-telephone-box": {
    defaultScale: 0.9,
    footprintHeight: 1,
    offsetY: 10,
  },
  "double-decker-bus": {
    footprintWidth: 1,
    footprintHeight: 2,
    offsetY: 19,
    offsetX: -7,
  },
  "victorian-tea-set": {
    defaultScale: 0.5,
    footprintWidth: 1,
    offsetY: 14,
  },

  // seine romance path
  "louvre-courtyard": {
    defaultScale: 1.40,
    footprintWidth: 3,
    footprintHeight: 3,
    imageSrc: "/models/landmarks/paris-route/louvre-courtyard.png",
    offsetY: 12,
  },
  "eiffel-tower": {
    defaultScale: 2,
    footprintWidth: 3,
    footprintHeight: 3,
    imageSrc: "/models/landmarks/paris-route/eiffel-tower.png",
    offsetY: 9,
  },
  "arc-de-triomphe": {
    defaultScale: 1.38,
    footprintWidth: 4,
    footprintHeight: 2,
    offsetX: 4,
    offsetY: 9,
    imageSrc: "/models/landmarks/paris-route/arc-de-triomphe.png",
  },
  baguette: {
    defaultScale: 0.5,
    footprintHeight: 2,
    offsetY: 18,
  },
  chartreux: {
    defaultScale: 0.7,
    offsetY: 14,
  },
  clafoutis: {
    defaultScale: 0.6,
    footprintWidth: 1,
    offsetY: 22,
  },
  "peach-melba": {
    defaultScale: 0.6,
    footprintWidth: 1,
    offsetY: 16,
  },
  "cabernet-sauvignon": {
    defaultScale: 0.5,
    footprintWidth: 1,
    offsetY: 14,
  },
  "luxury-bag": {
    defaultScale: 0.67,
    footprintWidth: 1,
    offsetY: 12,
  },

  // Nile pyramind quest
  "cairo-citadel": {
    defaultScale: 1.36,
    footprintWidth: 3,
    footprintHeight: 3,
  },
  "the-sphinx": {
    defaultScale: 1.08,
    footprintHeight: 3,
    footprintWidth: 2,
    offsetY: 16,
  },
  "the-great-pyramid": {
    defaultScale: 1.42,
    footprintWidth: 3,
    footprintHeight: 3,
    offsetY: 18,
  },
  anubis: {
    defaultScale: 0.8,
    footprintWidth: 1,
    offsetY: 10,
  },
  "egyptian-mummy": {
    footprintHeight: 2,
    footprintWidth: 1,
    offsetY: 15,
  },
  "egyptian-sun-barge": {
    defaultScale: 1.2,
    footprintHeight: 2,
    offsetY: 35,
  },
  "catacombs-kom-el-shoqafa": {
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 12,
  },
  "pharaoh-crook-flail": {
    defaultScale: 0.7,
    footprintWidth: 1,
    footprintHeight: 1,
    offsetY: 14,
  },
  "pharaoh-nemes": {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 20,
  },

  // Han river memory trail
  "gyeongbokgung-palace": {
    defaultScale: 1.08,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 12,
  },
  "korean-tomb": {
    defaultScale: 1.04,
    footprintWidth: 2,
    footprintHeight: 2,    
    offsetY: 14,
  },
  "mountain-side-elevator": {
    defaultScale: 1.28,
    footprintWidth: 3,
    footprintHeight: 3,
  },
  kimchi: {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 18,
  },
  tteokbokki: {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 18,
  },
  soju: {
    offsetY: 15,
    defaultScale: 0.7,
  },
  "buldak-bokkeum-myeon": {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 15,
  },
  "korean-fried-chicken": {
    defaultScale: 0.6,
    footprintWidth: 1,
    offsetY: 18,
  },
  "korean-hanbok": {
    defaultScale: 0.9,
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 12,
  },

  // Harbour horizon run
  "sydney-opera-house": {
    defaultScale: 1.38,
    footprintWidth: 3,
    footprintHeight: 3,
    offsetY: 20,
  },
  // TODO
  "harbour-bridge": {
    defaultScale: 1.06,
    footprintWidth: 2,
    footprintHeight: 2,
  },
  "sydney-skyline": {
    defaultScale: 1.04,
    footprintWidth: 2,
  },
  "australian-meat-pie": {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 18,
  },
  boomerang: {
    defaultScale: 0.5,
    footprintWidth: 1,
    offsetY: 14,
  },
  "coral-reef": {
    defaultScale: 1.03,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 12,
  },
  koala: {
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 12,
  },
  platypus: {
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 22,
  },
  wallaby: {
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 12,
  },

  // eternal city path
  colosseum: {
    defaultScale: 1.38,
    footprintWidth: 3,
    footprintHeight: 3,
    offsetY: 12,
  },
  "roman-bath": {
    defaultScale: 1.04,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 14,
  },
  "greek-amphitheater": {
    defaultScale: 1.16,
    footprintWidth: 3,
    footprintHeight: 3,
    offsetY: 12,
  },
  parthenon: {
    defaultScale: 1.28,
    footprintWidth: 2,
    footprintHeight: 3,
    offsetY: 19,
    offsetX: -3,
  },
  espresso: {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 20,
  },
  "margherita-pizza": {
    defaultScale: 0.6,
    footprintWidth: 1,
    offsetY: 18,
  },
  lasagne: {
    defaultScale: 0.6,
    footprintWidth: 1,
    offsetY: 18,
  },
  "roman-laurel-wreath": {
    defaultScale: 0.7,
    offsetY: 14,
  },
  "roman-gladiator-helmet": {
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 12,
  },
  "roman-mosaic-floor": {
    defaultScale: 0.7,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 25,

  },

  // pacific golden trail
  "apple-park": {
    defaultScale: 1.25,
    footprintWidth: 3,
    footprintHeight: 3,
    offsetY: 12,
  },
  "gravitational-wave-observatory": {
    defaultScale: 1.06,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 22,
  },
  "yosemite-national-park": {
    defaultScale: 1.58,
    footprintWidth: 4,
    footprintHeight: 4,
  },
  avocado: {
    defaultScale: 0.6,
    footprintWidth: 1,
    offsetY: 18,
  },
  beach: {
    footprintHeight: 2,
    footprintWidth: 2,
    offsetY: 12,
  },
  "cowboy-hat": {
    defaultScale: 0.66,
    footprintWidth: 1,
    offsetY: 28,
  },
  gramophone: {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 18,
  },
  hollywood: {
    defaultScale: 1.08,
    footprintHeight: 2,
    footprintWidth: 3,
    offsetY: 12,
    offsetX: 2,
  },
  "award-statue": {
    defaultScale: 0.7,
    footprintHeight: 1,
    offsetY: 14,
  },

  // elephant mountain glow
  "taipei-101": {
    defaultScale: 1.38,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 12,
  },
  "sun-moon-lake": {
    defaultScale: 1.02,
    footprintWidth: 3,
    footprintHeight: 3,
    offsetY: 8,
    offsetX: -2,
  },
  yushan: {
    defaultScale: 1.26,
    footprintWidth: 3,
    footprintHeight: 3,
    offsetY: 18,
  },
  "kaohsiung-85-sky-tower": {
    defaultScale: 1.28,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 6,
  },
  "bubble-tea": {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 18,
  },
  "taiwan-beef-noodle": {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 18,
  },
  "taiwan-blue-magpie": {
    footprintWidth: 1,
    defaultScale: 0.7,
    offsetY: 26,
    offsetX: 12,
  },

  // Chao phraya drift
  "floating-market": {
    defaultScale: 1.08,
    footprintWidth: 3,
    footprintHeight: 2,
    offsetY: 12,
  },
  buddha: {
    defaultScale: 1.08,
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 5,
  },
  palm: {
    defaultScale: 0.9,
    footprintHeight: 1,
    footprintWidth: 1,
    offsetY: 14,
  },
  "mango-rice": {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 28,
  },
  "pad-thai": {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 22,
  },
  "banh-lot-noodles": {
    defaultScale: 0.7,
    footprintWidth: 1,
    offsetY: 27,
  },
  "tourist-duck-car": {
    footprintWidth: 2,
    footprintHeight: 2,
    offsetY: 12,
  },
};
