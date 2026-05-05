import type { Route, RouteProgress, RunHistoryItem } from "../types";

export type BadgeAsset = {
  id: string;
  name: string;
  image: string;
  unlocked: boolean;
  unlockedAt: string | null;
  unlockCount?: number;
};

export type BadgeMedalTier = "locked" | "bronze" | "silver" | "gold" | "prism";

export type CountryAchievementSet = {
  country: string;
  routes: Route[];
  countryImage: string;
  assets: BadgeAsset[];
  unlockedCount: number;
  completedRoutes: number;
  totalRoutes: number;
  unlockedLandmarks: number;
  totalLandmarks: number;
  unlockedDecorations: number;
  totalDecorations: number;
  unlocked: boolean;
  unlockedAt: string | null;
};

type DecorationAchievementCount = { unlocked: number; total: number; unlockCount: number };
type RouteProgressMap = Map<string, RouteProgress>;
type Language = "en" | "zh";

export const achievementImages = {
  archaeologist: "/models/achievement/Archaeologist.png",
  art: "/models/achievement/art.png",
  building: "/models/achievement/building.png",
  calendar: "/models/achievement/calendar.png",
  closet: "/models/achievement/closet.png",
  collection: "/models/achievement/collection.png",
  finalline: "/models/achievement/finalline.png",
  food: "/models/achievement/food.png",
  journey: "/models/achievement/journey.png",
  zoo: "/models/achievement/zoo.png"
};

const countryAchievementImages: Record<string, string> = {
  Australia: "/models/achievement/Australia.png",
  China: "/models/achievement/China.png",
  Egypt: "/models/achievement/Egypt.png",
  France: "/models/achievement/France.png",
  Italy: "/models/achievement/Italy.png",
  Japan: "/models/achievement/Japen.png",
  "South Korea": "/models/achievement/SouthKorea.png",
  Spain: "/models/achievement/Spain.png",
  Thailand: "/models/achievement/Thailand.png",
  "United Kingdom": "/models/achievement/UK.png",
  "United States": "/models/achievement/USA.png"
};

export const fallbackBadgeImage = achievementImages.journey;

const countryCopy: Record<string, { zh: string; en: string }> = {
  Australia: { zh: "澳大利亚", en: "Australia" },
  China: { zh: "中国", en: "China" },
  Egypt: { zh: "埃及", en: "Egypt" },
  France: { zh: "法国", en: "France" },
  Italy: { zh: "意大利", en: "Italy" },
  Japan: { zh: "日本", en: "Japan" },
  Spain: { zh: "西班牙", en: "Spain" },
  Thailand: { zh: "泰国", en: "Thailand" },
  "South Korea": { zh: "韩国", en: "South Korea" },
  "United Kingdom": { zh: "英国", en: "United Kingdom" },
  "United States": { zh: "美国", en: "United States" }
};

export const badgeMedalStyles: Record<BadgeMedalTier, { base: string; inner: string; shine: string }> = {
  locked: {
    base: "from-white via-sage-50 to-sage-200",
    inner: "bg-[#f8f7f1]",
    shine: "opacity-0"
  },
  bronze: {
    base: "from-[#f6d2aa] via-[#a86533] to-[#4b2b1c]",
    inner: "bg-[linear-gradient(135deg,rgba(255,246,231,0.9),rgba(180,105,55,0.24),rgba(93,50,28,0.2))]",
    shine: "opacity-45"
  },
  silver: {
    base: "from-[#ffffff] via-[#aeb7bf] to-[#46505a]",
    inner: "bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(190,199,207,0.28),rgba(77,87,96,0.18))]",
    shine: "opacity-55"
  },
  gold: {
    base: "from-[#fff7bd] via-[#d49a18] to-[#67470a]",
    inner: "bg-[linear-gradient(135deg,rgba(255,248,198,0.95),rgba(218,161,31,0.28),rgba(107,72,11,0.2))]",
    shine: "opacity-6"
  },
  prism: {
    base: "from-[#83fff0] via-[#ffe38a] to-[#c47dff]",
    inner: "bg-[linear-gradient(135deg,rgba(238,255,252,0.9),rgba(255,219,116,0.22),rgba(191,125,255,0.2))]",
    shine: "opacity-70"
  }
};

