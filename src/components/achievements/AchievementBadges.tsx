import { Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BadgeAsset, CountryAchievementSet } from "../../data/achievements";
import {
  badgeMedalStyles,
  fallbackBadgeImage,
  getBadgeMedalTier
} from "../../data/achievements";
import { cn } from "../../utils/cn";

type BadgeShape = "crest" | "hex" | "round" | "stamp" | "tag" | "ticket";

const ticketClipPath = "polygon(10% 0%,90% 0%,100% 10%,100% 38%,94% 50%,100% 62%,100% 90%,90% 100%,10% 100%,0% 90%,0% 62%,6% 50%,0% 38%,0% 10%)";
const tagClipPath = "polygon(12% 0%,88% 0%,100% 14%,100% 86%,88% 100%,12% 100%,0% 86%,0% 14%)";
const crestClipPath = "polygon(50% 0%,92% 20%,82% 100%,18% 100%,8% 20%)";

const getBadgeShape = (asset: BadgeAsset, index: number): BadgeShape => {
  if (asset.id.endsWith("-finish")) {
    return "stamp";
  }

  if (asset.id.includes("food") || asset.id.includes("collection")) {
    return "crest";
  }

  if (asset.id.includes("clothing") || asset.id.includes("buildings")) {
    return "tag";
  }

  if (asset.id.endsWith("-landmarks")) {
    return "round";
  }

  if (asset.id.includes("animals") || asset.id.includes("historical")) {
    return "ticket";
  }

  return index % 3 === 0 ? "round" : "hex";
};

export const getBadgeSilhouetteStyle = (asset: BadgeAsset, index: number) => {
  const shape = getBadgeShape(asset, index);

  if (shape === "round" || shape === "stamp") {
    return {};
  }

  if (shape === "ticket") {
    return { clipPath: ticketClipPath };
  }

  if (shape === "tag") {
    return { clipPath: tagClipPath };
  }

  if (shape === "crest") {
    return { clipPath: crestClipPath };
  }

  return { clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)" };
};

export const isBadgeRoundSilhouette = (asset: BadgeAsset, index: number) => {
  const shape = getBadgeShape(asset, index);
  return shape === "round" || shape === "stamp";
};

export const getBadgeMedalClassNames = (asset: BadgeAsset) => {
  const medalTier = asset.unlocked ? getBadgeMedalTier(asset.unlockCount) : "locked";
  const medalStyle = badgeMedalStyles[medalTier];

  return {
    base: medalStyle.base,
    inner: medalStyle.inner,
    shine: medalStyle.shine,
    state: asset.unlocked ? "opacity-100" : "opacity-45 grayscale"
  };
};

