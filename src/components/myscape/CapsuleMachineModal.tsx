import { AnimatePresence, motion } from "framer-motion";
import {
  CircleHelp,
  Flower2,
  Gem,
  Paintbrush,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sunset,
  Ticket,
  TreePine,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  type CapsuleAtmosphereEffect,
  type CapsuleDecorationDrawPrize,
  type CapsuleDecorationPrize,
  type CapsuleDrawResult,
  type CapsuleRouteTicketPrize,
  useCapsuleLogic,
} from "../../hooks/useCapsuleLogic";
import type { Route } from "../../types";
import { cn } from "../../utils/cn";

type CapsuleTab = "machine" | "shop";
type DrawPhase = "idle" | "mixing" | "dispensing" | "opening" | "result";

export interface CapsuleMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFragments?: number;
  unlockedRouteIds?: string[];
  ownedAtmosphereEffectIds?: string[];
  routes?: Route[];
  decorations?: CapsuleDecorationPrize[];
  atmosphereEffects?: CapsuleAtmosphereEffect[];
  drawCostLabel?: string;
  isDrawDisabled?: boolean;
  drawDisabledReason?: string;
  onDrawResult?: (result: CapsuleDrawResult) => void;
  onRouteTicketWon?: (route: Route, result: CapsuleRouteTicketPrize) => void;
  onDecorationWon?: (decoration: CapsuleDecorationPrize, result: CapsuleDecorationDrawPrize) => void;
  onFragmentsGained?: (fragments: number, result: CapsuleRouteTicketPrize) => void;
  onExchangeAtmosphereEffect?: (effect: CapsuleAtmosphereEffect) => void;
}

const tabs: Array<{ key: CapsuleTab; label: string; icon: LucideIcon }> = [
  { key: "machine", label: "Capsule", icon: Sparkles },
  { key: "shop", label: "Shop", icon: ShoppingBag },
];

const tierPillClass: Record<string, string> = {
  Starter: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Standard: "bg-sky-100 text-sky-800 ring-sky-200",
  Advanced: "bg-amber-100 text-amber-800 ring-amber-200",
  Premium: "bg-rose-100 text-rose-800 ring-rose-200",
};

const rarityPillClass: Record<string, string> = {
  common: "bg-stone-100 text-stone-700 ring-stone-200",
  rare: "bg-sky-100 text-sky-800 ring-sky-200",
  epic: "bg-violet-100 text-violet-800 ring-violet-200",
  legendary: "bg-amber-100 text-amber-800 ring-amber-200",
};

const effectIconById: Record<string, LucideIcon> = {
  snowfall: Snowflake,
  "dusk-skybox": Sunset,
  "sakura-fall": Flower2,
  "custom-turf": Paintbrush,
};

interface GlobeCapsuleItem {
  x: number;
  y: number;
  size: number;
  styleIndex: number;
  delay: number;
  driftX: number;
  driftY: number;
  mixX: number;
  mixY: number;
  rotate: number;
  zIndex: number;
}

interface CapsuleShellStyle {
  topClass: string;
  bottomClass: string;
  accentClass: string;
  accentType: "dot" | "band" | "double";
}

const capsuleShellStyles: CapsuleShellStyle[] = [
  {
    topClass: "bg-[linear-gradient(180deg,#fff1ad_0%,#f4d56c_100%)]",
    bottomClass: "bg-[linear-gradient(180deg,#de8550_0%,#903a31_100%)]",
    accentClass: "bg-[#fff2cf]",
    accentType: "dot",
  },
  {
    topClass: "bg-[linear-gradient(180deg,#eef7ff_0%,#c8daf6_100%)]",
    bottomClass: "bg-[linear-gradient(180deg,#d7a2c4_0%,#875d81_100%)]",
    accentClass: "bg-[#f8f8ff]",
    accentType: "band",
  },
  {
    topClass: "bg-[linear-gradient(180deg,#fbfde8_0%,#d7e6a2_100%)]",
    bottomClass: "bg-[linear-gradient(180deg,#f2c287_0%,#8d6949_100%)]",
    accentClass: "bg-[#fff7d5]",
    accentType: "dot",
  },
  {
    topClass: "bg-[linear-gradient(180deg,#fff5ea_0%,#f2cdb6_100%)]",
    bottomClass: "bg-[linear-gradient(180deg,#c8dde0_0%,#698790_100%)]",
    accentClass: "bg-[#fefaf3]",
    accentType: "double",
  },
  {
    topClass: "bg-[linear-gradient(180deg,#f9f4ff_0%,#dccdf2_100%)]",
    bottomClass: "bg-[linear-gradient(180deg,#f0bcc9_0%,#9b6f7b_100%)]",
    accentClass: "bg-[#fff4f7]",
    accentType: "band",
  },
  {
    topClass: "bg-[linear-gradient(180deg,#f6fff9_0%,#cce5d4_100%)]",
    bottomClass: "bg-[linear-gradient(180deg,#eccf87_0%,#71896f_100%)]",
    accentClass: "bg-[#fbf2c9]",
    accentType: "dot",
  },
] as const;

