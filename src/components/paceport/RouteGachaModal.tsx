import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Armchair, Cone, Info, Sparkles, Ticket, TreePine, X } from "lucide-react";
import { useGachaLogic, type GachaDrawResult } from "../../hooks/useGachaLogic";
import { Button } from "../ui/Button";
import { AtmosphereExchangeModal } from "./AtmosphereExchangeModal";

interface RouteGachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnlockedMaps: string[];
  currentDecorIds?: string[];
  blueprints?: number;
  unlockedAtmosphereIds?: string[];
  activeAtmosphereIds?: string[];
  onMapUnlocked: (mapId: string) => void;
  onDecorUnlocked?: (decorId: string, duplicateBlueprints: number) => void;
  onBlueprintsGained: (amount: number) => void;
  onRedeemAtmosphere?: (atmosphereId: string, costBlueprints: number) => void;
  onSetAtmosphereActive?: (atmosphereId: string, active: boolean) => void;
  canDraw?: boolean;
  costStamps?: number;
}

type RevealPhase = "idle" | "shaking" | "revealed" | "converted";

const rarityStyles = {
  Starter: {
    glow: "shadow-[0_18px_40px_rgba(101,116,94,0.16)]",
    ring: "ring-slate-300/70",
    accent: "from-slate-100 via-white to-[#f7f4ed]",
    badge: "bg-slate-200 text-slate-700",
  },
  Standard: {
    glow: "shadow-[0_18px_40px_rgba(85,123,104,0.18)]",
    ring: "ring-sage-200/80",
    accent: "from-[#dfeadf] via-white to-[#f7f4ed]",
    badge: "bg-sage-100 text-sage-800",
  },
  Advanced: {
    glow: "shadow-[0_18px_42px_rgba(113,89,67,0.18)]",
    ring: "ring-[#d8c7aa]/80",
    accent: "from-[#eadcc5] via-white to-[#f7f4ed]",
    badge: "bg-[#eadcc5] text-[#6f593c]",
  },
  Premium: {
    glow: "shadow-[0_18px_46px_rgba(194,139,55,0.22)]",
    ring: "ring-amber-300/80",
    accent: "from-amber-200 via-white to-[#f7f4ed]",
    badge: "bg-amber-200 text-amber-900",
  },
} as const;