export const BadgeHex = ({
  asset,
  index,
  featured = false,
  detail = false,
  straight = false
}: {
  asset: BadgeAsset;
  index: number;
  featured?: boolean;
  detail?: boolean;
  straight?: boolean;
}) => {
  const medalTier = asset.unlocked ? getBadgeMedalTier(asset.unlockCount) : "locked";
  const medalStyle = badgeMedalStyles[medalTier];
  const shape = getBadgeShape(asset, index);
  const sizeClass = detail ? "h-64 w-64" : featured ? "h-28 w-28" : "h-16 w-16";
  const imageSizeClass = detail ? "h-44 w-44" : featured ? "h-20 w-20" : "h-10 w-10";
  const shapeRotation = straight ? "0deg" : index % 2 === 0 ? "-4deg" : "5deg";
  const sharedImage = (
    <img
      src={asset.image}
      alt=""
      className={cn("object-contain drop-shadow-[0_8px_10px_rgba(17,31,22,0.18)]", imageSizeClass)}
      onError={(event) => {
        event.currentTarget.src = fallbackBadgeImage;
      }}
    />
  );
  const lockOverlay = !asset.unlocked ? (
    <div className="absolute inset-0 flex items-center justify-center bg-ink/18">
      <Lock className="h-4 w-4 text-white drop-shadow" />
    </div>
  ) : null;
  const paperGrain = (
    <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light [background-image:radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.75)_0_1px,transparent_1px),radial-gradient(circle_at_70%_65%,rgba(17,31,22,0.2)_0_1px,transparent_1px)] [background-size:12px_12px,17px_17px]" />
  );

  if (shape === "round") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br p-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_-3px_8px_rgba(17,31,22,0.28),0_12px_22px_rgba(17,31,22,0.2)]",
          medalStyle.base,
          sizeClass,
          asset.unlocked ? "opacity-100" : "opacity-45 grayscale",
        )}
        style={{ transform: `rotate(${shapeRotation})` }}
      >
        {paperGrain}
        <div className="pointer-events-none absolute inset-[2px] rounded-full border border-white/55 shadow-[inset_0_0_0_1px_rgba(17,31,22,0.14)]" />
        <div className="pointer-events-none absolute inset-[8px] rounded-full border border-dashed border-white/48" />
        <div className="pointer-events-none absolute left-3 top-3 h-2 w-2 rounded-full bg-white/68 shadow-[0_0_12px_rgba(255,255,255,0.75)]" />
        <div className="pointer-events-none absolute bottom-4 right-4 h-1.5 w-1.5 rounded-full bg-[#567b72]/26" />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.82)_28%,transparent_48%,rgba(255,255,255,0.36)_68%,transparent_100%)]",
            medalStyle.shine
          )}
        />
        <div
          className={cn(
            "relative flex h-full w-full items-center justify-center rounded-full p-2 shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),inset_0_-5px_10px_rgba(17,31,22,0.1)]",
            medalStyle.inner
          )}
        >
          {sharedImage}
        </div>
        {lockOverlay}
      </div>
    );
  }

  if (shape === "ticket") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br p-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),inset_0_0_0_1px_rgba(255,255,255,0.44),0_12px_22px_rgba(17,31,22,0.2)]",
          medalStyle.base,
          sizeClass,
          asset.unlocked ? "opacity-100" : "opacity-45 grayscale",
        )}
        style={{
          clipPath: ticketClipPath,
          transform: `rotate(${straight ? "0deg" : index % 2 === 0 ? "-6deg" : "7deg"})`
        }}
      >
        {paperGrain}
        <div
          className="pointer-events-none absolute inset-[2px] border border-white/60"
          style={{ clipPath: ticketClipPath }}
        />
        <div className="pointer-events-none absolute left-[11%] top-[16%] h-[68%] border-l border-dashed border-white/50" />
        <div className="pointer-events-none absolute right-[11%] top-[16%] h-[68%] border-l border-dashed border-[#567b72]/20" />
        <div className="pointer-events-none absolute left-[18%] top-3 h-1.5 w-1.5 rounded-full bg-white/70" />
        <div className="pointer-events-none absolute right-[18%] bottom-3 h-1.5 w-1.5 rounded-full bg-[#567b72]/24" />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.78)_24%,transparent_44%,rgba(255,255,255,0.28)_72%,transparent_100%)]",
            medalStyle.shine
          )}
        />
        <div
          className={cn(
            "relative flex h-full w-full items-center justify-center p-2 shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),inset_0_-5px_10px_rgba(17,31,22,0.1)]",
            medalStyle.inner
          )}
          style={{ clipPath: ticketClipPath }}
        >
          {sharedImage}
        </div>
        {lockOverlay}
      </div>
    );
  }

  if (shape === "tag" || shape === "crest") {
    const clipPath = shape === "tag" ? tagClipPath : crestClipPath;
    const rotation = straight ? "0deg" : shape === "tag" ? (index % 2 === 0 ? "5deg" : "-4deg") : (index % 2 === 0 ? "-7deg" : "8deg");

    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br p-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-4px_12px_rgba(17,31,22,0.22),0_14px_24px_rgba(17,31,22,0.2)]",
          medalStyle.base,
          sizeClass,
          asset.unlocked ? "opacity-100" : "opacity-45 grayscale",
        )}
        style={{ clipPath, transform: `rotate(${rotation})` }}
      >
        {paperGrain}
        <div
          className="pointer-events-none absolute inset-[3px] border border-white/58"
          style={{ clipPath }}
        />
        <div
          className="pointer-events-none absolute inset-[10px] border border-dashed border-[#567b72]/20"
          style={{ clipPath }}
        />
        {shape === "tag" ? (
          <>
            <div className="pointer-events-none absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-[#f8f4e8]/70 shadow-[inset_0_0_0_1px_rgba(86,123,114,0.2)]" />
            <div className="pointer-events-none absolute right-3 bottom-3 h-8 w-8 rounded-full border border-dashed border-white/38" />
            <div className="pointer-events-none absolute bottom-4 left-1/2 h-[3px] w-14 -translate-x-1/2 rounded-full bg-[#567b72]/18" />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute left-1/2 top-2 h-5 w-10 -translate-x-1/2 rounded-full bg-white/28 blur-[1px]" />
            <div className="pointer-events-none absolute bottom-2 left-1/2 h-[3px] w-12 -translate-x-1/2 rounded-full bg-[#567b72]/20" />
          </>
        )}
        <div
          className={cn(
            "relative flex h-full w-full items-center justify-center p-2 shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),inset_0_-5px_10px_rgba(17,31,22,0.1)]",
            medalStyle.inner
          )}
          style={{ clipPath }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.62),transparent_62%)]" />
          {sharedImage}
        </div>
        {lockOverlay}
      </div>
    );
  }

  if (shape === "stamp") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 border-dashed border-[#567b72]/42 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(139,169,157,0.06)_58%,rgba(86,123,114,0.12)_100%)] shadow-[0_8px_18px_rgba(17,31,22,0.08)] backdrop-blur-[1px]",
          sizeClass,
          asset.unlocked ? "opacity-100" : "opacity-45 grayscale",
        )}
        style={{ transform: `rotate(${straight ? "0deg" : index % 2 === 0 ? "-11deg" : "9deg"})` }}
      >
        {paperGrain}
        <div className="pointer-events-none absolute inset-[5px] rounded-full border-2 border-[#567b72]/26" />
        <div className="pointer-events-none absolute inset-[13px] rounded-full border border-[#567b72]/22" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[76%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#567b72]/14" />
        <div className="pointer-events-none absolute left-[17%] top-[19%] h-1.5 w-8 rotate-[16deg] rounded-full bg-[#567b72]/18" />
        <div className="pointer-events-none absolute bottom-[19%] right-[16%] h-1.5 w-9 rotate-[14deg] rounded-full bg-[#567b72]/16" />
        <div className="pointer-events-none absolute inset-[23%] rounded-full bg-[#567b72]/[0.06]" />
        <div className="relative flex h-[68%] w-[68%] items-center justify-center rounded-full p-2">
          <div className="opacity-72 mix-blend-multiply">
            {sharedImage}
          </div>
        </div>
        {lockOverlay}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br p-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_0_0_1px_rgba(255,255,255,0.5),inset_0_-3px_8px_rgba(17,31,22,0.28),0_12px_22px_rgba(17,31,22,0.2)]",
        medalStyle.base,
        sizeClass,
        asset.unlocked ? "opacity-100" : "opacity-45 grayscale",
      )}
      style={{
        clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)",
        transform: `rotate(${shapeRotation})`
      }}
    >
      {paperGrain}
      <div
        className="pointer-events-none absolute inset-[2px] border border-white/55 shadow-[inset_0_0_0_1px_rgba(17,31,22,0.14)]"
        style={{ clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)" }}
      />
      <div
        className="pointer-events-none absolute inset-[9px] border border-dashed border-white/42"
        style={{ clipPath: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)" }}
      />
      <div className="pointer-events-none absolute left-[18%] top-[18%] h-1.5 w-1.5 rounded-full bg-white/72" />
      <div className="pointer-events-none absolute right-[18%] bottom-[18%] h-1.5 w-1.5 rounded-full bg-[#567b72]/26" />
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
        {sharedImage}
      </div>
      {lockOverlay}
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