const globeCapsules: GlobeCapsuleItem[] = [
  { x: 26, y: 103, size: 28, styleIndex: 0, delay: 0.03, driftX: -1.7, driftY: 1.2, mixX: 28, mixY: -22, rotate: -23, zIndex: 8 },
  { x: 50, y: 114, size: 25, styleIndex: 4, delay: 0.19, driftX: 1.2, driftY: 1.5, mixX: -31, mixY: -13, rotate: 17, zIndex: 9 },
  { x: 77, y: 101, size: 30, styleIndex: 5, delay: 0.08, driftX: -1.4, driftY: 1.7, mixX: 21, mixY: 27, rotate: -5, zIndex: 11 },
  { x: 105, y: 113, size: 24, styleIndex: 1, delay: 0.27, driftX: 1.8, driftY: 1.1, mixX: -26, mixY: 23, rotate: 31, zIndex: 7 },
  { x: 121, y: 91, size: 23, styleIndex: 3, delay: 0.12, driftX: -1.1, driftY: 0.9, mixX: -33, mixY: -19, rotate: -14, zIndex: 5 },
  { x: 38, y: 82, size: 23, styleIndex: 2, delay: 0.34, driftX: 1.5, driftY: 1, mixX: 34, mixY: 8, rotate: 26, zIndex: 6 },
  { x: 66, y: 83, size: 26, styleIndex: 1, delay: 0.15, driftX: -1, driftY: 1.3, mixX: -20, mixY: -31, rotate: -35, zIndex: 10 },
  { x: 95, y: 75, size: 27, styleIndex: 0, delay: 0, driftX: 1.4, driftY: 1.4, mixX: 25, mixY: -27, rotate: 9, zIndex: 9 },
  { x: 113, y: 62, size: 21, styleIndex: 4, delay: 0.23, driftX: -1.6, driftY: 1, mixX: -18, mixY: 34, rotate: -28, zIndex: 4 },
  { x: 43, y: 54, size: 22, styleIndex: 3, delay: 0.29, driftX: 1, driftY: 0.8, mixX: 29, mixY: 24, rotate: 12, zIndex: 3 },
  { x: 72, y: 53, size: 24, styleIndex: 2, delay: 0.1, driftX: -1.8, driftY: 0.9, mixX: -32, mixY: 7, rotate: -10, zIndex: 6 },
  { x: 98, y: 38, size: 22, styleIndex: 5, delay: 0.37, driftX: 1.3, driftY: 0.8, mixX: 14, mixY: 34, rotate: 38, zIndex: 2 },
  { x: 70, y: 29, size: 20, styleIndex: 0, delay: 0.21, driftX: -1, driftY: 0.7, mixX: 33, mixY: -4, rotate: -18, zIndex: 1 },
];

const seededUnit = (seed: number, index: number, salt: number) => {
  const value = Math.sin(seed * 12.9898 + index * 78.233 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
};

const seededSigned = (seed: number, index: number, salt: number) => seededUnit(seed, index, salt) * 2 - 1;

const pickNextCapsuleStyleIndex = (current?: number) => {
  if (capsuleShellStyles.length <= 1) {
    return 0;
  }

  const initialIndex = Math.floor(Math.random() * capsuleShellStyles.length);

  if (initialIndex !== current) {
    return initialIndex;
  }

  return (initialIndex + 1) % capsuleShellStyles.length;
};

const CapsuleShell = ({ styleIndex, className = "" }: { styleIndex: number; className?: string }) => {
  const style = capsuleShellStyles[styleIndex % capsuleShellStyles.length];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full ring-2 ring-white/65 shadow-[0_10px_18px_rgba(75,94,82,0.16)]",
        className,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-[52%]", style.topClass)} />
      <div className={cn("absolute inset-x-0 bottom-0 h-[52%]", style.bottomClass)} />
      <div className="absolute inset-x-[10%] top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/82" />
      <div className="absolute left-[17%] top-[13%] h-[22%] w-[46%] rounded-full bg-white/36 blur-[5px]" />
      <div className="absolute left-[22%] top-[18%] h-[20%] w-[20%] rounded-full bg-white/58 blur-[1px]" />
      {style.accentType === "dot" ? (
        <div className={cn("absolute right-[18%] top-[22%] h-[18%] w-[18%] rounded-full ring-[1.5px] ring-white/45", style.accentClass)} />
      ) : null}
      {style.accentType === "band" ? <div className={cn("absolute inset-x-[16%] top-[22%] h-[10%] rounded-full", style.accentClass)} /> : null}
      {style.accentType === "double" ? (
        <>
          <div className={cn("absolute left-[16%] top-[22%] h-[10%] w-[26%] rounded-full", style.accentClass)} />
          <div className={cn("absolute right-[16%] top-[22%] h-[10%] w-[26%] rounded-full", style.accentClass)} />
        </>
      ) : null}
      <div className="absolute inset-x-[18%] bottom-[14%] h-[14%] rounded-full bg-black/10 blur-[4px]" />
    </div>
  );
};