export const RouteGachaModal = ({
  isOpen,
  onClose,
  currentUnlockedMaps,
  currentDecorIds = [],
  blueprints = 0,
  unlockedAtmosphereIds = [],
  activeAtmosphereIds = [],
  onMapUnlocked,
  onDecorUnlocked,
  onBlueprintsGained,
  onRedeemAtmosphere,
  onSetAtmosphereActive,
  canDraw = true,
  costStamps = 50,
}: RouteGachaModalProps) => {
  const { performDraw } = useGachaLogic();
  const [phase, setPhase] = useState<RevealPhase>("idle");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<GachaDrawResult | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhase("idle");
      setIsDrawing(false);
      setDrawResult(null);
      setShowRules(false);
      setExchangeOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDrawing) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDrawing, isOpen, onClose]);

  const rarityStyle = useMemo(() => {
    if (!drawResult || drawResult.kind === "decor") {
      return rarityStyles.Standard;
    }

    return rarityStyles[drawResult.map.tier];
  }, [drawResult]);

  const handleDraw = async () => {
    if (isDrawing || !canDraw) {
      return;
    }

    setIsDrawing(true);
    setDrawResult(null);
    setPhase("shaking");

    await new Promise((resolve) => window.setTimeout(resolve, 1400));

    const result = performDraw(currentUnlockedMaps, currentDecorIds);
    setDrawResult(result);
    setPhase("revealed");

    if (result.kind === "decor") {
      onDecorUnlocked?.(result.decor.id, result.blueprintsGained);
      if (result.isDuplicate) {
        await new Promise((resolve) => window.setTimeout(resolve, 1800));
        setPhase("converted");
      }
    } else if (result.isDuplicate) {
      onBlueprintsGained(result.blueprintsGained);
      await new Promise((resolve) => window.setTimeout(resolve, 1800));
      setPhase("converted");
    } else {
      onMapUnlocked(result.map.id);
    }

    setIsDrawing(false);
  };

  if (!isOpen) {
    return null;
  }

  const DecorIcon =
    drawResult?.kind === "decor"
      ? drawResult.decor.icon === "barrier"
        ? Cone
        : drawResult.decor.icon === "bench"
          ? Armchair
          : TreePine
      : TreePine;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(255,244,205,0.26),rgba(18,35,34,0.74)_48%,rgba(12,20,24,0.86)_100%)] p-4 backdrop-blur-sm"
      onClick={() => {
        if (!isDrawing) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="relative mx-auto my-6 w-full max-w-[25.5rem] overflow-visible text-ink"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute -inset-x-8 bottom-[-1.15rem] h-10 rounded-full bg-black/28 blur-xl" />
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/26 bg-[linear-gradient(180deg,#f9866f_0%,#df5d4e_35%,#a63a35_100%)] p-4 pb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_28px_80px_rgba(20,16,18,0.42)]">
          <div className="absolute inset-x-5 top-[11.25rem] h-8 rounded-full bg-[#7d2c2b]/55 blur-lg" />
          <div className="absolute -right-16 top-24 h-44 w-44 rounded-full bg-amber-200/18 blur-3xl" />
          <div className="absolute -left-14 bottom-8 h-36 w-36 rounded-full bg-sky-200/14 blur-3xl" />

          <div className="relative mb-3 flex items-center justify-between gap-3">
            <div className="rounded-full bg-[#6f2d2b]/28 px-3 py-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-amber-100/82">Capsule Draw</p>
              <p className="text-lg font-semibold leading-none">Map + Decor</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExchangeOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white/88 px-3 text-[#86362e] shadow-[0_8px_18px_rgba(83,32,28,0.14)] ring-1 ring-white/70"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold">Atmosphere</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRules((current) => !current)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white/88 px-3 text-[#86362e] shadow-[0_8px_18px_rgba(83,32,28,0.14)] ring-1 ring-white/70"
              >
                <Info className="h-4 w-4" />
                <span className="text-xs font-semibold">Rules</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isDrawing}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-[#86362e] shadow-[0_8px_18px_rgba(83,32,28,0.14)] ring-1 ring-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close route draw modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showRules ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden rounded-[1.25rem] bg-white/88 shadow-[0_12px_30px_rgba(83,32,28,0.12)] ring-1 ring-white/70"
              >
                <div className="space-y-2 px-4 py-3 text-sm text-[#74342f]">
                  <p>Routes 45% / Decor 55%.</p>
                  <p>Route rarity: Starter 40%, Standard 35%, Advanced 20%, Premium 5%.</p>
                  <p>Duplicate rewards become Blueprints.</p>
                  {!canDraw ? <p className="text-amber-700">Need {costStamps} stamps.</p> : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="relative mx-auto overflow-hidden rounded-t-[9rem] rounded-b-[2rem] border border-white/70 bg-[radial-gradient(circle_at_34%_20%,rgba(255,255,255,0.96),rgba(255,255,255,0.34)_38%,rgba(149,213,207,0.24)_100%)] p-4 pt-7 shadow-[inset_0_2px_0_rgba(255,255,255,0.9),inset_0_-24px_38px_rgba(98,165,158,0.14),0_14px_34px_rgba(83,32,28,0.2)] backdrop-blur-xl">
            <div className="pointer-events-none absolute left-8 top-7 h-16 w-5 rotate-45 rounded-full bg-white/55 blur-[1px]" />
            <div className="pointer-events-none absolute inset-x-7 bottom-4 h-8 rounded-full bg-white/28 blur-lg" />
            <div className="pointer-events-none absolute left-7 top-20 h-5 w-5 rounded-full bg-[#ffcf5a] shadow-[260px_20px_0_#f16f5b,225px_175px_0_#7bc8b8,42px_198px_0_#ffffff,14px_84px_0_#f5a65f]" />
            <div className="relative rounded-[1.5rem] bg-white/78 p-3 shadow-[0_10px_26px_rgba(35,52,40,0.08)] ring-1 ring-white/80">
              <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex min-h-[248px] flex-col items-center justify-center text-center"
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="relative flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-[#fff3cf] bg-[radial-gradient(circle_at_34%_28%,#ffffff_0%,#fff3cf_34%,#f6b458_35%,#ed745e_68%,#be4138_100%)] text-[#6c2f2b] shadow-[inset_0_2px_0_rgba(255,255,255,0.72),0_18px_34px_rgba(96,43,34,0.18)]"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-[2px] bg-white/58" />
                    <Ticket className="relative z-10 h-11 w-11" />
                  </motion.div>
                  <h3 className="mt-5 text-xl font-semibold text-ink">Turn the capsule machine</h3>
                  <p className="mt-2 text-sm text-sage-600">{costStamps} stamps per capsule</p>
                </motion.div>
              )}

              {phase === "shaking" && (
                <motion.div
                  key="shaking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[248px] flex-col items-center justify-center text-center"
                >
                  <motion.div
                    animate={{
                      rotate: [0, -7, 7, -10, 10, -5, 5, 0],
                      scale: [1, 1.02, 0.98, 1.04, 1],
                    }}
                    transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="relative flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-[#fff3cf] bg-[radial-gradient(circle_at_34%_28%,#ffffff_0%,#fff3cf_34%,#f6b458_35%,#ed745e_68%,#be4138_100%)] text-[#6c2f2b] shadow-[inset_0_2px_0_rgba(255,255,255,0.72),0_18px_34px_rgba(96,43,34,0.18)]"
                  >
                    <motion.div
                      animate={{ opacity: [0.45, 1, 0.45], scale: [0.95, 1.18, 0.95] }}
                      transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
                      className="absolute inset-0 rounded-full bg-amber-100/55 blur-2xl"
                    />
                    <span className="absolute inset-x-0 top-1/2 h-[2px] bg-white/58" />
                    <Ticket className="relative z-10 h-11 w-11" />
                  </motion.div>
                  <p className="mt-6 text-sm font-medium uppercase tracking-[0.24em] text-[#9a4539]">Rolling capsule</p>
                </motion.div>
              )}

              {drawResult && (phase === "revealed" || phase === "converted") && (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, rotateY: -90, scale: 0.88 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="flex min-h-[248px] items-center justify-center"
                >
                  <div className={`relative w-full overflow-hidden rounded-[1.5rem] bg-white p-4 ring-1 ${rarityStyle.glow} ${rarityStyle.ring}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${rarityStyle.accent} opacity-20`} />

                    <AnimatePresence mode="wait">
                      {phase === "revealed" && (
                        <motion.div
                          key="card"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
                          className="relative"
                        >
                          {drawResult.kind === "route" ? (
                            <img
                              src={drawResult.map.coverImage}
                              alt={drawResult.map.name}
                              className="h-44 w-full rounded-[1.1rem] object-cover"
                            />
                          ) : (
                            <div className="flex h-44 w-full items-center justify-center rounded-[1.1rem] bg-[linear-gradient(180deg,rgba(226,232,240,0.18),rgba(56,189,248,0.1))]">
                              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/70 ring-1 ring-sage-900/10">
                                <DecorIcon className="h-12 w-12 text-sage-700" />
                              </div>
                            </div>
                          )}
                          <div className="mt-4 flex items-start justify-between gap-4">
                            <div>
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${rarityStyle.badge}`}>
                                {drawResult.kind === "route" ? drawResult.map.tier : drawResult.decor.rarity}
                              </span>
                              <h3 className="mt-3 text-[1.45rem] font-semibold leading-tight text-ink">
                                {drawResult.kind === "route" ? drawResult.map.name : drawResult.decor.name}
                              </h3>
                              <p className="mt-1 text-sm text-sage-600">
                                {drawResult.kind === "route" ? `${drawResult.map.city}, ${drawResult.map.country}` : "My Scape decor"}
                              </p>
                            </div>
                            <Sparkles className="mt-1 h-6 w-6 text-amber-500" />
                          </div>
                          <p className="mt-4 text-sm leading-6 text-sage-600">
                            {drawResult.kind === "route" ? drawResult.map.description : drawResult.decor.description}
                          </p>
                        </motion.div>
                      )}

                      {phase === "converted" && (
                        <motion.div
                          key="blueprints"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="relative flex min-h-[240px] flex-col items-center justify-center text-center"
                        >
                          <div className="relative flex h-36 w-36 items-center justify-center">
                            {[0, 1, 2].map((index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.7, rotate: -8 + index * 8 }}
                                animate={{
                                  opacity: [0, 1, 1],
                                  scale: [0.7, 1, 1],
                                  x: [-18 + index * 18, -28 + index * 28],
                                  y: [12, -6 - index * 8],
                                }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="absolute flex h-20 w-16 items-center justify-center rounded-2xl border border-sage-200 bg-sage-50"
                              >
                                <span className="text-lg font-semibold text-sage-700">BP</span>
                              </motion.div>
                            ))}
                          </div>
                          <p className="mt-8 inline-flex rounded-full bg-sage-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage-700">
                            +{drawResult.blueprintsGained} Route Blueprints
                          </p>
                          <p className="mt-4 text-sm text-sage-600">Duplicate converted.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative mt-4 rounded-[1.65rem] bg-[linear-gradient(180deg,#ffe6a4,#f9bf58)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_14px_34px_rgba(83,32,28,0.16)] ring-1 ring-white/36">
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                onClick={handleDraw}
                disabled={isDrawing || !canDraw}
                whileTap={canDraw && !isDrawing ? { rotate: 24, scale: 0.96 } : undefined}
                className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[6px] border-[#7d342b] bg-[radial-gradient(circle_at_34%_28%,#fff7d2,#ffd16b_46%,#b8473b_47%,#87342f_100%)] text-[#5b2724] shadow-[inset_0_2px_0_rgba(255,255,255,0.72),0_10px_18px_rgba(91,39,36,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Turn capsule machine knob"
              >
                <span className="h-2 w-12 rounded-full bg-[#5b2724]" />
              </motion.button>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a3b31]">Turn Knob</p>
                <p className="mt-1 text-lg font-semibold leading-tight text-[#5b2724]">
                  {isDrawing ? "Rolling..." : canDraw ? "Release Capsule" : "Need More Stamps"}
                </p>
                <p className="mt-1 text-xs font-medium text-[#8a3b31]/80">{costStamps} stamps / capsule</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                fullWidth
                onClick={handleDraw}
                disabled={isDrawing || !canDraw}
                className="h-12 bg-[#7f352f] text-white shadow-[0_10px_20px_rgba(91,39,36,0.2)] hover:bg-[#6e2d29]"
              >
                {isDrawing ? "Drawing..." : canDraw ? "Draw" : "Need Stamps"}
              </Button>
              <Button type="button" fullWidth variant="ghost" onClick={onClose} disabled={isDrawing} className="h-12 text-[#73312c] hover:bg-white/42">
                Close
              </Button>
            </div>
            <div className="mx-auto mt-3 h-5 w-28 rounded-b-2xl rounded-t-md bg-[#5b2724] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]" />
          </div>
        </div>
      </motion.div>

      <AtmosphereExchangeModal
        isOpen={exchangeOpen}
        onClose={() => setExchangeOpen(false)}
        blueprints={blueprints}
        unlockedAtmosphereIds={unlockedAtmosphereIds}
        activeAtmosphereIds={activeAtmosphereIds}
        onRedeem={onRedeemAtmosphere ?? (() => undefined)}
        onSetActive={onSetAtmosphereActive ?? (() => undefined)}
      />
    </div>
  );
};
