import { CheckCircle2, ListChecks, Lock, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "../hooks/useAppState";
import type { Route, RouteProgress, RunHistoryItem } from "../types";
import { cn } from "../utils/cn";

type BadgeAsset = {
  id: string;
  name: string;
  description: string;
  image: string;
  unlocked: boolean;
  unlockedAt: string | null;
  unlockCount?: number;
};

type BadgeMedalTier = "locked" | "bronze" | "silver" | "gold" | "prism";
type DecorationAchievementCount = { unlocked: number; total: number; unlockCount: number };

type CountryAchievementSet = {
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

type AchievementCopy = {
  eyebrow: string;
  title: string;
  description: string;
  completeOn: string;
  locked: string;
  unlocked: string;
  badgeList: string;
  details: string;
  badge: string;
  countryPrize: string;
  close: string;
  progress: string;
  routes: string;
  landmarks: string;
  decorations: string;
  unlockTime: string;
  notUnlocked: string;
};

const achievementImages = {
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

const fallbackBadgeImage = achievementImages.journey;

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

const palette = [
  "from-[#f2eee2] via-white to-[#d7e2d0]",
  "from-[#eee3d1] via-white to-[#d6dde8]",
  "from-[#e9efe6] via-white to-[#ead9cb]",
  "from-[#e5e2d8] via-white to-[#d8e5e2]"
];

const badgeMedalStyles: Record<BadgeMedalTier, { base: string; inner: string; shine: string }> = {
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

const getBadgeMedalTier = (unlockCount = 0): BadgeMedalTier => {
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

const normalizeAchievementCountry = (country: string) =>
  country === "Taiwan" ? "China" : country;

const getDisplayCountry = (country: string, language: "en" | "zh") =>
  countryCopy[country]?.[language] ?? country;

const getRouteProgress = (progressList: RouteProgress[], routeId: string) =>
  progressList.find((progress) => progress.routeId === routeId);

const formatDate = (value: string, language: "en" | "zh") => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return language === "zh"
    ? `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const countRunDays = (completedAtValues: string[]) =>
  new Set(
    completedAtValues
      .map((completedAt) => new Date(completedAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => date.toISOString().slice(0, 10)),
  ).size;

const getCountryRunDates = (routes: Route[], runHistory: RunHistoryItem[]) => {
  const routeIds = new Set(routes.map((route) => route.id));
  return runHistory
    .filter((run) => run.routeId && routeIds.has(run.routeId))
    .map((run) => run.completedAt)
    .sort();
};

const getLatestCountryRunAt = (routes: Route[], runHistory: RunHistoryItem[]) => {
  const routeRuns = getCountryRunDates(routes, runHistory);
  return routeRuns.length > 0 ? routeRuns[routeRuns.length - 1] : null;
};

const countCountryDecorationsInSet = (
  routes: Route[],
  progressList: RouteProgress[],
  decorationIds: Set<string>
) => {
  const decorations = routes.flatMap((route) =>
    (route.decorations ?? []).map((decoration) => ({
      routeId: route.id,
      decorationId: decoration.id
    }))
  ).filter((decoration) => decorationIds.has(decoration.decorationId));

  const unlocked = decorations.filter((decoration) => {
    const progress = getRouteProgress(progressList, decoration.routeId);
    return (progress?.decorations[decoration.decorationId] ?? 0) > 0;
  }).length;

  const unlockCount = decorations.length > 0
    ? Math.min(
        ...decorations.map((decoration) => {
          const progress = getRouteProgress(progressList, decoration.routeId);
          return progress?.decorations[decoration.decorationId] ?? 0;
        }),
      )
    : 0;

  return { unlocked, total: decorations.length, unlockCount };
};

const countCountryAllDecorationUnlocks = (
  routes: Route[],
  progressList: RouteProgress[],
) => {
  const decorations = routes.flatMap((route) =>
    (route.decorations ?? []).map((decoration) => ({
      routeId: route.id,
      decorationId: decoration.id
    }))
  );

  return decorations.length > 0
    ? Math.min(
        ...decorations.map((decoration) => {
          const progress = getRouteProgress(progressList, decoration.routeId);
          return progress?.decorations[decoration.decorationId] ?? 0;
        }),
      )
    : 0;
};

const countCountryRouteLaps = (
  routes: Route[],
  progressList: RouteProgress[],
) =>
  routes.length > 0
    ? Math.min(
        ...routes.map((route) => getRouteProgress(progressList, route.id)?.runCount ?? 0),
      )
    : 0;

const makeAvailableCountryAchievementAssets = (
  country: string,
  language: "en" | "zh",
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
  const assets: BadgeAsset[] = [];

  if (animalDecorations.total > 0) {
    const unlocked = animalDecorations.unlocked >= animalDecorations.total;
    assets.push({
      id: `${country}-animals`,
      name: language === "zh" ? "解锁所有动物装饰" : "All Animal Decorations",
      description: language === "zh" ? "收集这个国家路线中的全部动物类装饰。" : "Collect every animal decoration available in this country.",
      image: achievementImages.zoo,
      unlocked,
      unlockedAt: unlocked ? latestRunAt : null,
      unlockCount: animalDecorations.unlockCount
    });
  }

  if (artDecorations.total > 0) {
    const unlocked = artDecorations.unlocked >= artDecorations.total;
    assets.push({
      id: `${country}-art`,
      name: language === "zh" ? "解锁所有艺术装饰" : "All Art Decorations",
      description: language === "zh" ? "收集这个国家路线中的全部艺术品类装饰。" : "Collect every art decoration available in this country.",
      image: achievementImages.art,
      unlocked,
      unlockedAt: unlocked ? latestRunAt : null,
      unlockCount: artDecorations.unlockCount
    });
  }

  if (buildingDecorations.total > 0) {
    const unlocked = buildingDecorations.unlocked >= buildingDecorations.total;
    assets.push({
      id: `${country}-buildings`,
      name: language === "zh" ? "解锁所有建筑装饰" : "All Building Decorations",
      description: language === "zh" ? "收集这个国家路线中的全部建筑类装饰。" : "Collect every building decoration available in this country.",
      image: achievementImages.building,
      unlocked,
      unlockedAt: unlocked ? latestRunAt : null,
      unlockCount: buildingDecorations.unlockCount
    });
  }

  if (clothingDecorations.total > 0) {
    const unlocked = clothingDecorations.unlocked >= clothingDecorations.total;
    assets.push({
      id: `${country}-clothing`,
      name: language === "zh" ? "解锁所有服饰装饰" : "All Clothing Decorations",
      description: language === "zh" ? "收集这个国家路线中的全部服饰类装饰。" : "Collect every clothing decoration available in this country.",
      image: achievementImages.closet,
      unlocked,
      unlockedAt: unlocked ? latestRunAt : null,
      unlockCount: clothingDecorations.unlockCount
    });
  }

  if (foodDecorations.total > 0) {
    const unlocked = foodDecorations.unlocked >= foodDecorations.total;
    assets.push({
      id: `${country}-food`,
      name: language === "zh" ? "解锁所有食物装饰" : "All Food Decorations",
      description: language === "zh" ? "收集这个国家路线中的全部食物类装饰。" : "Collect every food decoration available in this country.",
      image: achievementImages.food,
      unlocked,
      unlockedAt: unlocked ? latestRunAt : null,
      unlockCount: foodDecorations.unlockCount
    });
  }

  if (historicalDecorations.total > 0) {
    const unlocked = historicalDecorations.unlocked >= historicalDecorations.total;
    assets.push({
      id: `${country}-historical`,
      name: language === "zh" ? "解锁所有历史文物" : "All Historical Artifacts",
      description: language === "zh" ? "收集这个国家路线中的全部历史文物类装饰。" : "Collect every historical artifact decoration available in this country.",
      image: achievementImages.archaeologist,
      unlocked,
      unlockedAt: unlocked ? latestRunAt : null,
      unlockCount: historicalDecorations.unlockCount
    });
  }

  return [
    ...assets,
    {
      id: `${country}-decorations`,
      name: language === "zh" ? "解锁所有装饰" : "All Decorations",
      description: language === "zh" ? "收集这个国家路线中的全部装饰。" : "Collect every decoration available in this country.",
      image: achievementImages.collection,
      unlocked: totalDecorations > 0 && unlockedDecorations >= totalDecorations,
      unlockedAt: totalDecorations > 0 && unlockedDecorations >= totalDecorations ? latestRunAt : null,
      unlockCount: decorationUnlockCount
    },
    {
      id: `${country}-landmarks`,
      name: language === "zh" ? "解锁所有地标" : "All Landmarks",
      description: language === "zh" ? "点亮这个国家路线中的全部地标。" : "Unlock every landmark across this country's routes.",
      image: achievementImages.journey,
      unlocked: unlockedAllLandmarks,
      unlockedAt: unlockedAllLandmarks ? latestRunAt : null,
      unlockCount: unlockedAllLandmarks ? 9 : 0
    },
    {
      id: `${country}-finish`,
      name: language === "zh" ? "完成所有路线" : "All Routes Complete",
      description: language === "zh" ? "把这个国家的全部路线推进到 100%。" : "Reach 100% progress on every route in this country.",
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
  progressList: RouteProgress[],
  runHistory: RunHistoryItem[],
  language: "en" | "zh",
): CountryAchievementSet => {
  const latestRunAt = getLatestCountryRunAt(routes, runHistory);
  const completedRoutes = routes.filter((route) => getRouteProgress(progressList, route.id)?.completed).length;
  const totalRoutes = routes.length;
  const totalLandmarks = routes.reduce((sum, route) => sum + route.landmarks.length, 0);
  const unlockedLandmarks = routes.reduce((sum, route) => {
    const progress = getRouteProgress(progressList, route.id);
    return sum + route.landmarks.filter((landmark) => progress?.unlockedLandmarkIds.includes(landmark.id)).length;
  }, 0);
  const totalDecorations = routes.reduce((sum, route) => sum + (route.decorations?.length ?? 0), 0);
  const unlockedDecorations = routes.reduce((sum, route) => {
    const progress = getRouteProgress(progressList, route.id);
    return sum + (route.decorations ?? []).filter((decoration) => (progress?.decorations[decoration.id] ?? 0) > 0).length;
  }, 0);
  const decorationUnlockCount = countCountryAllDecorationUnlocks(routes, progressList);
  const routeLapCount = countCountryRouteLaps(routes, progressList);
  const animalDecorations = countCountryDecorationsInSet(routes, progressList, animalDecorationIds);
  const artDecorations = countCountryDecorationsInSet(routes, progressList, artDecorationIds);
  const buildingDecorations = countCountryDecorationsInSet(routes, progressList, buildingDecorationIds);
  const clothingDecorations = countCountryDecorationsInSet(routes, progressList, clothingDecorationIds);
  const foodDecorations = countCountryDecorationsInSet(routes, progressList, foodDecorationIds);
  const historicalDecorations = countCountryDecorationsInSet(routes, progressList, historicalDecorationIds);
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

const BadgeHex = ({
  asset,
  index,
  featured = false
}: {
  asset: BadgeAsset;
  index: number;
  featured?: boolean;
}) => {
  const medalTier = getBadgeMedalTier(asset.unlockCount);
  const medalStyle = badgeMedalStyles[medalTier];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br p-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_-3px_8px_rgba(17,31,22,0.28),0_12px_22px_rgba(17,31,22,0.2)]",
        medalStyle.base,
        featured ? "h-24 w-24" : "h-16 w-16",
        asset.unlocked ? "opacity-100" : "opacity-45 grayscale",
      )}
      style={{
        clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)",
        transform: `rotate(${index % 2 === 0 ? "-4deg" : "5deg"})`
      }}
    >
      <div
        className="pointer-events-none absolute inset-[2px] border border-white/55 shadow-[inset_0_0_0_1px_rgba(17,31,22,0.14)]"
        style={{ clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)" }}
      />
      <div
        className={cn("pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.82)_28%,transparent_48%,rgba(255,255,255,0.36)_68%,transparent_100%)]", medalStyle.shine)}
      />
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center p-2 shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),inset_0_-5px_10px_rgba(17,31,22,0.1)]",
          medalStyle.inner
        )}
        style={{ clipPath: "polygon(25% 6%, 75% 6%, 98% 50%, 75% 94%, 25% 94%, 2% 50%)" }}
      >
        <img
          src={asset.image}
          alt=""
          className={cn("object-contain drop-shadow-[0_8px_10px_rgba(17,31,22,0.18)]", featured ? "h-16 w-16" : "h-10 w-10")}
          onError={(event) => {
            event.currentTarget.src = fallbackBadgeImage;
          }}
        />
      </div>
      {!asset.unlocked ? (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/18">
          <Lock className="h-4 w-4 text-white drop-shadow" />
        </div>
      ) : null}
    </div>
  );
};

const BadgeCluster = ({ assets }: { assets: BadgeAsset[] }) => {
  const featured = assets[0];
  const surrounding = assets.slice(1);

  return (
    <div className="relative min-h-[184px] w-full max-w-[360px]">
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        {featured ? <BadgeHex asset={featured} index={0} featured /> : null}
      </div>
      <div className="absolute left-[18%] top-[24%]">
        {surrounding[0] ? <BadgeHex asset={surrounding[0]} index={1} /> : null}
      </div>
      <div className="absolute right-[20%] top-[10%]">
        {surrounding[1] ? <BadgeHex asset={surrounding[1]} index={2} /> : null}
      </div>
      <div className="absolute right-[10%] top-[43%]">
        {surrounding[2] ? <BadgeHex asset={surrounding[2]} index={3} /> : null}
      </div>
      <div className="absolute bottom-[8%] right-[26%]">
        {surrounding[3] ? <BadgeHex asset={surrounding[3]} index={4} /> : null}
      </div>
    </div>
  );
};

const CalendarMedalIcon = ({ asset }: { asset: BadgeAsset }) => {
  const medalTier = getBadgeMedalTier(asset.unlockCount);
  const medalStyle = badgeMedalStyles[medalTier];

  return (
    <div
      className={cn(
        "relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br p-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-3px_8px_rgba(17,31,22,0.28),0_12px_22px_rgba(17,31,22,0.18)]",
        medalStyle.base,
        asset.unlocked ? "opacity-100" : "opacity-45 grayscale"
      )}
    >
      <div
        className={cn("pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.82)_28%,transparent_48%,rgba(255,255,255,0.36)_68%,transparent_100%)]", medalStyle.shine)}
      />
      <div className={cn("relative flex h-full w-full items-center justify-center rounded-full shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),inset_0_-5px_10px_rgba(17,31,22,0.1)]", medalStyle.inner)}>
        <img
          src={asset.image}
          alt=""
          className="h-20 w-20 object-contain drop-shadow-[0_8px_10px_rgba(17,31,22,0.16)]"
          onError={(event) => {
            event.currentTarget.src = fallbackBadgeImage;
          }}
        />
      </div>
    </div>
  );
};

const CountryPrizeBadge = ({ set }: { set: CountryAchievementSet }) => (
  <div
    className={cn(
      "relative flex h-24 w-24 items-center justify-center bg-gradient-to-br from-white via-sage-50 to-sage-200 p-1 shadow-[0_14px_26px_rgba(17,31,22,0.18)]",
      set.unlocked ? "opacity-100" : "opacity-45 grayscale",
    )}
    style={{ clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)" }}
  >
    <div
      className="flex h-full w-full items-center justify-center bg-[#f8f7f1] p-3"
      style={{ clipPath: "polygon(25% 6%, 75% 6%, 98% 50%, 75% 94%, 25% 94%, 2% 50%)" }}
    >
      <img src={set.countryImage} alt="" className="h-16 w-16 object-contain" />
    </div>
    {!set.unlocked ? (
      <div className="absolute inset-0 flex items-center justify-center bg-ink/18">
        <Lock className="h-4 w-4 text-white drop-shadow" />
      </div>
    ) : null}
  </div>
);

const CountryAchievementCard = ({
  set,
  index,
  copy,
  language,
  active,
  onOpen,
  setCardRef
}: {
  set: CountryAchievementSet;
  index: number;
  copy: AchievementCopy;
  language: "en" | "zh";
  active: boolean;
  onOpen: (set: CountryAchievementSet) => void;
  setCardRef: (element: HTMLElement | null) => void;
}) => {
  const collapsed = !active;
  const progressPercent = Math.round((set.unlockedCount / set.assets.length) * 100);

  return (
    <article
      ref={setCardRef}
      className={cn(
        "relative transition-all duration-300",
        collapsed ? "min-h-[68px]" : "min-h-[330px]"
      )}
      style={{ zIndex: active ? 50 : index }}
    >
      <div
        className={cn(
          "overflow-hidden rounded-[8px] bg-white/96 shadow-[0_18px_42px_rgba(17,31,22,0.13)] ring-1 ring-sage-100 transition-all duration-300",
          collapsed ? "min-h-[64px]" : "min-h-[310px]",
          active ? "scale-[1.01] shadow-[0_24px_58px_rgba(17,31,22,0.2)]" : "scale-[0.985]",
          set.unlocked ? "opacity-100" : "opacity-90"
        )}
      >
        <div
          className={cn(
            "grid bg-gradient-to-r transition-all duration-300",
            collapsed ? "min-h-[64px] grid-cols-[1fr_auto] items-center" : "min-h-[310px] grid-cols-1 md:grid-cols-[0.75fr_1.1fr_0.95fr]",
            palette[index % palette.length]
          )}
        >
          <div
            className={cn(
              "relative flex flex-col overflow-hidden p-5 transition-all duration-300",
              collapsed ? "min-h-[64px] justify-center py-3" : "min-h-[190px] justify-end"
            )}
          >
            <p className={cn("font-semibold uppercase tracking-[0.18em] text-sage-500", collapsed ? "text-[9px]" : "text-xs")}>
              {set.routes.length} {copy.routes}
            </p>
            <h2 className={cn("font-semibold leading-tight text-ink transition-all duration-300", collapsed ? "mt-0.5 text-2xl" : "mt-2 text-3xl")}>
              {getDisplayCountry(set.country, language)}
            </h2>
            {!collapsed ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-sage-500">
                {copy.countryPrize}
              </p>
            ) : null}
          </div>

          {collapsed ? (
            <div className="flex items-center gap-3 px-5">
              <span className="text-xs font-semibold text-sage-600">{set.unlockedCount}/{set.assets.length}</span>
              {set.unlocked ? <CheckCircle2 className="h-5 w-5 text-sage-600" /> : <Lock className="h-5 w-5 text-sage-400" />}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center px-4 py-7">
                <BadgeCluster assets={set.assets} />
              </div>

              <div className="flex h-full flex-col justify-center bg-white/80 px-6 py-7 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">{copy.details}</p>
                    <h3 className="mt-2 text-2xl font-semibold leading-tight text-ink">
                      {getDisplayCountry(set.country, language)} {language === "zh" ? "成就套组" : "Achievement Set"}
                    </h3>
                  </div>
                  <CountryPrizeBadge set={set} />
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-sage-600">
                    <span>{copy.progress}</span>
                    <span>{set.unlockedCount}/{set.assets.length}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-sage-100">
                    <div className="h-full rounded-full bg-sage-600" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="mt-auto flex justify-end pt-6">
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onPointerMove={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen(set);
                    }}
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f2a51a] px-5 py-3 text-sm font-semibold text-ink shadow-[0_10px_20px_rgba(242,165,26,0.24)] transition active:scale-[0.98]"
                  >
                    <ListChecks className="h-5 w-5" />
                    {copy.badgeList}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </article>
  );
};

export const AchievementsPage = () => {
  const { language, routes, state } = useAppState();
  const [selectedSet, setSelectedSet] = useState<CountryAchievementSet | null>(null);
  const [activeCountryIndex, setActiveCountryIndex] = useState(0);
  const cardFolderRef = useRef<HTMLDivElement | null>(null);
  const countryCardRefs = useRef<Array<HTMLElement | null>>([]);
  const copy = language === "zh"
    ? {
        eyebrow: "Achievements",
        title: "国家成就徽章套组",
        description: "每个国家一套成就，套组内保留跑步、动物、食物、地标和路线完成成就。全部完成后获得国家徽章。",
        completeOn: "完成于",
        locked: "未完成",
        unlocked: "已解锁",
        badgeList: "徽章列表",
        details: "国家成就详情",
        badge: "成就徽章",
        countryPrize: "国家大奖章",
        close: "关闭",
        progress: "成就进度",
        routes: "路线",
        landmarks: "地标",
        decorations: "装饰",
        unlockTime: "解锁时间",
        notUnlocked: "未解锁",
      }
    : {
        eyebrow: "Achievements",
        title: "Country Achievement Badge Sets",
        description: "Each country has one set with the same run, animal, food, landmark, and route completion achievements. Complete all to earn the country badge.",
        completeOn: "Completed on",
        locked: "Locked",
        unlocked: "Unlocked",
        badgeList: "Badge list",
        details: "Country achievement detail",
        badge: "Achievement badge",
        countryPrize: "Country prize badge",
        close: "Close",
        progress: "Achievement progress",
        routes: "Routes",
        landmarks: "Landmarks",
        decorations: "Decorations",
        unlockTime: "Unlocked",
        notUnlocked: "Locked",
      };

  const countrySets = useMemo<CountryAchievementSet[]>(() => {
    const groupedRoutes = routes.reduce<Record<string, Route[]>>((groups, route) => {
      const country = normalizeAchievementCountry(route.country);
      return {
        ...groups,
        [country]: [...(groups[country] ?? []), route]
      };
    }, {});

    return Object.entries(groupedRoutes)
      .map(([country, countryRoutes]) => buildCountrySet(country, countryRoutes, state.routeProgress, state.runHistory, language))
      .sort((a, b) => getDisplayCountry(a.country, language).localeCompare(getDisplayCountry(b.country, language)));
  }, [language, routes, state.routeProgress, state.runHistory]);

  const unlockedCount = countrySets.filter((set) => set.unlocked).length;
  const totalRunDays = countRunDays(state.runHistory.map((run) => run.completedAt));
  const calendarAchievement: BadgeAsset = {
    id: "general-run-days",
    name: language === "zh" ? "累计跑步天数" : "Total Running Days",
    description: language === "zh" ? "记录你在不同日期完成跑步的天数。" : "Tracks how many different dates you have completed a run.",
    image: achievementImages.calendar,
    unlocked: totalRunDays > 0,
    unlockedAt: null,
    unlockCount: totalRunDays
  };
  const firstRunAt = state.runHistory
    .map((run) => run.completedAt)
    .sort()[0] ?? null;

  useEffect(() => {
    let animationFrame = 0;

    const updateActiveCountryFromScroll = () => {
      const folderRect = cardFolderRef.current?.getBoundingClientRect();

      if (!folderRect || folderRect.bottom < 0 || folderRect.top > window.innerHeight) {
        return;
      }

      const targetY = Math.min(Math.max(window.innerHeight * 0.46, folderRect.top), folderRect.bottom);
      const nextIndex = countryCardRefs.current.reduce((closestIndex, element, index) => {
        if (!element) {
          return closestIndex;
        }

        const rect = element.getBoundingClientRect();
        const currentDistance = Math.abs(rect.top + rect.height / 2 - targetY);
        const closestElement = countryCardRefs.current[closestIndex];
        const closestRect = closestElement?.getBoundingClientRect();
        const closestDistance = closestRect
          ? Math.abs(closestRect.top + closestRect.height / 2 - targetY)
          : Number.POSITIVE_INFINITY;

        return currentDistance < closestDistance ? index : closestIndex;
      }, 0);

      setActiveCountryIndex(nextIndex);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateActiveCountryFromScroll);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [countrySets.length]);

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-[22px] bg-white p-4 shadow-card ring-1 ring-sage-100">
          <p className="text-2xl font-semibold text-ink">{unlockedCount}</p>
          <p className="mt-1 text-xs font-medium text-sage-600">{copy.unlocked}</p>
        </div>
        <div className="rounded-[22px] bg-white p-4 shadow-card ring-1 ring-sage-100">
          <p className="text-2xl font-semibold text-ink">{countrySets.length}</p>
          <p className="mt-1 text-xs font-medium text-sage-600">{copy.details}</p>
        </div>
      </section>

      <section className="flex justify-center">
        <div className="w-full max-w-[360px] rounded-[8px] bg-white p-5 text-center shadow-[0_18px_42px_rgba(17,31,22,0.13)] ring-1 ring-sage-100">
          <div className="mx-auto flex h-28 w-28 items-center justify-center">
            <CalendarMedalIcon asset={calendarAchievement} />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">
            {language === "zh" ? "通用成就" : "General achievement"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">
            {language === "zh" ? "累计跑步天数" : "Total Running Days"}
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-3xl font-semibold text-ink">{totalRunDays}</span>
            <span className="text-sm font-semibold text-sage-500">{language === "zh" ? "天" : "days"}</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-sage-500">
            {firstRunAt ? `${language === "zh" ? "首次解锁" : "Unlocked"} ${formatDate(firstRunAt, language)}` : copy.notUnlocked}
          </p>
        </div>
      </section>

      <section className="relative">
        <div className="p-1">
          <div
            ref={cardFolderRef}
            className="px-1 pr-2"
          >
            <div className="space-y-[-10px] pb-8">
            {countrySets.map((set, index) => (
              <CountryAchievementCard
                key={set.country}
                set={set}
                index={index}
                copy={copy}
                language={language}
                active={index === activeCountryIndex}
                onOpen={setSelectedSet}
                setCardRef={(element) => {
                  countryCardRefs.current[index] = element;
                }}
              />
            ))}
            </div>
          </div>
        </div>
      </section>

      {selectedSet ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/42 px-4 backdrop-blur-sm">
          <div className="max-h-[86vh] w-full max-w-[760px] overflow-hidden rounded-[8px] bg-[#f7f5ef] shadow-[0_26px_80px_rgba(17,31,22,0.32)] ring-1 ring-white/80">
            <div className="flex items-start justify-between gap-4 border-b border-sage-100 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-500">{copy.details}</p>
                <h3 className="mt-1 text-xl font-semibold text-ink">
                  {getDisplayCountry(selectedSet.country, language)} {language === "zh" ? "成就套组" : "Achievement Set"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSet(null)}
                className="rounded-full bg-sage-50 p-2 text-sage-700 ring-1 ring-sage-100"
                aria-label={copy.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between rounded-[8px] bg-white p-4 ring-1 ring-sage-100">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage-500">{copy.countryPrize}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{getDisplayCountry(selectedSet.country, language)}</p>
                </div>
                <CountryPrizeBadge set={selectedSet} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedSet.assets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className={cn(
                      "relative rounded-[8px] bg-white p-3 shadow-sm ring-1 ring-sage-100",
                      asset.unlocked ? "opacity-100" : "opacity-55 grayscale"
                    )}
                  >
                    <div className="absolute right-3 top-3 rounded-full bg-sage-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-600">
                      {asset.unlockedAt ? formatDate(asset.unlockedAt, language) : copy.notUnlocked}
                    </div>
                    <div className="flex gap-3 pr-20">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center">
                        <BadgeHex asset={asset} index={index} featured />
                      </div>
                      <div className="min-w-0 pt-1">
                        <p className="text-xs font-semibold text-ink">{asset.name}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-500">
                          {copy.badge}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-sage-500">
                          {asset.unlocked ? (
                            <CheckCircle2 className="h-4 w-4 text-sage-600" />
                          ) : (
                            <Lock className="h-4 w-4 text-sage-400" />
                          )}
                          <span>{asset.unlocked ? copy.unlockTime : copy.notUnlocked}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-[8px] bg-white p-3 ring-1 ring-sage-100">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">{copy.routes}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selectedSet.completedRoutes}/{selectedSet.totalRoutes}</p>
                </div>
                <div className="rounded-[8px] bg-white p-3 ring-1 ring-sage-100">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">{copy.landmarks}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selectedSet.unlockedLandmarks}/{selectedSet.totalLandmarks}</p>
                </div>
                <div className="rounded-[8px] bg-white p-3 ring-1 ring-sage-100">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">{copy.decorations}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{selectedSet.unlockedDecorations}/{selectedSet.totalDecorations}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
