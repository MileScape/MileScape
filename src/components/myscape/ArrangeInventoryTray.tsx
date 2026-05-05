import { motion } from "framer-motion";
import { Check, CloudSun, Lock, MapPin, Sparkles } from "lucide-react";
import { forwardRef, useMemo, useState } from "react";
import type { Rarity } from "../../types";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";

interface ArrangeInventoryTrayItem {
  asset: UnlockedLandmarkAsset;
  availableCount: number;
  isCollectedOnly?: boolean;
  isNew: boolean;
  isUnlocked: boolean;
  ownedCount: number;
  placedCount: number;
  placed: boolean;
  selected: boolean;
  subtitleLabel?: string;
  stateLabel: string;
}

interface ArrangeInventoryTrayProps {
  items: ArrangeInventoryTrayItem[];
  atmosphereEffects?: Array<{
    id: string;
    name: string;
    description: string;
    owned: boolean;
    active: boolean;
  }>;
  isReturnDropActive?: boolean;
  onToggleAtmosphereEffect?: (effectId: string) => void;
  onSelectItem: (assetId: string) => void;
}

type InventoryCategory = "landmarks" | "decorations" | "scene";
type DecorationRarityFilter = "all" | Rarity;

const categoryTabs: Array<{ key: InventoryCategory; label: string }> = [
  { key: "landmarks", label: "Landmarks" },
  { key: "decorations", label: "Decorations" },
  { key: "scene", label: "Scene" },
];

const rarityCycle: DecorationRarityFilter[] = ["all", "common", "rare", "epic", "legendary"];
const rarityFilterLabel: Record<DecorationRarityFilter, string> = {
  all: "ALL",
  common: "COMMON",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEGENDARY",
};

const shelfContentTransition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const };

const getInventoryCategory = (asset: UnlockedLandmarkAsset): InventoryCategory =>
  asset.assetType === "landmark" ? "landmarks" : "decorations";

