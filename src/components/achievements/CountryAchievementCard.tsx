import { ListChecks } from "lucide-react";
import type { CountryAchievementSet } from "../../data/achievements";
import { getDisplayCountry } from "../../data/achievements";
import { cn } from "../../utils/cn";
import { BadgeCluster, CountryPrizeBadge } from "./AchievementBadges";

type AchievementCopy = {
  badgeList: string;
  details: string;
  countryPrize: string;
  progress: string;
  routes: string;
};

const palette = [
  "from-[#f2eee2] via-white to-[#d7e2d0]",
  "from-[#eee3d1] via-white to-[#d6dde8]",
  "from-[#e9efe6] via-white to-[#ead9cb]",
  "from-[#e5e2d8] via-white to-[#d8e5e2]"
];

export const CountryAchievementCard = ({
  set,
  index,
  copy,
  language,
  active,
  onOpen,
  onSelect
}: {
  set: CountryAchievementSet;
  index: number;
  copy: AchievementCopy;
  language: "en" | "zh";
  active: boolean;
  onOpen: (country: string) => void;
  onSelect: () => void;
}) => {
  const progressPercent = set.assets.length > 0
    ? Math.round((set.unlockedCount / set.assets.length) * 100)
    : 0;

  return (
    <article
      onClick={() => {
        if (!active) {
          onSelect();
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
      className="relative min-h-[330px] transform-gpu overflow-hidden opacity-100 saturate-100 transition-all duration-500 ease-out will-change-transform"
      style={{
        pointerEvents: active ? "auto" : "none",
        zIndex: active ? 20 : 10
      }}
    >
      <div
        className={cn(
          "transform-gpu overflow-hidden rounded-[8px] bg-white/96 ring-1 ring-sage-100 transition-all duration-500 ease-out will-change-transform",
          "min-h-[310px]",
          active
            ? "shadow-[0_24px_58px_rgba(17,31,22,0.2)] ring-sage-200"
            : "shadow-[0_10px_28px_rgba(17,31,22,0.1)]",

          set.unlocked ? "opacity-100" : "opacity-90"
        )}
      >
        <div
          className={cn(
            "grid bg-gradient-to-r transition-all duration-500 ease-out",
            "min-h-[310px] grid-cols-1 md:grid-cols-[0.75fr_1.1fr_0.95fr]",
            palette[index % palette.length]
          )}
        >
          <div
            className={cn(
              "relative flex flex-col overflow-hidden p-5 transition-all duration-500 ease-out",
              "min-h-[190px] justify-end"
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">
              {set.routes.length} {copy.routes}
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-ink transition-all duration-500 ease-out">
              {getDisplayCountry(set.country, language)}
            </h2>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-sage-500">
              {copy.countryPrize}
            </p>
          </div>

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
                onPointerUp={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                onTouchEnd={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(set.country);
                }}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f2a51a] px-5 py-3 text-sm font-semibold text-ink shadow-[0_10px_20px_rgba(242,165,26,0.24)] transition active:scale-[0.98]"
              >
                <ListChecks className="h-5 w-5" />
                {copy.badgeList}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
