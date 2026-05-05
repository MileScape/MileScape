import { ListChecks } from "lucide-react";
import type { CountryAchievementSet } from "../../data/achievements";
import { getDisplayCountry } from "../../data/achievements";
import { cn } from "../../utils/cn";
import { BadgeHex } from "./AchievementBadges";

type AchievementCopy = {
  badgeList: string;
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

const badgeLayouts = [
  [
    "left-[48%] top-[42%] z-20 -translate-x-1/2 -translate-y-1/2 scale-[0.54] sm:scale-[0.58]",
    "left-[10%] top-[8%] scale-[0.5] sm:scale-[0.54]",
    "right-[16%] top-[-4%] scale-[0.5] sm:scale-[0.54]",
    "right-[28%] bottom-[-18%] scale-[0.48] sm:scale-[0.52]",
    "left-[28%] bottom-[-8%] scale-[0.48] sm:scale-[0.52]"
  ],
  [
    "left-[44%] top-[50%] z-20 -translate-x-1/2 -translate-y-1/2 scale-[0.54] sm:scale-[0.58]",
    "left-[18%] top-[-2%] scale-[0.5] sm:scale-[0.54]",
    "right-[12%] top-[14%] scale-[0.5] sm:scale-[0.54]",
    "right-[34%] bottom-[-16%] scale-[0.48] sm:scale-[0.52]",
    "left-[8%] bottom-[-2%] scale-[0.48] sm:scale-[0.52]"
  ],
  [
    "left-[54%] top-[44%] z-20 -translate-x-1/2 -translate-y-1/2 scale-[0.54] sm:scale-[0.58]",
    "left-[14%] top-[18%] scale-[0.5] sm:scale-[0.54]",
    "right-[22%] top-[-10%] scale-[0.5] sm:scale-[0.54]",
    "right-[12%] bottom-[-10%] scale-[0.48] sm:scale-[0.52]",
    "left-[32%] bottom-[-20%] scale-[0.48] sm:scale-[0.52]"
  ],
  [
    "left-[50%] top-[48%] z-20 -translate-x-1/2 -translate-y-1/2 scale-[0.54] sm:scale-[0.58]",
    "left-[24%] top-[-8%] scale-[0.5] sm:scale-[0.54]",
    "right-[10%] top-[2%] scale-[0.5] sm:scale-[0.54]",
    "right-[26%] bottom-[-22%] scale-[0.48] sm:scale-[0.52]",
    "left-[12%] bottom-[-10%] scale-[0.48] sm:scale-[0.52]"
  ]
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
  const badgeLayout = badgeLayouts[index % badgeLayouts.length];

  return (
    <article
      onClick={() => {
        if (!active) {
          onSelect();
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
      className="relative mx-auto h-[178px] w-full max-w-[350px] transform-gpu overflow-hidden opacity-100 saturate-100 transition-all duration-500 ease-out will-change-transform sm:h-[184px]"
      style={{
        pointerEvents: active ? "auto" : "none",
        zIndex: active ? 20 : 10
      }}
    >
      <div
        className={cn(
          "transform-gpu overflow-hidden rounded-[8px] bg-white/96 ring-1 ring-sage-100 transition-all duration-500 ease-out will-change-transform",
          "h-full",
          active
            ? "border-2 border-[#f2a51a] shadow-[0_24px_58px_rgba(17,31,22,0.2)] ring-2 ring-[#f2a51a]/30"
            : "shadow-[0_10px_28px_rgba(17,31,22,0.1)]",

          set.unlocked ? "opacity-100" : "opacity-90"
        )}
      >
        <div
          className={cn(
            "relative h-full bg-gradient-to-r p-3 pt-5 transition-all duration-500 ease-out",
            palette[index % palette.length]
          )}
        >
          <div className="relative z-20 flex items-start gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/76 shadow-sm ring-1 ring-white/80 sm:h-9 sm:w-9">
                <img
                  src={set.countryImage}
                  alt=""
                  className={cn(
                    "h-5 w-5 object-contain sm:h-6 sm:w-6",
                    set.unlocked ? "opacity-100" : "opacity-55 grayscale"
                  )}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold leading-tight text-ink sm:text-lg">
                  {getDisplayCountry(set.country, language)}
                </p>
                <div className="mt-1.5 h-1.5 w-44 overflow-hidden rounded-full bg-white/70 ring-1 ring-white/70 sm:w-52">
                  <div className="h-full rounded-full bg-sage-600" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-500">
                  {set.routes.length} {copy.routes}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-3 bottom-8 top-[72px]">
            {set.assets.slice(0, 5).map((asset, assetIndex) => (
              <div
                key={asset.id}
                className={cn(
                  "absolute",
                  badgeLayout[assetIndex]
                )}
              >
                <BadgeHex asset={asset} index={assetIndex} featured={assetIndex === 0} />
              </div>
            ))}
          </div>

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
            className="absolute bottom-2 right-3 z-30 inline-flex w-fit items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#f2a51a] px-3 py-1.5 text-[11px] font-semibold text-ink shadow-[0_8px_16px_rgba(242,165,26,0.24)] transition active:scale-[0.98] sm:text-xs"
          >
            <ListChecks className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {copy.badgeList}
          </button>
        </div>
      </div>
    </article>
  );
};
