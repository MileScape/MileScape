import { CheckCircle2, Lock, X } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { cn } from "../utils/cn";

type MedalTier = "locked" | "bronze" | "silver" | "gold" | "prism";

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  detail: string;
  current: number;
  baseTarget: number;
  unit?: string;
  image: string;
}

const achievementImages = {
  calendar: "/models/achievement/calendar.png",
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

const countryDisplayNames: Record<string, { en: string; zh: string }> = {
  Australia: { en: "Australia", zh: "澳大利亚" },
  China: { en: "China", zh: "中国" },
  Egypt: { en: "Egypt", zh: "埃及" },
  France: { en: "France", zh: "法国" },
  Italy: { en: "Italy", zh: "意大利" },
  Japan: { en: "Japan", zh: "日本" },
  "South Korea": { en: "South Korea", zh: "韩国" },
  Spain: { en: "Spain", zh: "西班牙" },
  Thailand: { en: "Thailand", zh: "泰国" },
  "United Kingdom": { en: "United Kingdom", zh: "英国" },
  "United States": { en: "United States", zh: "美国" }
};

const normalizeAchievementCountry = (country: string) =>
  country === "Taiwan" ? "China" : country;

const animalDecorationIds = new Set([
  "maneki-neko",
  "chartreux",
  "anubis",
  "koala",
  "platypus",
  "wallaby",
  "taiwan-blue-magpie"
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

const countRunDays = (completedAtValues: string[]) =>
  new Set(
    completedAtValues
      .map((completedAt) => new Date(completedAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => date.toISOString().slice(0, 10)),
  ).size;

const getTierTarget = (baseTarget: number, tier: Exclude<MedalTier, "locked">) => {
  const multipliers: Record<Exclude<MedalTier, "locked">, number> = {
    bronze: 1,
    silver: 3,
    gold: 9,
    prism: 27
  };

  return baseTarget * multipliers[tier];
};

const getMedalTier = (current: number, baseTarget: number): MedalTier => {
  if (baseTarget <= 0 || current < baseTarget) {
    return "locked";
  }

  if (current >= getTierTarget(baseTarget, "prism")) {
    return "prism";
  }

  if (current >= getTierTarget(baseTarget, "gold")) {
    return "gold";
  }

  if (current >= getTierTarget(baseTarget, "silver")) {
    return "silver";
  }

  return "bronze";
};

const getNextTarget = (current: number, baseTarget: number) => {
  const nextTier = (["bronze", "silver", "gold", "prism"] as const).find(
    (tier) => current < getTierTarget(baseTarget, tier),
  );

  return nextTier ? getTierTarget(baseTarget, nextTier) : getTierTarget(baseTarget, "prism");
};

const formatProgress = (current: number, target: number, unit?: string) =>
  `${current}/${target}${unit ? ` ${unit}` : ""}`;

const medalStyles: Record<MedalTier, { shell: string; core: string; dot: string; text: string; bar: string }> = {
  locked: {
    shell: "bg-sage-100 text-sage-400 shadow-[inset_0_0_0_1px_rgba(93,108,82,0.08)]",
    core: "bg-white/80 text-sage-400 ring-sage-200",
    dot: "bg-sage-100 text-sage-400",
    text: "text-sage-500",
    bar: "bg-sage-300"
  },
  bronze: {
    shell: "bg-gradient-to-br from-stone-400 via-yellow-700 to-stone-700 shadow-[0_14px_32px_rgba(120,96,55,0.22)]",
    core: "bg-white/18 text-white ring-white/24",
    dot: "bg-yellow-100 text-yellow-800",
    text: "text-yellow-800",
    bar: "bg-yellow-700"
  },
  silver: {
    shell: "bg-gradient-to-br from-slate-100 to-slate-500 shadow-[0_14px_32px_rgba(100,116,139,0.26)]",
    core: "bg-white/22 text-white ring-white/30",
    dot: "bg-slate-100 text-slate-700",
    text: "text-slate-700",
    bar: "bg-slate-500"
  },
  gold: {
    shell: "bg-gradient-to-br from-amber-200 to-yellow-600 shadow-[0_14px_32px_rgba(202,138,4,0.3)]",
    core: "bg-white/22 text-white ring-white/32",
    dot: "bg-amber-100 text-amber-700",
    text: "text-amber-700",
    bar: "bg-amber-500"
  },
  prism: {
    shell: "bg-gradient-to-br from-fuchsia-400 via-sky-400 to-emerald-300 shadow-[0_14px_34px_rgba(14,165,233,0.3)]",
    core: "bg-white/24 text-white ring-white/34",
    dot: "bg-fuchsia-100 text-fuchsia-700",
    text: "text-fuchsia-700",
    bar: "bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-300"
  }
};

const getMedalLabel = (tier: MedalTier, language: "en" | "zh") => {
  const labels: Record<MedalTier, { en: string; zh: string }> = {
    locked: { en: "Locked", zh: "未解锁" },
    bronze: { en: "Bronze", zh: "铜牌" },
    silver: { en: "Silver", zh: "银牌" },
    gold: { en: "Gold", zh: "金牌" },
    prism: { en: "Prism", zh: "棱镜" }
  };

  return labels[tier][language];
};

export const AchievementsPage = () => {
  const { language, routes, state } = useAppState();
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const runDays = countRunDays(state.runHistory.map((run) => run.completedAt));
  const totalDistanceKm = Math.floor(state.runHistory.reduce((sum, run) => sum + run.distanceKm, 0));
  const completedRoutes = state.routeProgress.filter((progress) => progress.completed).length;
  const unlockedDecorationIds = new Set(
    state.routeProgress.flatMap((progress) =>
      Object.entries(progress.decorations)
        .filter(([, count]) => count > 0)
        .map(([decorationId]) => decorationId),
    ),
  );
  const routeDecorationIds = new Set(
    routes.flatMap((route) => route.decorations?.map((decoration) => decoration.id) ?? []),
  );
  const totalAnimalWidgets = [...animalDecorationIds].filter((id) => routeDecorationIds.has(id)).length;
  const totalFoodWidgets = [...foodDecorationIds].filter((id) => routeDecorationIds.has(id)).length;
  const unlockedAnimalWidgets = [...animalDecorationIds].filter((id) => unlockedDecorationIds.has(id)).length;
  const unlockedFoodWidgets = [...foodDecorationIds].filter((id) => unlockedDecorationIds.has(id)).length;
  const countryAchievementItems: AchievementItem[] = Object.entries(countryAchievementImages).map(([country, image]) => {
    const countryRoutes = routes.filter((route) => normalizeAchievementCountry(route.country) === country);
    const totals = countryRoutes.reduce(
      (summary, route) => ({
        target: summary.target + 1 + route.landmarks.length + (route.decorations?.length ?? 0),
        current:
          summary.current +
          (() => {
      const progress = state.routeProgress.find((entry) => entry.routeId === route.id);
      const routeDecorationIds = route.decorations?.map((decoration) => decoration.id) ?? [];
            const unlockedLandmarkCount = route.landmarks.filter((landmark) =>
        progress?.unlockedLandmarkIds.includes(landmark.id),
            ).length;
            const unlockedDecorationCount = routeDecorationIds.filter((decorationId) =>
        unlockedDecorationIds.has(decorationId),
            ).length;

            return (progress?.completed ? 1 : 0) + unlockedLandmarkCount + unlockedDecorationCount;
          })()
      }),
      { current: 0, target: 0 },
    );
    const displayName = countryDisplayNames[country]?.[language] ?? country;

    return language === "zh"
      ? {
          id: `country-${country}`,
          title: `${displayName}全解锁`,
          description: `解锁${displayName}的全部内容`,
          detail: `完成${displayName}下的所有路线，解锁全部地标，并收集该国家路线里的全部装饰物。`,
          current: totals.current,
          baseTarget: Math.max(1, totals.target),
          unit: "项",
          image
        }
      : {
          id: `country-${country}`,
          title: `${displayName} Complete`,
          description: `Unlock everything in ${displayName}`,
          detail: `Complete every ${displayName} route, unlock every landmark, and collect every decoration from that country's routes.`,
          current: totals.current,
          baseTarget: Math.max(1, totals.target),
          unit: "items",
          image
        };
  });

  const items: AchievementItem[] = language === "zh"
    ? [
        {
          id: "calendar",
          title: "时间记录者",
          description: "在不同日期完成跑步",
          detail: "日历奖牌记录你的跑步习惯。每个自然日只计算一次，持续在不同日期完成跑步会提升品质。",
          current: runDays,
          baseTarget: 1,
          unit: "天",
          image: achievementImages.calendar
        },
        {
          id: "journey",
          title: "旅程开拓者",
          description: "累计更多跑步公里",
          detail: "旅程奖牌记录你在所有路线和任务中的累计距离，是最稳定的长期成长目标。",
          current: totalDistanceKm,
          baseTarget: 20,
          unit: "km",
          image: achievementImages.journey
        },
        {
          id: "finalline",
          title: "冲线完成者",
          description: "完整解锁路线目的地",
          detail: "终点线奖牌记录已完成的路线。每条路线进度达到 100% 后，都会计入这里。",
          current: completedRoutes,
          baseTarget: 1,
          unit: "条",
          image: achievementImages.finalline
        },
        ...countryAchievementItems,
        {
          id: "food",
          title: "美食收藏家",
          description: "解锁所有美食小组件",
          detail: "美食奖牌统计已经获得的食物类装饰物。完成不同路线跑步，有机会收集更多地区美食。",
          current: unlockedFoodWidgets,
          baseTarget: Math.max(1, totalFoodWidgets),
          unit: "个",
          image: achievementImages.food
        },
        {
          id: "zoo",
          title: "动物园馆长",
          description: "解锁所有动物小组件",
          detail: "动物园奖牌统计已经获得的动物类装饰物，例如猫、考拉、鸭嘴兽、沙袋鼠和蓝鹊等。",
          current: unlockedAnimalWidgets,
          baseTarget: Math.max(1, totalAnimalWidgets),
          unit: "个",
          image: achievementImages.zoo
        }
      ]
    : [
        {
          id: "calendar",
          title: "Time Keeper",
          description: "Run on different dates",
          detail: "The calendar medal tracks your running habit. Each calendar date counts once, and more active dates upgrade the medal.",
          current: runDays,
          baseTarget: 1,
          unit: "days",
          image: achievementImages.calendar
        },
        {
          id: "journey",
          title: "Journey Maker",
          description: "Build your total running distance",
          detail: "The journey medal tracks total distance across routes and missions. It is the steady long-term progress medal.",
          current: totalDistanceKm,
          baseTarget: 20,
          unit: "km",
          image: achievementImages.journey
        },
        {
          id: "finalline",
          title: "Finish Line Finisher",
          description: "Fully unlock route destinations",
          detail: "The finish line medal tracks completed routes. A route counts once its progress reaches 100%.",
          current: completedRoutes,
          baseTarget: 1,
          unit: "routes",
          image: achievementImages.finalline
        },
        ...countryAchievementItems,
        {
          id: "food",
          title: "Food Collector",
          description: "Unlock every food widget",
          detail: "The food medal tracks food-themed decorations collected from route rewards across different cities.",
          current: unlockedFoodWidgets,
          baseTarget: Math.max(1, totalFoodWidgets),
          unit: "widgets",
          image: achievementImages.food
        },
        {
          id: "zoo",
          title: "Zoo Curator",
          description: "Unlock every animal widget",
          detail: "The zoo medal tracks animal-themed decorations such as cats, koalas, platypus, wallaby, and blue magpie.",
          current: unlockedAnimalWidgets,
          baseTarget: Math.max(1, totalAnimalWidgets),
          unit: "widgets",
          image: achievementImages.zoo
        }
      ];
  const copy = language === "zh"
    ? {
        eyebrow: "Achievements",
        title: "成就",
        description: "成就内容已按现有奖牌图片重做。点击奖牌查看详情。",
        completed: "已达成",
        locked: "未达成",
        summary: "已解锁奖牌",
        total: "全部奖牌",
        detailTitle: "成就详情",
        baseTarget: "基础目标",
        nextTarget: "下一目标",
        current: "当前进度",
        close: "关闭"
      }
    : {
        eyebrow: "Achievements",
        title: "Achievements",
        description: "Achievements now match the available medal artwork. Tap a medal to view details.",
        completed: "Completed",
        locked: "Locked",
        summary: "Unlocked medals",
        total: "Total medals",
        detailTitle: "Achievement detail",
        baseTarget: "Base target",
        nextTarget: "Next target",
        current: "Current",
        close: "Close"
      };
  const unlockedCount = items.filter((item) => getMedalTier(item.current, item.baseTarget) !== "locked").length;
  const selectedAchievement = items.find((item) => item.id === selectedAchievementId) ?? null;

  const renderBadgeIcon = (item: AchievementItem) => (
    <img
      src={item.image}
      alt=""
      className="h-24 w-24 object-contain drop-shadow-[0_10px_14px_rgba(17,31,22,0.2)]"
      onError={(event) => {
        event.currentTarget.src = achievementImages.journey;
      }}
    />
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-[26px] bg-white p-4 shadow-card ring-1 ring-sage-100">
          <p className="text-2xl font-semibold text-ink">{unlockedCount}</p>
          <p className="mt-1 text-xs font-medium text-sage-600">{copy.summary}</p>
        </div>
        <div className="rounded-[26px] bg-white p-4 shadow-card ring-1 ring-sage-100">
          <p className="text-2xl font-semibold text-ink">{items.length}</p>
          <p className="mt-1 text-xs font-medium text-sage-600">{copy.total}</p>
        </div>
      </section>

      <section className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex snap-x snap-mandatory gap-4">
          {items.map((item) => {
            const { id, title, description, current, baseTarget, unit } = item;
            const medalTier = getMedalTier(current, baseTarget);
            const medalStyle = medalStyles[medalTier];
            const unlocked = medalTier !== "locked";
            const nextTarget = getNextTarget(current, baseTarget);

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedAchievementId(id)}
                className={cn(
                  "flex min-h-[330px] w-[76%] max-w-[280px] shrink-0 snap-center flex-col rounded-[28px] bg-white p-4 text-left shadow-card ring-1 transition active:scale-[0.99]",
                  unlocked ? "ring-sage-100" : "ring-sage-100/80",
                )}
              >
                <div className="flex w-full justify-center">
                  <div className="relative flex aspect-square w-full max-w-[190px] items-center justify-center rounded-[26px] bg-sage-50/70 ring-1 ring-sage-100">
                    <div className={cn("flex h-[132px] w-[132px] items-center justify-center rounded-full p-1.5", medalStyle.shell)}>
                      <div className={cn("flex h-full w-full items-center justify-center rounded-full ring-1", medalStyle.core)}>
                        {renderBadgeIcon(item)}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full ring-[3px] ring-white",
                        medalStyle.dot,
                      )}
                    >
                      {unlocked ? <CheckCircle2 className="h-[18px] w-[18px]" /> : <Lock className="h-[18px] w-[18px]" />}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex min-w-0 flex-1 flex-col self-stretch">
                  <div className="flex flex-wrap items-center justify-center gap-2 text-center">
                    <h3 className="text-sm font-semibold text-ink">{title}</h3>
                    <span
                      className={cn(
                        "rounded-full bg-sage-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        medalStyle.text,
                      )}
                    >
                      {getMedalLabel(medalTier, language)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-center text-xs leading-5 text-sage-600">{description}</p>

                  <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-sage-500">
                      <span>{unlocked ? copy.completed : copy.locked}</span>
                      <span>{formatProgress(current, nextTarget, unit)}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sage-100">
                      <div
                        className={cn("h-full rounded-full", medalStyle.bar)}
                        style={{ width: `${Math.min(100, Math.round((current / nextTarget) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedAchievement ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/36 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[30px] bg-[#f7f5f0] p-5 shadow-[0_24px_70px_rgba(17,31,22,0.24)] ring-1 ring-white/80">
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-500">{copy.detailTitle}</p>
              <button
                type="button"
                onClick={() => setSelectedAchievementId(null)}
                className="rounded-full bg-white/80 p-2 text-sage-700 ring-1 ring-sage-100"
                aria-label={copy.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {(() => {
              const medalTier = getMedalTier(selectedAchievement.current, selectedAchievement.baseTarget);
              const medalStyle = medalStyles[medalTier];
              const nextTarget = getNextTarget(selectedAchievement.current, selectedAchievement.baseTarget);

              return (
                <div className="mt-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("flex h-24 w-24 shrink-0 items-center justify-center rounded-full p-1", medalStyle.shell)}>
                      <div className={cn("flex h-full w-full items-center justify-center rounded-full ring-1", medalStyle.core)}>
                        {renderBadgeIcon(selectedAchievement)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-ink">{selectedAchievement.title}</h3>
                      <p className={cn("mt-1 text-xs font-semibold uppercase tracking-[0.14em]", medalStyle.text)}>
                        {getMedalLabel(medalTier, language)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-sage-700">{selectedAchievement.detail}</p>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-[18px] bg-white p-3 ring-1 ring-sage-100">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">{copy.current}</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{selectedAchievement.current}</p>
                    </div>
                    <div className="rounded-[18px] bg-white p-3 ring-1 ring-sage-100">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">{copy.baseTarget}</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{selectedAchievement.baseTarget}</p>
                    </div>
                    <div className="rounded-[18px] bg-white p-3 ring-1 ring-sage-100">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sage-500">{copy.nextTarget}</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{nextTarget}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : null}
    </div>
  );
};
