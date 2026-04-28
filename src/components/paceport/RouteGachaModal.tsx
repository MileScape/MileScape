import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Sparkles, Ticket, X } from "lucide-react";
import { useGachaLogic, type GachaDrawResult } from "../../hooks/useGachaLogic";
import { Button } from "../ui/Button";

interface RouteGachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnlockedMaps: string[];
  onMapUnlocked: (mapId: string) => void;
  onBlueprintsGained: (amount: number) => void;
  canDraw?: boolean;
  costStamps?: number;
}

type RevealPhase = "idle" | "shaking" | "revealed" | "converted";

const rarityStyles = {
  Starter: {
    glow: "shadow-[0_0_45px_rgba(148,163,184,0.38)]",
    ring: "ring-slate-300/70",
    accent: "from-slate-200 via-slate-100 to-white",
    badge: "bg-slate-200 text-slate-700"
  },
  Standard: {
    glow: "shadow-[0_0_45px_rgba(59,130,246,0.42)]",
    ring: "ring-sky-300/70",
    accent: "from-sky-300 via-blue-200 to-white",
    badge: "bg-sky-200 text-sky-900"
  },
  Advanced: {
    glow: "shadow-[0_0_55px_rgba(168,85,247,0.48)]",
    ring: "ring-fuchsia-300/70",
    accent: "from-fuchsia-300 via-violet-200 to-white",
    badge: "bg-fuchsia-200 text-fuchsia-900"
  },
  Premium: {
    glow: "shadow-[0_0_60px_rgba(250,204,21,0.55)]",
    ring: "ring-amber-300/80",
    accent: "from-amber-300 via-yellow-200 to-white",
    badge: "bg-amber-200 text-amber-900"
  }
} as const;

export const RouteGachaModal = ({
  isOpen,
  onClose,
  currentUnlockedMaps,
  onMapUnlocked,
  onBlueprintsGained,
  canDraw = true,
  costStamps = 50
}: RouteGachaModalProps) => {
  const { performDraw } = useGachaLogic();
  const [phase, setPhase] = useState<RevealPhase>("idle");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<GachaDrawResult | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhase("idle");
      setIsDrawing(false);
      setDrawResult(null);
      setShowRules(false);
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
    if (!drawResult) {
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

    const result = performDraw(currentUnlockedMaps);
    setDrawResult(result);
    setPhase("revealed");

    if (result.isDuplicate) {
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

  const modal = (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
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
        className="relative mx-auto my-6 w-full max-w-[25rem] overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/95 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.14),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.16),transparent_35%)]" />
        <div className="relative p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200/80">Paceport Draw</p>
              <h2 className="mt-2 text-[1.75rem] font-semibold leading-tight text-white">Route Access Ticket</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                Draw for route access or convert duplicates into Route Blueprints for My Scape cosmetics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRules((current) => !current)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-slate-200 transition hover:bg-white/10"
                aria-expanded={showRules}
                aria-label="Toggle draw pool rules"
              >
                <Info className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Rules</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isDrawing}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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
                className="mb-4 overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/6"
              >
                <div className="space-y-2 px-4 py-3 text-sm text-slate-300">
                  <p>Starter 40% · Standard 35% · Advanced 20% · Premium 5%</p>
                  <p>PaceCrew-only destinations are excluded from this draw pool.</p>
                  <p>Duplicates become Route Blueprints instead of granting route access twice.</p>
                  {!canDraw ? <p className="text-amber-200">You need {costStamps} stamps before you can perform a draw.</p> : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:p-5">
              <AnimatePresence mode="wait">
                {phase === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="flex min-h-[300px] flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="flex h-28 w-28 items-center justify-center rounded-[1.75rem] border border-sky-200/20 bg-gradient-to-br from-sky-400/20 via-indigo-400/10 to-amber-200/20"
                    >
                      <Ticket className="h-12 w-12 text-sky-100" />
                    </motion.div>
                    <h3 className="mt-5 text-xl font-semibold">Tap to draw a new route</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                      Route access only. Landmarks stay earned through real-world running, exactly as Paceport is meant to feel.
                    </p>
                  </motion.div>
                )}

                {phase === "shaking" && (
                  <motion.div
                    key="shaking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[300px] flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, -7, 7, -10, 10, -5, 5, 0],
                        scale: [1, 1.02, 0.98, 1.04, 1]
                      }}
                      transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="relative flex h-32 w-32 items-center justify-center rounded-[1.75rem] border border-amber-200/30 bg-gradient-to-br from-amber-300/20 via-white/10 to-sky-300/20"
                    >
                      <motion.div
                        animate={{ opacity: [0.45, 1, 0.45], scale: [0.95, 1.18, 0.95] }}
                        transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
                        className="absolute inset-0 rounded-[2rem] bg-white/20 blur-2xl"
                      />
                      <Ticket className="relative z-10 h-12 w-12 text-amber-100" />
                    </motion.div>
                    <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-amber-200">Scanning Paceport routes</p>
                    <p className="mt-3 text-sm text-slate-300">Your ticket is breaking open into a destination reveal.</p>
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
                    className="flex min-h-[300px] items-center justify-center"
                  >
                    <div
                      className={`relative w-full overflow-hidden rounded-[1.5rem] border bg-slate-950/85 p-4 ring-1 ${rarityStyle.glow} ${rarityStyle.ring}`}
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
                            <img
                              src={drawResult.map.coverImage}
                              alt={drawResult.map.name}
                              className="h-44 w-full rounded-[1.1rem] object-cover"
                            />
                            <div className="mt-4 flex items-start justify-between gap-4">
                              <div>
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${rarityStyle.badge}`}>
                                  {drawResult.map.tier}
                                </span>
                                <h3 className="mt-3 text-[1.45rem] font-semibold leading-tight text-white">{drawResult.map.name}</h3>
                                <p className="mt-1 text-sm text-slate-300">
                                  {drawResult.map.city}, {drawResult.map.country}
                                </p>
                              </div>
                              <Sparkles className="mt-1 h-6 w-6 text-amber-200" />
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-300">{drawResult.map.description}</p>
                          </motion.div>
                        )}

                        {phase === "converted" && (
                          <motion.div
                            key="blueprints"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative flex min-h-[260px] flex-col items-center justify-center text-center"
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
                                  className="absolute flex h-20 w-16 items-center justify-center rounded-2xl border border-sky-200/40 bg-sky-300/20"
                                >
                                  <span className="text-lg font-semibold text-sky-100">BP</span>
                                </motion.div>
                              ))}
                            </div>
                            <p className="mt-8 inline-flex rounded-full border border-sky-200/20 bg-sky-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-100">
                              +{drawResult.blueprintsGained} Route Blueprints
                            </p>
                            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-200">
                              Duplicate Route! Converted to Blueprints. Use them in My Scape for rare decorations.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="space-y-3">
                <Button
                  type="button"
                  fullWidth
                  onClick={handleDraw}
                  disabled={isDrawing || !canDraw}
                  className="h-13 bg-gradient-to-r from-amber-300 via-sky-300 to-indigo-400 text-slate-950 shadow-[0_18px_50px_rgba(56,189,248,0.25)] hover:from-amber-200 hover:via-sky-200 hover:to-indigo-300"
                >
                  {isDrawing ? "Drawing Route..." : canDraw ? "Reveal Route Map" : `Need ${costStamps} Stamps`}
                </Button>
                <Button type="button" fullWidth variant="ghost" onClick={onClose} disabled={isDrawing} className="h-12 text-slate-200">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
};