export const ArrangeInventoryTray = forwardRef<HTMLDivElement, ArrangeInventoryTrayProps>(function ArrangeInventoryTray(
  { items, atmosphereEffects = [], isReturnDropActive = false, onSelectItem, onToggleAtmosphereEffect },
  ref,
) {
  const [category, setCategory] = useState<InventoryCategory>("landmarks");
  const [activeRarityFilter, setActiveRarityFilter] = useState<DecorationRarityFilter>("all");

  const categoryItems = useMemo(
    () => items.filter((item) => getInventoryCategory(item.asset) === category),
    [category, items],
  );
  const filteredItems = useMemo(() => {
    if (category !== "decorations" || activeRarityFilter === "all") {
      return categoryItems;
    }

    return categoryItems.filter(
      (item) => item.asset.assetType === "decor" && item.asset.rarity === activeRarityFilter,
    );
  }, [activeRarityFilter, category, categoryItems]);
  const categoryOwnedCount = useMemo(() => {
    if (category === "scene") {
      return atmosphereEffects.filter((effect) => effect.owned).length;
    }

    return filteredItems.filter((item) => item.isUnlocked).length;
  }, [atmosphereEffects, category, filteredItems]);
  const categoryTotalCount = category === "scene" ? atmosphereEffects.length : filteredItems.length;
  const showRarityFilter = category === "decorations";

  const handleCategoryChange = (nextCategory: InventoryCategory) => {
    setCategory(nextCategory);
    if (nextCategory !== "decorations") {
      setActiveRarityFilter("all");
    }
  };

  const handleCycleRarityFilter = () => {
    setActiveRarityFilter((current) => {
      const currentIndex = rarityCycle.indexOf(current);
      return rarityCycle[(currentIndex + 1) % rarityCycle.length] ?? "all";
    });
  };

  const emptyStateLabel =
    category === "scene"
      ? "NO SCENE EFFECTS"
      : activeRarityFilter === "all"
        ? "NO DECORATIONS"
        : `NO ${rarityFilterLabel[activeRarityFilter]} DECORATIONS`;
  const shelfMotionKey = `${category}-${showRarityFilter ? activeRarityFilter : "all"}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+18px)]"
    >
      <div
        ref={ref}
        className={`pointer-events-auto mx-auto max-w-[560px] rounded-[30px] border p-3 shadow-[0_22px_42px_rgba(45,62,53,0.16)] backdrop-blur-2xl transition ${
          isReturnDropActive
            ? "border-[#89a494]/70 bg-[linear-gradient(180deg,rgba(233,241,233,0.82),rgba(225,236,226,0.72))]"
            : "border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(248,244,238,0.46))]"
        }`}
      >
        <div className="mb-2 flex items-start justify-between gap-3 px-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#708177]">
            {isReturnDropActive ? "Return to Inventory" : "Inventory"}
          </p>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8a978e]">
              {isReturnDropActive ? "Release to Return" : `${categoryOwnedCount} / ${categoryTotalCount} unlocked`}
            </p>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
          {isReturnDropActive ? (
            <div className="flex w-full items-center justify-center rounded-full border border-[#88a293]/55 bg-white/44 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#567064] shadow-[0_10px_20px_rgba(47,62,54,0.08)]">
              Drop Here to Send Back
            </div>
          ) : (
            <>
              <div className="inline-flex rounded-full border border-white/70 bg-white/46 p-1 shadow-[0_10px_20px_rgba(47,62,54,0.08)]">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleCategoryChange(tab.key)}
                    className={`rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.12em] transition ${
                      category === tab.key ? "bg-[#4b6154] text-white" : "text-[#718278]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {showRarityFilter ? (
                <button
                  type="button"
                  onClick={handleCycleRarityFilter}
                  className="shrink-0 rounded-full border border-white/75 bg-[rgba(243,246,239,0.82)] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#5f7168] shadow-[0_8px_18px_rgba(47,62,54,0.08)] transition hover:bg-[rgba(247,249,244,0.92)]"
                  aria-label={`Rarity filter: ${rarityFilterLabel[activeRarityFilter]}. Tap to cycle`}
                >
                  {rarityFilterLabel[activeRarityFilter]}
                </button>
              ) : (
                <div className="flex h-[34px] items-center gap-1 rounded-full bg-white/36 px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-[#718278]" aria-hidden="true">
                  {category === "scene" ? (
                    <>
                      <CloudSun className="h-3.5 w-3.5" />
                      Effects
                    </>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>

        <div className="relative h-[228px] overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-none pb-1 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x [&::-webkit-scrollbar]:hidden">
          <motion.div
            key={shelfMotionKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { staggerChildren: 0.035, delayChildren: 0.02 } }}
            className={`grid h-full w-max min-w-full grid-flow-col grid-rows-[repeat(2,108px)] gap-x-4 gap-y-3 ${
              category === "scene" ? "auto-cols-[112px]" : "auto-cols-[84px]"
            }`}
          >
              {category === "scene" ? (
                atmosphereEffects.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: shelfContentTransition }}
                    exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.1 } }}
                    className="col-span-1 row-span-2 flex h-full w-[calc(100vw-4rem)] min-w-[220px] max-w-[480px] items-center justify-center"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7f8d85]">{emptyStateLabel}</p>
                  </motion.div>
                ) : (
                  atmosphereEffects.map((effect, index) => {
                    const icon = effect.owned ? (
                      effect.active ? (
                        <Check className="h-4 w-4 text-[#4b6154]" />
                      ) : (
                        <CloudSun className="h-4 w-4 text-[#65776e]" />
                      )
                    ) : (
                      <Lock className="h-4 w-4 text-[#939d97]" />
                    );

                    return (
                      <motion.button
                        key={`${shelfMotionKey}-${effect.id}`}
                        type="button"
                        onClick={() => {
                          if (!effect.owned) {
                            return;
                          }
                          onToggleAtmosphereEffect?.(effect.id);
                        }}
                        title={effect.description}
                        aria-label={`${effect.name}. ${effect.owned ? (effect.active ? "On" : "Off") : "Locked"}.`}
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{
                          opacity: effect.owned ? 1 : 0.62,
                          y: 0,
                          scale: 1,
                          transition: { ...shelfContentTransition, delay: index * 0.035 },
                        }}
                        exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.1 } }}
                        className={`relative flex h-[108px] w-[112px] flex-col items-center justify-center rounded-[24px] border px-3 text-center transition ${
                          effect.active
                            ? "border-[#607868]/40 bg-[linear-gradient(180deg,rgba(232,241,232,0.84),rgba(213,228,216,0.66))] text-[#2f3e36] shadow-[0_12px_24px_rgba(47,62,54,0.1)]"
                            : effect.owned
                              ? "border-white/62 bg-white/42 text-[#506258]"
                              : "border-white/42 bg-white/24 text-[#8a978f]"
                        }`}
                      >
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[16px] bg-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                          {icon}
                        </div>
                        <p className="line-clamp-2 text-[11px] font-semibold leading-[15px]">{effect.name}</p>
                        <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em]">
                          {!effect.owned ? "LOCKED" : effect.active ? "ON" : "OFF"}
                        </p>
                      </motion.button>
                    );
                  })
                )
              ) : filteredItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: shelfContentTransition }}
                  exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.1 } }}
                  className="col-span-1 row-span-2 flex h-full w-[calc(100vw-4rem)] min-w-[220px] max-w-[480px] items-center justify-center"
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7f8d85]">{emptyStateLabel}</p>
                </motion.div>
              ) : (
                filteredItems.map(
                  ({ asset, availableCount, isCollectedOnly = false, isNew, isUnlocked, ownedCount, placed, placedCount, selected, stateLabel, subtitleLabel }, index) => {
                    const Icon = asset.assetType === "landmark" ? MapPin : Sparkles;
                    return (
                      <motion.button
                        key={`${shelfMotionKey}-${asset.id}`}
                        type="button"
                        onClick={() => onSelectItem(asset.id)}
                        title={asset.name}
                        aria-label={`${asset.name}. ${stateLabel}.${subtitleLabel ? ` ${subtitleLabel}.` : ""} ${placedCount} of ${ownedCount} on lawn.`}
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{
                          opacity: isUnlocked ? 1 : 0.7,
                          y: 0,
                          scale: 1,
                          transition: { ...shelfContentTransition, delay: index * 0.035 },
                        }}
                        exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.1 } }}
                        className={`relative flex h-[108px] w-[84px] flex-col items-center text-center transition ${
                          isUnlocked ? (selected ? "opacity-100" : "opacity-100 hover:opacity-88") : "opacity-70"
                        }`}
                      >
                        <div className="relative flex h-[50px] w-full items-center justify-center">
                          {asset.imageSrc ? (
                            <img
                              src={asset.imageSrc}
                              alt={asset.name}
                              className={`max-h-[44px] max-w-[62px] object-contain ${isUnlocked ? "" : "grayscale saturate-0 opacity-60"}`}
                              draggable={false}
                            />
                          ) : (
                            <Icon className={`h-5 w-5 ${isUnlocked ? "text-[#66786e]" : "text-[#9aa59f]"}`} />
                          )}
                          {isUnlocked && isNew ? <span className="myscape-sparkle-marker absolute right-1 top-1" /> : null}
                          {!isUnlocked ? (
                            <span className="absolute bottom-0 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7d877f] text-white shadow-[0_5px_10px_rgba(48,64,55,0.12)]">
                              <Lock className="h-2.5 w-2.5" />
                            </span>
                          ) : null}
                          {isUnlocked && isCollectedOnly ? (
                            <span className="absolute bottom-0 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7d877f] text-white shadow-[0_5px_10px_rgba(48,64,55,0.12)]">
                              <Lock className="h-2.5 w-2.5" />
                            </span>
                          ) : null}
                          {isUnlocked && !isCollectedOnly && placed ? (
                            <span className="absolute bottom-0 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#4b6154] text-white shadow-[0_5px_10px_rgba(48,64,55,0.18)]">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          ) : null}
                          {isUnlocked && !isCollectedOnly && availableCount > 1 ? (
                            <span className="absolute left-1 top-1 rounded-full bg-[#41584b] px-1.5 py-0.5 text-[9px] font-medium leading-none text-white shadow-[0_6px_12px_rgba(48,64,55,0.18)]">
                              x{availableCount}
                            </span>
                          ) : null}
                        </div>
                        <p className={`mt-1 line-clamp-2 h-[30px] w-full overflow-hidden text-[11px] font-semibold leading-[15px] ${isUnlocked ? "text-[#2f3e36]" : "text-[#7f8a83]"}`}>
                          {asset.name}
                        </p>
                        <p
                          className={`mt-1 h-[15px] w-full overflow-hidden text-[9px] font-medium uppercase leading-[15px] tracking-[0.16em] ${
                            !isUnlocked ? "text-[#8d9690]" : isNew ? "text-[#b97d3e]" : "text-[#7f8d85]"
                          }`}
                        >
                          {stateLabel}
                        </p>
                        {subtitleLabel ? (
                          <p className="h-[14px] w-full overflow-hidden text-[8px] leading-[14px] text-[#98a29c]">{subtitleLabel}</p>
                        ) : null}
                      </motion.button>
                    );
                  },
                )
              )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
