import { Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

export const CalendarMedalIcon = ({
  asset,
  days,
  startLabel,
  startCaption,
  daysCaption
}: {
  asset: BadgeAsset;
  days: number;
  startLabel: string;
  startCaption: string;
  daysCaption: string;
}) => {
  const [rotation, setRotation] = useState({ x: -8, y: 0 });
  const dragRef = useRef({
    active: false,
    baseX: -8,
    baseY: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
    pointerX: 0,
    pointerY: 0,
    velocityX: 0,
    velocityY: 0
  });
  const inertiaFrameRef = useRef<number | null>(null);
  const stopInertia = () => {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  };
  const startInertia = () => {
    stopInertia();

    let velocityX = dragRef.current.velocityX;
    let velocityY = dragRef.current.velocityY;

    if (Math.abs(velocityX) + Math.abs(velocityY) < 0.012) {
      return;
    }

    let lastTime = performance.now();

    const tick = (time: number) => {
      const elapsed = Math.min(34, time - lastTime);
      lastTime = time;

      velocityX *= Math.pow(0.93, elapsed / 16);
      velocityY *= Math.pow(0.93, elapsed / 16);

      setRotation((currentRotation) => {
        const nextX = Math.max(-38, Math.min(38, currentRotation.x + velocityX * elapsed));

        if (nextX === -38 || nextX === 38) {
          velocityX = 0;
        }

        return {
          x: nextX,
          y: currentRotation.y + velocityY * elapsed
        };
      });

      if (Math.abs(velocityX) + Math.abs(velocityY) > 0.01) {
        inertiaFrameRef.current = requestAnimationFrame(tick);
      } else {
        inertiaFrameRef.current = null;
      }
    };

    inertiaFrameRef.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => stopInertia(), []);
  const handleSpin = () => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }

    stopInertia();
    setRotation((currentRotation) => ({
      x: currentRotation.x,
      y: currentRotation.y + 360
    }));
  };

  return (
    <button
      type="button"
      aria-label={`${asset.name}: ${startLabel}, ${days} ${daysCaption}`}
      onClick={handleSpin}
      onPointerDown={(event) => {
        stopInertia();
        dragRef.current.active = true;
        dragRef.current.baseX = rotation.x;
        dragRef.current.baseY = rotation.y;
        dragRef.current.lastTime = performance.now();
        dragRef.current.lastX = event.clientX;
        dragRef.current.lastY = event.clientY;
        dragRef.current.moved = false;
        dragRef.current.pointerX = event.clientX;
        dragRef.current.pointerY = event.clientY;
        dragRef.current.velocityX = 0;
        dragRef.current.velocityY = 0;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!dragRef.current.active) {
          return;
        }

        const deltaX = event.clientX - dragRef.current.pointerX;
        const deltaY = event.clientY - dragRef.current.pointerY;
        const now = performance.now();
        const elapsed = Math.max(1, now - dragRef.current.lastTime);
        const moveX = event.clientX - dragRef.current.lastX;
        const moveY = event.clientY - dragRef.current.lastY;

        if (Math.abs(deltaX) + Math.abs(deltaY) > 3) {
          dragRef.current.moved = true;
        }

        dragRef.current.velocityX = dragRef.current.velocityX * 0.58 + ((-moveY * 0.35) / elapsed) * 0.42;
        dragRef.current.velocityY = dragRef.current.velocityY * 0.58 + ((moveX * 0.55) / elapsed) * 0.42;
        dragRef.current.lastTime = now;
        dragRef.current.lastX = event.clientX;
        dragRef.current.lastY = event.clientY;

        setRotation({
          x: Math.max(-38, Math.min(38, dragRef.current.baseX - deltaY * 0.35)),
          y: dragRef.current.baseY + deltaX * 0.55
        });
      }}
      onPointerUp={(event) => {
        const hadMomentum = dragRef.current.moved;
        dragRef.current.active = false;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }

        if (hadMomentum) {
          startInertia();
        }
      }}
      onPointerCancel={(event) => {
        dragRef.current.active = false;
        dragRef.current.velocityX = 0;
        dragRef.current.velocityY = 0;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      className="relative isolate h-56 w-48 touch-none overflow-hidden appearance-none border-0 bg-transparent p-0 outline-none [perspective:900px]"
    >
      <div
        className={cn(
          "absolute left-1/2 top-[30px] z-20 flex h-36 w-36 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full bg-[conic-gradient(from_220deg,#d8b66d,#fbf3df,#8fb7aa,#4f766d,#d8b66d)] p-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-7px_14px_rgba(17,31,22,0.24),0_18px_34px_rgba(17,31,22,0.18)] transition-transform duration-300 ease-out [transform-style:preserve-3d]",
          asset.unlocked ? "opacity-100" : "opacity-45 grayscale"
        )}
        style={{
          transform: `translateX(-50%) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
        }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_18%,rgba(255,251,238,0.95),transparent_24%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.5)_30%,transparent_52%,rgba(255,250,232,0.28)_76%,transparent_100%)]" />
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#f8f4e8] shadow-[inset_0_2px_5px_rgba(255,255,255,0.82),inset_0_-8px_16px_rgba(17,31,22,0.11)]">
          <div
            className="absolute inset-0 bg-[linear-gradient(145deg,#fff7e8,#eaf2eb_58%,#d9e7de)]"
            style={{ clipPath: "polygon(0 0, 69% 0, 39% 100%, 0 100%)" }}
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(145deg,#789f93,#567b72_58%,#d7b978)]"
            style={{ clipPath: "polygon(69% 0, 100% 0, 100% 100%, 39% 100%)" }}
          />
          <div className="pointer-events-none absolute right-5 top-4 h-12 w-3 rotate-45 rounded-full bg-white/45 blur-[2px]" />
          <div className="pointer-events-none absolute bottom-7 left-7 h-3 w-12 -rotate-12 rounded-full bg-[#fff6d4]/24 blur-sm" />

          <div className="absolute left-[16px] top-[30px] flex w-[74px] flex-col items-start text-left">
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#647b70]">
              {startCaption}
            </span>
            <span className="mt-1 text-[13px] font-semibold leading-tight text-ink">
              {startLabel}
            </span>
          </div>

          <div className="absolute right-[18px] top-[67px] flex w-[68px] flex-col items-end text-right">
            <span className="text-[2.05rem] font-semibold leading-none text-[#fff8e8] drop-shadow-[0_2px_5px_rgba(17,31,22,0.32)]">
              {days}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#f4deb1]">
              {daysCaption}
            </span>
          </div>
        </div>
      </div>
    </button>
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