export const getBadgeMedalTier = (unlockCount = 0): BadgeMedalTier => {
  if (unlockCount >= 9) {
    return "prism";
  }

  if (unlockCount >= 6) {
    return "gold";
  }

  if (unlockCount >= 3) {
    return "silver";
  }

  if (unlockCount >= 1) {
    return "bronze";
  }

  return "locked";
};

const animalDecorationIds = new Set([
  "maneki-neko",
  "chartreux",
  "anubis",
  "koala",
  "platypus",
  "wallaby",
  "taiwan-blue-magpie"
]);

const artDecorationIds = new Set([
  "guernica",
  "roman-mosaic-floor",
  "gramophone",
  "award-statue"
]);

const buildingDecorationIds = new Set([
  "bethesda-fountain",
  "empire-state-building",
  "one-vanderbilt-building",
  "torii-gate-decoration",
  "red-telephone-box",
  "catacombs-kom-el-shoqafa",
  "hollywood"
]);

const clothingDecorationIds = new Set([
  "newsboy-cap",
  "luxury-bag",
  "pharaoh-nemes",
  "korean-hanbok",
  "roman-laurel-wreath",
  "roman-gladiator-helmet",
  "cowboy-hat"
]);

const foodDecorationIds = new Set([
  "takoyaki",
  "sukiyaki",
  "olive-oil",
  "fuet",
  "gambas-al-ajillo",
  "paella",
  "burnt-basque-cheesecake",
  "english-breakfast",
  "fish-and-chips",
  "baguette",
  "clafoutis",
  "peach-melba",
  "cabernet-sauvignon",
  "kimchi",
  "tteokbokki",
  "soju",
  "buldak-bokkeum-myeon",
  "korean-fried-chicken",
  "australian-meat-pie",
  "espresso",
  "margherita-pizza",
  "lasagne",
  "avocado",
  "bubble-tea",
  "taiwan-beef-noodle",
  "mango-rice",
  "pad-thai",
  "banh-lot-noodles"
]);

const historicalDecorationIds = new Set([
  "anubis",
  "egyptian-mummy",
  "egyptian-sun-barge",
  "catacombs-kom-el-shoqafa",
  "pharaoh-crook-flail",
  "pharaoh-nemes",
  "roman-laurel-wreath",
  "roman-gladiator-helmet",
  "roman-mosaic-floor"
]);

export const getDisplayCountry = (country: string, language: Language) =>
  countryCopy[country]?.[language] ?? country;