const GlobeCapsule = ({
  item,
  phase,
  index,
  mixSeed,
}: {
  item: GlobeCapsuleItem;
  phase: DrawPhase;
  index: number;
  mixSeed: number;
}) => {
  const isMixing = phase === "mixing";
  const nudgeX = item.mixX * 0.28 + seededSigned(mixSeed, index, 1) * 5;
  const nudgeY = item.mixY * 0.22 + seededSigned(mixSeed, index, 2) * 5;
  const knockX = -item.mixY * (0.16 + seededUnit(mixSeed, index, 3) * 0.12);
  const knockY = item.mixX * (0.12 + seededUnit(mixSeed, index, 4) * 0.12);
  const settleX = seededSigned(mixSeed, index, 5) * 4;
  const settleY = seededSigned(mixSeed, index, 6) * 3;
  const spin = 24 + seededUnit(mixSeed, index, 7) * 52;
  const mixDuration = 1.12 + seededUnit(mixSeed, index, 8) * 0.26;
  const mixDelay = seededUnit(mixSeed, index, 9) * 0.16;

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: item.x,
        top: item.y,
        width: item.size,
        height: item.size,
        zIndex: item.zIndex,
      }}
      initial={false}
      animate={
        isMixing
          ? {
              x: [0, nudgeX, knockX, nudgeX * -0.42, settleX, 0],
              y: [0, nudgeY, knockY, nudgeY * -0.35, settleY, 0],
              rotate: [
                item.rotate,
                item.rotate + spin,
                item.rotate - spin * 0.36,
                item.rotate + spin * 0.58,
                item.rotate - spin * 0.18,
                item.rotate,
              ],
              scale: [1, 1.035 + seededUnit(mixSeed, index, 12) * 0.025, 0.97, 1.028, 0.99, 1],
            }
          : {
              x: [0, item.driftX, 0, -item.driftX * 0.6, 0],
              y: [0, -item.driftY, 0, item.driftY * 0.5, 0],
              rotate: [item.rotate, item.rotate + 3, item.rotate - 2, item.rotate + 1, item.rotate],
              scale: [1, 1.012, 0.996, 1.008, 1],
            }
      }
      transition={
        isMixing
          ? { duration: mixDuration, ease: [0.34, 0.8, 0.28, 1], delay: mixDelay }
          : { duration: 4.4 + index * 0.14, repeat: Infinity, ease: "easeInOut", delay: item.delay }
      }
    >
      <CapsuleShell styleIndex={item.styleIndex} className="h-full w-full" />
    </motion.div>
  );
};

