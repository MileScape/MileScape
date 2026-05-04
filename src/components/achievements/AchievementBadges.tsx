import { Lock } from "lucide-react";
import type { BadgeAsset, CountryAchievementSet } from "../../data/achievements";
import {
  badgeMedalStyles,
  fallbackBadgeImage,
  getBadgeMedalTier
} from "../../data/achievements";
import { cn } from "../../utils/cn";

export const BadgeHex = ({
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

export const BadgeCluster = ({ assets }: { assets: BadgeAsset[] }) => {
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

export const CalendarMedalIcon = ({ asset }: { asset: BadgeAsset }) => {
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

export const CountryPrizeBadge = ({ set }: { set: CountryAchievementSet }) => (
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
