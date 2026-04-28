import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Armchair, Cone, Info, Sparkles, Ticket, TreePine, X } from "lucide-react";
import { AtmosphereExchangeModal } from "./AtmosphereExchangeModal";
import { useGachaLogic, type GachaDrawResult } from "../../hooks/useGachaLogic";
import { Button } from "../ui/Button";

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
    badge: "bg-slate-200 text-slate-700"
  },
  Standard: {
    glow: "shadow-[0_18px_40px_rgba(85,123,104,0.18)]",
    ring: "ring-sage-200/80",
    accent: "from-[#dfeadf] via-white to-[#f7f4ed]",
    badge: "bg-sage-100 text-sage-800"
  },
  Advanced: {
    glow: "shadow-[0_18px_42px_rgba(113,89,67,0.18)]",
    ring: "ring-[#d8c7aa]/80",
    accent: "from-[#eadcc5] via-white to-[#f7f4ed]",
    badge: "bg-[#eadcc5] text-[#6f593c]"
  },
  Premium: {
    glow: "shadow-[0_18px_46px_rgba(194,139,55,0.22)]",
    ring: "ring-amber-300/80",
    accent: "from-amber-200 via-white to-[#f7f4ed]",
    badge: "bg-amber-200 text-amber-900"
  }
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
  costStamps = 50
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

  const modal = (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-sage-900/38 p-4 backdrop-blur-sm"
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
        className="relative mx-auto my-6 w-full max-w-[24rem] overflow-hidden rounded-[2rem] border border-white/80 bg-[#f8f6ef] text-ink shadow-[0_24px_70px_rgba(35,52,40,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(216,230,218,0.9),rgba(248,246,239,0))]" />
        <div className="relative p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sage-500">Paceport Draw</p>
              <h2 className="mt-1 text-2xl font-semibold leading-tight text-ink">Map + Decor</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExchangeOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white/72 px-3 text-sage-700 shadow-sm ring-1 ring-sage-900/8"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold">Atmosphere</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRules((current) => !current)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white/72 px-3 text-sage-700 shadow-sm ring-1 ring-sage-900/8"
                aria-expanded={showRules}
                aria-label="Toggle draw pool rules"
              >
                <Info className="h-4 w-4" />
                <span className="text-xs font-semibold">Rules</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isDrawing}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/72 text-sage-700 shadow-sm ring-1 ring-sage-900/8 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close route draw modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showRules ? (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                className="mb-4 overflow-hidden rounded-[1.25rem] bg-white/72 ring-1 ring-sage-900/8"
              >
                <div className="space-y-2 px-4 py-3 text-sm text-sage-700">
                  <p>Routes 45% · Decor 55%</p>
                  <p>Duplicate rewards become Blueprints.</p>
                  {!canDraw ? <p className="text-amber-700">Need {costStamps} stamps.</p> : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-[1.5rem] bg-white/72 p-4 shadow-[0_14px_34px_rgba(35,52,40,0.08)] ring-1 ring-white/85">
              <AnimatePresence mode="wait">
                {phase === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="flex min-h-[260px] flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(180deg,#edf4ec,#ffffff)] text-sage-700 shadow-[0_14px_34px_rgba(35,52,40,0.08)] ring-1 ring-sage-900/8"
                    >
                      <Ticket className="h-11 w-11" />
                    </motion.div>
                    <h3 className="mt-5 text-xl font-semibold text-ink">Ready to draw</h3>
                  </motion.div>
                )}

                {phase === "shaking" && (
                  <motion.div
                    key="shaking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[260px] flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, -7, 7, -10, 10, -5, 5, 0],
                        scale: [1, 1.02, 0.98, 1.04, 1]
                      }}
                      transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="relative flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-[linear-gradient(180deg,#f1e7d2,#ffffff)] text-sage-700 shadow-[0_14px_34px_rgba(35,52,40,0.1)] ring-1 ring-sage-900/8"
                    >
                      <motion.div
                        animate={{ opacity: [0.45, 1, 0.45], scale: [0.95, 1.18, 0.95] }}
                        transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
                        className="absolute inset-0 rounded-[2rem] bg-amber-100/50 blur-2xl"
                      />
                      <Ticket className="relative z-10 h-11 w-11" />
                    </motion.div>
                    <p className="mt-6 text-sm font-medium uppercase tracking-[0.24em] text-sage-600">Drawing</p>
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
                    className="flex min-h-[260px] items-center justify-center"
                  >
                    <div
                      className={`relative w-full overflow-hidden rounded-[1.5rem] bg-white p-4 ring-1 ${rarityStyle.glow} ${rarityStyle.ring}`}
                    >
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
                                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/10 ring-1 ring-white/15">
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
                              <Sparkles className="mt-1 h-6 w-6 text-amber-200" />
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
                                    y: [12, -6 - index * 8]
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

            <div className="rounded-[1.5rem] bg-white/72 p-4 shadow-[0_14px_34px_rgba(35,52,40,0.08)] ring-1 ring-white/85">
              <div className="space-y-3">
                <Button
                  type="button"
                  fullWidth
                  onClick={handleDraw}
                  disabled={isDrawing || !canDraw}
                  className="h-13 bg-sage-700 text-white shadow-[0_14px_28px_rgba(65,89,74,0.2)] hover:bg-sage-800"
                >
                  {isDrawing ? "Drawing Route..." : canDraw ? "Reveal Route Map" : `Need ${costStamps} Stamps`}
                </Button>
                <Button type="button" fullWidth variant="ghost" onClick={onClose} disabled={isDrawing} className="h-12 text-sage-700">
                  Close
                </Button>
              </div>
            </div>
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

  return createPortal(modal, document.body);
};