const CapsuleMachineVisual = ({
  phase,
  activeCapsuleStyleIndex,
  mixSeed,
  compact = false,
}: {
  phase: DrawPhase;
  activeCapsuleStyleIndex: number;
  mixSeed: number;
  compact?: boolean;
}) => {
  const isMixing = phase === "mixing";
  const isDispensing = phase === "dispensing";
  const isOpening = phase === "opening";
  const showResultGlow = phase === "result";
  const mixerRotation = [
    0,
    52 + seededUnit(mixSeed, 0, 20) * 24,
    124 + seededUnit(mixSeed, 1, 20) * 30,
    194 + seededUnit(mixSeed, 2, 20) * 34,
    266 + seededUnit(mixSeed, 3, 20) * 28,
    338 + seededUnit(mixSeed, 4, 20) * 24,
  ];
  const clusterRotation = [
    0,
    -8 + seededSigned(mixSeed, 0, 21) * 7,
    10 + seededSigned(mixSeed, 1, 21) * 8,
    -6 + seededSigned(mixSeed, 2, 21) * 6,
    7 + seededSigned(mixSeed, 3, 21) * 6,
    0,
  ];

  return (
    <div className="relative shrink-0 overflow-hidden rounded-[22px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,240,232,0.98))] px-3 pb-2.5 pt-2.5 shadow-[0_18px_40px_rgba(35,52,40,0.08)]">
      <div className={cn("relative mx-auto w-[232px] transition-[height] duration-300", compact ? "h-[150px]" : "h-[250px]")}>
        <motion.div
          className="absolute left-0 top-0 h-[250px] w-[232px]"
          style={{ transformOrigin: "top center" }}
          initial={false}
          animate={
            isMixing
              ? {
                  x: [0, -0.8, 0.7, -0.4, 0],
                  y: [0, -0.5, 0.4, 0],
                  scale: compact ? [0.6, 0.605, 0.595, 0.6] : [1, 1.005, 0.995, 1],
                }
              : { x: 0, y: 0, scale: compact ? 0.6 : 1 }
          }
          transition={isMixing ? { duration: 1.08, ease: "easeInOut" } : { duration: 0.28, ease: "easeOut" }}
        >
        <div className="absolute left-1/2 top-[2px] h-[162px] w-[162px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(68,87,75,0.16),rgba(68,87,75,0)_66%)] blur-md" />

        <div className="absolute left-1/2 top-[2px] h-[162px] w-[162px] -translate-x-1/2 overflow-hidden rounded-full border border-white/90 bg-[radial-gradient(circle_at_33%_24%,rgba(255,255,255,0.98),rgba(231,237,229,0.8)_56%,rgba(193,211,197,0.76)_100%)] shadow-[inset_0_0_0_11px_rgba(255,255,255,0.54),0_20px_38px_rgba(85,109,96,0.14)]">
          <motion.div
            className="absolute inset-[17px] rounded-full border border-white/45"
            animate={isMixing ? { rotate: mixerRotation } : { rotate: 0 }}
            transition={isMixing ? { duration: 1.35, ease: [0.28, 0.78, 0.2, 1] } : { duration: 0.3 }}
          >
            <div className="absolute left-1/2 top-1/2 h-[102px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/28" />
            <div className="absolute left-1/2 top-1/2 h-[8px] w-[102px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/24" />
            <div className="absolute left-1/2 top-1/2 h-[16px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/54" />
          </motion.div>

          <motion.div
            className="absolute inset-[4px]"
            animate={isMixing ? { rotate: clusterRotation } : { rotate: 0 }}
            transition={isMixing ? { duration: 1.35, ease: [0.34, 0.82, 0.28, 1] } : { duration: 0.32 }}
          >
            {globeCapsules.map((capsule, index) => (
              <GlobeCapsule key={index} item={capsule} phase={phase} index={index} mixSeed={mixSeed} />
            ))}
          </motion.div>

          <div className="absolute inset-[10px] rounded-full border border-white/55 bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,0.5),rgba(255,255,255,0.1)_58%,rgba(255,255,255,0)_100%)]" />
          <div className="absolute left-5 top-4 h-7 w-12 rounded-full bg-white/66 blur-[2px]" />
          <motion.div
            className="absolute inset-x-[24px] bottom-[13px] h-[28px] rounded-full bg-[radial-gradient(circle,rgba(76,99,86,0.18),rgba(76,99,86,0)_74%)] blur-[6px]"
            animate={
              isMixing
                ? {
                    scaleX: [1, 1.18 + seededUnit(mixSeed, 0, 22) * 0.2, 0.82, 1.08, 1],
                    x: [0, -3 - seededUnit(mixSeed, 1, 22) * 4, 4 + seededUnit(mixSeed, 2, 22) * 5, -2, 0],
                  }
                : { scaleX: 1, x: 0 }
            }
            transition={{ duration: 1.16, ease: "easeInOut" }}
          />
        </div>

        <div className="absolute left-1/2 top-[153px] h-[17px] w-[96px] -translate-x-1/2 rounded-[999px] bg-[linear-gradient(180deg,#788d80,#53685c)] shadow-[0_8px_16px_rgba(78,98,88,0.16)]" />
        <div className="absolute left-1/2 top-[164px] h-[12px] w-[72px] -translate-x-1/2 rounded-b-[16px] bg-[linear-gradient(180deg,#e9efe7,#cfdbcf)] ring-1 ring-white/70" />
        <div className="absolute left-[74px] top-[158px] h-[54px] w-[18px] rotate-[8deg] rounded-full border border-white/62 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(232,224,211,0.48))] shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]" />

        <div className="absolute left-1/2 top-[172px] h-[64px] w-[184px] -translate-x-1/2 rounded-[26px] bg-[linear-gradient(180deg,#edf2ec_0%,#e2ebe1_52%,#d3ddd2_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_34px_rgba(78,100,88,0.11)] ring-1 ring-white/75">
          <div className="absolute inset-x-2 bottom-[-5px] h-7 rounded-b-[24px] bg-[linear-gradient(180deg,rgba(186,201,187,0.72),rgba(132,154,139,0.42))]" />
          <div className="absolute inset-x-[14px] top-[10px] h-[44px] rounded-[20px] bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(232,237,229,0.28))] ring-1 ring-white/48" />

          <div className="absolute left-[29px] top-[17px] h-[32px] w-[58px] overflow-hidden rounded-b-[20px] rounded-t-[12px] border border-white/70 bg-[linear-gradient(180deg,#f8f1e7,#e6d9c9)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <motion.div
              className="absolute inset-x-2 top-[7px] h-1.5 rounded-full bg-white/82"
              animate={isDispensing ? { y: [0, 12, 0], opacity: [0.86, 0.42, 0.86] } : { y: 0, opacity: 0.86 }}
              transition={{ duration: 0.48, ease: "easeOut" }}
            />
          </div>
          <div className="absolute left-[38px] top-[41px] h-[9px] w-[40px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(72,87,76,0.18),rgba(72,87,76,0)_72%)] blur-[1px]" />

          <div className="absolute right-[30px] top-[15px] h-10 w-10 rounded-full border border-white/75 bg-[radial-gradient(circle_at_34%_30%,rgba(255,255,255,0.96),rgba(223,231,223,0.84)_70%,rgba(198,211,200,0.76)_100%)] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.55)]" />
          <motion.div
            className="absolute right-[7px] top-[30px] h-[7px] w-[35px] origin-[5px_center] rounded-full bg-[linear-gradient(180deg,#6d8377,#4f6458)] shadow-[0_6px_12px_rgba(66,87,75,0.16)]"
            animate={isMixing ? { rotate: [0, 80, 166, 252, 338, 420] } : { rotate: [0, 7, 0, -7, 0] }}
            transition={isMixing ? { duration: 1.08, ease: "easeInOut" } : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute right-[1px] top-[24px] flex h-[19px] w-[19px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#60796d,#42574b)] text-white shadow-[0_6px_12px_rgba(66,87,75,0.2)]">
            <Sparkles className="h-2.5 w-2.5" />
          </div>
        </div>

        <div className="absolute left-[50px] top-[229px] h-[16px] w-[104px] rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(67,83,72,0.22),rgba(67,83,72,0)_72%)] blur-sm" />
        <div className="absolute left-[58px] top-[226px] h-[18px] w-[92px] rounded-[999px] bg-[linear-gradient(180deg,#f9f1e6,#dfd1bf)] shadow-[inset_0_2px_0_rgba(255,255,255,0.76),0_8px_16px_rgba(78,100,88,0.1)] ring-1 ring-white/70">
          <div className="absolute inset-x-[12px] top-[5px] h-[7px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(92,76,58,0.16),rgba(92,76,58,0)_76%)]" />
        </div>

        <AnimatePresence>
          {isDispensing ? (
            <motion.div
              className="absolute left-[58px] top-[118px] h-10 w-10"
              initial={{ opacity: 0, x: 4, y: 0, scale: 0.62, rotate: -20 }}
              animate={{
                opacity: [0, 1, 1, 1],
                x: [4, -6, 0, 4, 4],
                y: [0, 36, 79, 103, 99],
                scale: [0.62, 0.88, 1.05, 0.96, 1],
                rotate: [-24, 62, -34, 16, 8],
              }}
              exit={{ opacity: 0, y: 101, scale: 0.86 }}
              transition={{ duration: 0.68, ease: [0.24, 0.74, 0.22, 1] }}
            >
              <CapsuleShell styleIndex={activeCapsuleStyleIndex} className="h-10 w-10 shadow-[0_14px_24px_rgba(56,77,66,0.2)]" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isOpening ? (
            <motion.div className="pointer-events-none absolute left-[54px] top-[217px] h-12 w-24">
              <motion.div
                className="absolute left-1/2 top-0 h-10 w-5 -translate-x-[108%] overflow-hidden rounded-l-full"
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{ x: -18, y: -8, rotate: -24, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <CapsuleShell styleIndex={activeCapsuleStyleIndex} className="absolute inset-y-0 right-[-20px] h-10 w-10 shadow-none" />
              </motion.div>
              <motion.div
                className="absolute left-1/2 top-0 h-10 w-5 translate-x-[8%] overflow-hidden rounded-r-full"
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{ x: 18, y: -8, rotate: 24, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <CapsuleShell styleIndex={activeCapsuleStyleIndex} className="absolute inset-y-0 left-[-20px] h-10 w-10 shadow-none" />
              </motion.div>
              <motion.div
                className="absolute left-1/2 top-2 h-14 w-14 -translate-x-1/2 rounded-full bg-amber-200/50 blur-xl"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0], scale: [0.4, 1.15, 1.45] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {Array.from({ length: 10 }, (_, index) => (
                <motion.span
                  key={index}
                  className="absolute left-1/2 top-5 h-1.5 w-6 origin-left rounded-full bg-white/92"
                  style={{ rotate: `${index * 36}deg` }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0], x: [0, 10, 24] }}
                  transition={{ duration: 0.52, delay: index * 0.012 }}
                />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showResultGlow ? (
            <motion.div
              className="pointer-events-none absolute left-[54px] top-[220px] h-10 w-24"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: [0, 1, 0.6], scale: [0.85, 1.08, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="absolute inset-x-2 top-2 h-5 rounded-full bg-amber-100/70 blur-xl" />
              {Array.from({ length: 5 }, (_, index) => (
                <motion.span
                  key={index}
                  className="absolute top-4 h-1.5 w-1.5 rounded-full bg-amber-300/80"
                  style={{ left: `${22 + index * 10}px` }}
                  animate={{ y: [0, -8, 0], opacity: [0.35, 1, 0.35], scale: [0.8, 1.25, 0.8] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.12 }}
                />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

const DuplicateConversion = ({ fragments }: { fragments: number }) => (
  <div className="mt-3 rounded-[18px] bg-amber-50/90 px-3 py-2.5 ring-1 ring-amber-200">
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-[78px] items-center justify-between overflow-hidden">
        <motion.div
          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-[0_8px_16px_rgba(187,128,54,0.12)]"
          animate={{ x: [0, -4, -6], rotate: [0, -8, -14], opacity: [1, 0.85, 0.18], scale: [1, 0.96, 0.82] }}
          transition={{ duration: 0.52 }}
        >
          <Ticket className="h-4.5 w-4.5" />
        </motion.div>
        <div className="absolute left-[34px] top-1/2 h-[1px] w-5 -translate-y-1/2 bg-amber-300" />
        <motion.div
          className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1"
          animate={{ x: [6, 0], opacity: [0, 1], scale: [0.85, 1] }}
          transition={{ duration: 0.42, delay: 0.12 }}
        >
          {Array.from({ length: Math.min(3, Math.max(1, fragments)) }, (_, index) => (
            <Gem key={index} className="h-3.5 w-3.5 text-amber-500" />
          ))}
        </motion.div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-amber-900">Duplicate route</p>
        <p className="text-xs text-amber-700">+{fragments} fragments for effects.</p>
      </div>
    </div>
  </div>
);

const PrizeResultCard = ({ result }: { result: CapsuleDrawResult }) => {
  const isRoute = result.kind === "route_ticket";
  const isDuplicate = isRoute && result.isDuplicate;

  return (
    <motion.div
      key={`${result.kind}-${isRoute ? result.route.id : result.decoration.id}-${isDuplicate ? "duplicate" : "new"}`}
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.94 }}
      className="rounded-[22px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,243,236,0.94))] p-3.5 shadow-[0_18px_36px_rgba(13,20,16,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sage-500">
            {isRoute ? "Route Ticket" : "Decor"}
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-[-0.04em] text-ink">
            {isRoute ? result.route.name : result.decoration.name}
          </h3>
          <p className="mt-1 text-xs text-sage-600">
            {isRoute ? `${result.route.city}, ${result.route.country}` : "Sent to Box"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#44564a] text-white shadow-[0_10px_18px_rgba(68,86,74,0.16)]">
          {isRoute ? <Ticket className="h-4.5 w-4.5" /> : <TreePine className="h-4.5 w-4.5" />}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {isRoute ? (
          <span className={cn("rounded-full px-3 py-1 text-xs font-bold ring-1", tierPillClass[result.tier])}>
            {result.tier}
          </span>
        ) : (
          <span className={cn("rounded-full px-3 py-1 text-xs font-bold capitalize ring-1", rarityPillClass[result.decoration.rarity])}>
            {result.decoration.rarity}
          </span>
        )}
        {isDuplicate ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
            <Gem className="h-3.5 w-3.5" />
            +{result.fragmentsAwarded}
          </span>
        ) : null}
      </div>

      {isDuplicate ? <DuplicateConversion fragments={result.fragmentsAwarded} /> : null}
      {!isDuplicate ? (
        <p className="mt-2.5 text-xs text-sage-500">{isRoute ? "Stored as a route ticket." : "Ready to place from Box."}</p>
      ) : null}
    </motion.div>
  );
};

export const CapsuleMachineModal = ({
  isOpen,
  onClose,
  currentFragments = 0,
  unlockedRouteIds = [],
  ownedAtmosphereEffectIds = [],
  routes,
  decorations,
  atmosphereEffects,
  drawCostLabel,
  isDrawDisabled = false,
  drawDisabledReason,
  onDrawResult,
  onRouteTicketWon,
  onDecorationWon,
  onFragmentsGained,
  onExchangeAtmosphereEffect,
}: CapsuleMachineModalProps) => {
  const [activeTab, setActiveTab] = useState<CapsuleTab>("machine");
  const [drawPhase, setDrawPhase] = useState<DrawPhase>("idle");
  const [drawResult, setDrawResult] = useState<CapsuleDrawResult | null>(null);
  const [activeCapsuleStyleIndex, setActiveCapsuleStyleIndex] = useState(() => pickNextCapsuleStyleIndex());
  const [mixSeed, setMixSeed] = useState(() => Math.random());
  const [exchangeNotice, setExchangeNotice] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const timerRef = useRef<number[]>([]);

  const { routePool, decorationPool, atmosphereEffects: shopEffects, drawCapsule, canExchangeEffect } = useCapsuleLogic({
    routes,
    unlockedRouteIds,
    decorations,
    ownedAtmosphereEffectIds,
    atmosphereEffects,
  });

  const ownedEffectIdSet = useMemo(() => new Set(ownedAtmosphereEffectIds), [ownedAtmosphereEffectIds]);
  const hasCapsuleStock = routePool.length > 0 || decorationPool.length > 0;
  const drawInProgress = drawPhase === "mixing" || drawPhase === "dispensing" || drawPhase === "opening";
  const drawLocked = drawInProgress || isDrawDisabled || !hasCapsuleStock;

  const clearTimers = () => {
    timerRef.current.forEach((timer) => window.clearTimeout(timer));
    timerRef.current = [];
  };

  useEffect(() => {
    if (!isOpen) {
      clearTimers();
      setActiveTab("machine");
      setDrawPhase("idle");
      setDrawResult(null);
      setExchangeNotice(null);
      setShowRules(false);
      return;
    }

    setActiveCapsuleStyleIndex((current) => pickNextCapsuleStyleIndex(current));
    setMixSeed(Math.random());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => () => clearTimers(), []);

  const handleDraw = () => {
    if (drawLocked) {
      return;
    }

    clearTimers();
    setExchangeNotice(null);
    setDrawResult(null);
    setActiveCapsuleStyleIndex((current) => pickNextCapsuleStyleIndex(current));
    setMixSeed(Math.random());
    setDrawPhase("mixing");

    timerRef.current = [
      window.setTimeout(() => setDrawPhase("dispensing"), 1250),
      window.setTimeout(() => setDrawPhase("opening"), 1760),
      window.setTimeout(() => {
        const result = drawCapsule();
        setDrawResult(result);
        setDrawPhase("result");
        onDrawResult?.(result);

        if (result.kind === "route_ticket") {
          if (result.isDuplicate && result.fragmentsAwarded > 0) {
            onFragmentsGained?.(result.fragmentsAwarded, result);
            return;
          }

          onRouteTicketWon?.(result.route, result);
          return;
        }

        onDecorationWon?.(result.decoration, result);
      }, 2200),
    ];
  };

  const handleExchange = (effect: CapsuleAtmosphereEffect) => {
    if (!canExchangeEffect(effect.id, currentFragments)) {
      return;
    }

    onExchangeAtmosphereEffect?.(effect);
    setExchangeNotice(`${effect.name} added.`);
  };

  const resolvedDisabledReason = !hasCapsuleStock
    ? "Empty machine"
    : drawDisabledReason ?? (isDrawDisabled ? "Unavailable" : null);

  const modalContent = (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(31,40,35,0.42)] px-4 py-5 text-ink backdrop-blur-[6px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="capsule-machine-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            aria-label="Close capsule machine"
            onClick={onClose}
            tabIndex={-1}
          />

          <motion.section
            className="relative z-10 flex h-[min(94dvh,700px)] max-h-[calc(100dvh-16px)] w-full max-w-[358px] flex-col overflow-hidden rounded-[30px] border border-white/60 bg-[linear-gradient(180deg,#faf7f0_0%,#f4f0e6_52%,#f1ece1_100%)] shadow-[0_26px_70px_rgba(35,52,40,0.2)]"
            initial={{ y: 22, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="relative border-b border-sage-900/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,255,255,0.22))] px-4 pb-3 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-sage-500">My Scape</p>
                  <h2 id="capsule-machine-title" className="mt-1 text-[1.45rem] font-semibold tracking-[-0.06em] text-ink">
                    Capsule Machine
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRules((current) => !current)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/78 text-sage-700 ring-1 ring-sage-900/10"
                    aria-label="Show rules"
                  >
                    <CircleHelp className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/78 text-sage-700 ring-1 ring-sage-900/10"
                    aria-label="Close capsule machine"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex h-11 min-w-[94px] items-center justify-between rounded-[18px] bg-[linear-gradient(180deg,#eff3ee,#e2e9e1)] px-3 text-ink ring-1 ring-white/80">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.22em] text-sage-500">Fragments</p>
                    <p className="mt-0.5 text-lg font-semibold tracking-[-0.04em]">{currentFragments}</p>
                  </div>
                  <Gem className="h-4.5 w-4.5 text-[#c79746]" />
                </div>

                <div className="grid flex-1 grid-cols-2 gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const selected = activeTab === tab.key;

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-[16px] px-3 py-2.5 text-sm font-semibold transition",
                          selected
                            ? "bg-[linear-gradient(180deg,#6f8374,#506458)] text-white shadow-[0_12px_22px_rgba(45,62,53,0.15)]"
                            : "bg-white/72 text-sage-600 ring-1 ring-sage-900/6",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {showRules ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-4 top-[4.35rem] z-10 w-[208px] rounded-[20px] bg-[linear-gradient(180deg,#f8f4eb,#eee7da)] p-3 text-[12px] leading-5 text-ink shadow-[0_18px_40px_rgba(61,79,67,0.16)] ring-1 ring-white/70"
                  >
                    <p>Only route tickets and decor.</p>
                    <p>Repeat routes become fragments.</p>
                    <p>Fragments buy atmosphere effects.</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </header>

            <main className="flex-1 overflow-hidden px-3 py-3">
              <AnimatePresence mode="wait">
                {activeTab === "machine" ? (
                  <motion.div
                    key="machine"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-full flex-col gap-2.5"
                  >
                    <CapsuleMachineVisual
                      phase={drawPhase}
                      activeCapsuleStyleIndex={activeCapsuleStyleIndex}
                      mixSeed={mixSeed}
                      compact={Boolean(drawResult) && drawPhase === "result"}
                    />

                    <div className="shrink-0 rounded-[20px] bg-white/80 p-2.5 shadow-[0_18px_40px_rgba(35,52,40,0.08)] ring-1 ring-white/80">
                      <div className="flex items-center justify-between gap-3">
                        <div className={cn("min-w-0", drawResult ? "hidden" : "")}>
                          <p className="text-sm font-semibold text-ink">Pool</p>
                          <p className="mt-0.5 text-xs text-sage-500">{routePool.length} tickets / {decorationPool.length} decor</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDraw}
                          disabled={drawLocked}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#556a5f,#72877b)] px-4 py-2.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(77,97,86,0.18)] transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Sparkles className="h-4 w-4" />
                          {drawInProgress ? "Spinning..." : "Spin"}
                          {drawCostLabel ? <span className="rounded-full bg-white/14 px-2 py-0.5 text-[11px]">{drawCostLabel}</span> : null}
                        </button>
                      </div>
                      {resolvedDisabledReason ? (
                        <p className="mt-2 rounded-2xl bg-sage-50 px-3 py-2 text-sm text-sage-600">{resolvedDisabledReason}</p>
                      ) : null}
                    </div>

                    <div className={cn("min-h-0 flex-1", drawResult ? "rounded-[22px] bg-white/58 p-2 ring-1 ring-white/74" : "")}>
                      <AnimatePresence mode="wait">
                        {drawResult ? (
                          <motion.div
                            key="draw-result"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full min-h-[190px] overflow-visible"
                          >
                            <PrizeResultCard result={drawResult} />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty-result"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex h-full min-h-[46px] items-center justify-center rounded-[18px] border border-dashed border-sage-300/70 bg-white/42 px-4 py-2 text-center text-sm text-sage-500"
                          >
                            Prize goes to Box.
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="shop"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-full flex-col gap-3 overflow-y-auto pr-1"
                  >
                    {exchangeNotice ? (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[18px] bg-[linear-gradient(180deg,#eff3ee,#dfe8de)] px-4 py-3 text-sm font-semibold text-[#314239] ring-1 ring-white/70"
                      >
                        {exchangeNotice}
                      </motion.p>
                    ) : null}

                    <div className="grid gap-3">
                      {shopEffects.map((effect) => {
                        const EffectIcon = effectIconById[effect.id] ?? Sparkles;
                        const owned = ownedEffectIdSet.has(effect.id);
                        const affordable = currentFragments >= effect.costFragments;
                        const disabled = owned || !affordable;

                        return (
                          <motion.article
                            key={effect.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="overflow-hidden rounded-[22px] bg-white/82 shadow-[0_18px_40px_rgba(35,52,40,0.08)] ring-1 ring-white/80"
                          >
                            <div className={cn("h-[74px] bg-gradient-to-br", effect.previewClassName)}>
                              <div className="flex h-full items-center justify-between px-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/74 text-ink shadow-[0_12px_24px_rgba(31,43,36,0.12)]">
                                  <EffectIcon className="h-5 w-5" />
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 ring-1 ring-amber-200">
                                  <Gem className="h-3.5 w-3.5" />
                                  {effect.costFragments}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="min-w-0">
                                <h4 className="text-base font-semibold tracking-[-0.04em] text-ink">{effect.name}</h4>
                                <p className="mt-1 line-clamp-2 text-sm text-sage-600">{effect.description}</p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleExchange(effect)}
                                disabled={disabled}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#556a5f,#72877b)] px-5 py-3 text-sm font-bold text-white transition enabled:hover:brightness-[0.97] disabled:cursor-not-allowed disabled:bg-sage-200 disabled:text-sage-500"
                              >
                                {owned ? "Owned" : affordable ? "Exchange" : "Need More"}
                              </button>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(modalContent, document.body);
};