export const formatDate = (value: string, language: Language) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return language === "zh"
    ? `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const countRunDays = (completedAtValues: string[]) =>
  new Set(
    completedAtValues
      .map((completedAt) => new Date(completedAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => date.toISOString().slice(0, 10)),
  ).size;

const normalizeAchievementCountry = (country: string) =>
  country === "Taiwan" ? "China" : country;

const getProgress = (progressMap: RouteProgressMap, routeId: string) =>
  progressMap.get(routeId);

const getLatestCountryRunAt = (routes: Route[], runHistory: RunHistoryItem[]) => {
  const routeIds = new Set(routes.map((route) => route.id));
  const routeRuns = runHistory
    .filter((run) => run.routeId && routeIds.has(run.routeId))
    .map((run) => run.completedAt)
    .sort();

  return routeRuns.length > 0 ? routeRuns[routeRuns.length - 1] : null;
};

const getCountryDecorationRefs = (routes: Route[]) =>
  routes.flatMap((route) =>
    (route.decorations ?? []).map((decoration) => ({
      routeId: route.id,
      decorationId: decoration.id
    }))
  );

const countCountryDecorationsInSet = (
  routes: Route[],
  progressMap: RouteProgressMap,
  decorationIds: Set<string>
): DecorationAchievementCount => {
  const decorations = getCountryDecorationRefs(routes).filter((decoration) =>
    decorationIds.has(decoration.decorationId)
  );

  const counts = decorations.map((decoration) =>
    getProgress(progressMap, decoration.routeId)?.decorations[decoration.decorationId] ?? 0
  );

  return {
    unlocked: counts.filter((count) => count > 0).length,
    total: decorations.length,
    unlockCount: counts.length > 0 ? Math.min(...counts) : 0
  };
};

const countCountryAllDecorationUnlocks = (
  routes: Route[],
  progressMap: RouteProgressMap,
) => {
  const counts = getCountryDecorationRefs(routes).map((decoration) =>
    getProgress(progressMap, decoration.routeId)?.decorations[decoration.decorationId] ?? 0
  );

  return counts.length > 0 ? Math.min(...counts) : 0;
};

const countCountryRouteLaps = (
  routes: Route[],
  progressMap: RouteProgressMap,
) => {
  const counts = routes.map((route) => getProgress(progressMap, route.id)?.runCount ?? 0);
  return counts.length > 0 ? Math.min(...counts) : 0;
};

const makeCategoryAchievement = (
  country: string,
  category: string,
  name: { zh: string; en: string },
  image: string,
  latestRunAt: string | null,
  count: DecorationAchievementCount,
  language: Language,
): BadgeAsset | null => {
  if (count.total <= 0) {
    return null;
  }

  const unlocked = count.unlocked >= count.total;
  return {
    id: `${country}-${category}`,
    name: name[language],
    image,
    unlocked,
    unlockedAt: unlocked ? latestRunAt : null,
    unlockCount: count.unlockCount
  };
};

const makeAvailableCountryAchievementAssets = (
  country: string,
  language: Language,
  latestRunAt: string | null,
  animalDecorations: DecorationAchievementCount,
  artDecorations: DecorationAchievementCount,
  buildingDecorations: DecorationAchievementCount,
  clothingDecorations: DecorationAchievementCount,
  foodDecorations: DecorationAchievementCount,
  historicalDecorations: DecorationAchievementCount,
  unlockedDecorations: number,
  totalDecorations: number,
  decorationUnlockCount: number,
  routeLapCount: number,
  unlockedAllLandmarks: boolean,
  completedAllRoutes: boolean,
): BadgeAsset[] => {
  const categoryAssets = [
    makeCategoryAchievement(country, "animals", { zh: "解锁所有动物装饰", en: "All Animal Decorations" }, achievementImages.zoo, latestRunAt, animalDecorations, language),
    makeCategoryAchievement(country, "art", { zh: "解锁所有艺术装饰", en: "All Art Decorations" }, achievementImages.art, latestRunAt, artDecorations, language),
    makeCategoryAchievement(country, "buildings", { zh: "解锁所有建筑装饰", en: "All Building Decorations" }, achievementImages.building, latestRunAt, buildingDecorations, language),
    makeCategoryAchievement(country, "clothing", { zh: "解锁所有服饰装饰", en: "All Clothing Decorations" }, achievementImages.closet, latestRunAt, clothingDecorations, language),
    makeCategoryAchievement(country, "food", { zh: "解锁所有食物装饰", en: "All Food Decorations" }, achievementImages.food, latestRunAt, foodDecorations, language),
    makeCategoryAchievement(country, "historical", { zh: "解锁所有历史文物", en: "All Historical Artifacts" }, achievementImages.archaeologist, latestRunAt, historicalDecorations, language)
  ].filter((asset): asset is BadgeAsset => Boolean(asset));

  const unlockedAllDecorations = totalDecorations > 0 && unlockedDecorations >= totalDecorations;

  return [
    ...categoryAssets,
    {
      id: `${country}-decorations`,
      name: language === "zh" ? "解锁所有装饰" : "All Decorations",
      image: achievementImages.collection,
      unlocked: unlockedAllDecorations,
      unlockedAt: unlockedAllDecorations ? latestRunAt : null,
      unlockCount: decorationUnlockCount
    },
    {
      id: `${country}-landmarks`,
      name: language === "zh" ? "解锁所有地标" : "All Landmarks",
      image: achievementImages.journey,
      unlocked: unlockedAllLandmarks,
      unlockedAt: unlockedAllLandmarks ? latestRunAt : null,
      unlockCount: unlockedAllLandmarks ? 9 : 0
    },
    {
      id: `${country}-finish`,
      name: language === "zh" ? "完成所有路线" : "All Routes Complete",
      image: achievementImages.finalline,
      unlocked: completedAllRoutes,
      unlockedAt: completedAllRoutes ? latestRunAt : null,
      unlockCount: completedAllRoutes ? routeLapCount : 0
    }
  ];
};

const buildCountrySet = (
  country: string,
  routes: Route[],
  progressMap: RouteProgressMap,
  runHistory: RunHistoryItem[],
  language: Language,
): CountryAchievementSet => {
  const latestRunAt = getLatestCountryRunAt(routes, runHistory);
  const completedRoutes = routes.filter((route) => getProgress(progressMap, route.id)?.completed).length;
  const totalRoutes = routes.length;
  const totalLandmarks = routes.reduce((sum, route) => sum + route.landmarks.length, 0);
  const unlockedLandmarks = routes.reduce((sum, route) => {
    const progress = getProgress(progressMap, route.id);
    return sum + route.landmarks.filter((landmark) => progress?.unlockedLandmarkIds.includes(landmark.id)).length;
  }, 0);
  const totalDecorations = routes.reduce((sum, route) => sum + (route.decorations?.length ?? 0), 0);
  const unlockedDecorations = routes.reduce((sum, route) => {
    const progress = getProgress(progressMap, route.id);
    return sum + (route.decorations ?? []).filter((decoration) => (progress?.decorations[decoration.id] ?? 0) > 0).length;
  }, 0);
  const decorationUnlockCount = countCountryAllDecorationUnlocks(routes, progressMap);
  const routeLapCount = countCountryRouteLaps(routes, progressMap);
  const animalDecorations = countCountryDecorationsInSet(routes, progressMap, animalDecorationIds);
  const artDecorations = countCountryDecorationsInSet(routes, progressMap, artDecorationIds);
  const buildingDecorations = countCountryDecorationsInSet(routes, progressMap, buildingDecorationIds);
  const clothingDecorations = countCountryDecorationsInSet(routes, progressMap, clothingDecorationIds);
  const foodDecorations = countCountryDecorationsInSet(routes, progressMap, foodDecorationIds);
  const historicalDecorations = countCountryDecorationsInSet(routes, progressMap, historicalDecorationIds);
  const unlockedAllLandmarks = totalLandmarks > 0 && unlockedLandmarks >= totalLandmarks;
  const completedAllRoutes = totalRoutes > 0 && completedRoutes >= totalRoutes;
  const unlocked = completedAllRoutes && unlockedAllLandmarks && totalDecorations > 0 && unlockedDecorations >= totalDecorations;

  const assets = makeAvailableCountryAchievementAssets(
    country,
    language,
    latestRunAt,
    animalDecorations,
    artDecorations,
    buildingDecorations,
    clothingDecorations,
    foodDecorations,
    historicalDecorations,
    unlockedDecorations,
    totalDecorations,
    decorationUnlockCount,
    routeLapCount,
    unlockedAllLandmarks,
    completedAllRoutes,
  );

  return {
    country,
    routes,
    countryImage: countryAchievementImages[country] ?? fallbackBadgeImage,
    assets,
    unlockedCount: assets.filter((asset) => asset.unlocked).length,
    completedRoutes,
    totalRoutes,
    unlockedLandmarks,
    totalLandmarks,
    unlockedDecorations,
    totalDecorations,
    unlocked,
    unlockedAt: unlocked ? latestRunAt : null
  };
};

export const buildCountryAchievementSets = (
  routes: Route[],
  progressList: RouteProgress[],
  runHistory: RunHistoryItem[],
  language: Language,
) => {
  const progressMap = new Map(progressList.map((progress) => [progress.routeId, progress]));
  const groupedRoutes = routes.reduce<Record<string, Route[]>>((groups, route) => {
    const country = normalizeAchievementCountry(route.country);
    groups[country] = groups[country] ?? [];
    groups[country].push(route);
    return groups;
  }, {});

  return Object.entries(groupedRoutes)
    .map(([country, countryRoutes]) => buildCountrySet(country, countryRoutes, progressMap, runHistory, language))
    .sort((a, b) => getDisplayCountry(a.country, language).localeCompare(getDisplayCountry(b.country, language)));
};