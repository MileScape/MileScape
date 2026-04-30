import { motion } from "framer-motion";
import { Check, Lock, MapPin, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";

interface ArrangeInventoryTrayItem {
  asset: UnlockedLandmarkAsset;
  availableCount: number;
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
  onSelectItem: (assetId: string) => void;
}

type InventoryCategory = "landmarks" | "decorations";

const categoryTabs: Array<{ key: InventoryCategory; label: string }> = [
  { key: "landmarks", label: "Landmarks" },
  { key: "decorations", label: "Decorations" },
];

const getInventoryCategory = (asset: UnlockedLandmarkAsset): InventoryCategory =>
  asset.assetType === "landmark" ? "landmarks" : "decorations";

export const ArrangeInventoryTray = ({ items, onSelectItem }: ArrangeInventoryTrayProps) => {
  const [category, setCategory] = useState<InventoryCategory>("landmarks");
  const filteredItems = useMemo(
    () => items.filter((item) => getInventoryCategory(item.asset) === category),
    [category, items],
  );
  const categoryOwnedCount = useMemo(
    () => filteredItems.filter((item) => item.isUnlocked).length,
    [filteredItems],
  );
  const categoryTotalCount = filteredItems.length;
  const categoryPlacedCount = useMemo(
    () => filteredItems.filter((item) => item.isUnlocked && item.ownedCount > 0 && item.placedCount >= item.ownedCount).length,
    [filteredItems],
  );
  const allPlaced = categoryOwnedCount > 0 && categoryPlacedCount === categoryOwnedCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+18px)]"
    >
      <div className="pointer-events-auto mx-auto max-w-[560px] rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(248,244,238,0.46))] p-3 shadow-[0_22px_42px_rgba(45,62,53,0.16)] backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#708177]">Inventory</p>
          <div className="text-right">
            <p className="text-[11px] text-[#8a978e]">
              {categoryOwnedCount} / {categoryTotalCount} unlocked
            </p>
            {allPlaced ? <p className="text-[10px] uppercase tracking-[0.16em] text-[#73857b]">All on lawn</p> : null}
          </div>
        </div>

        <div className="mb-3 inline-flex rounded-full border border-white/70 bg-white/46 p-1 shadow-[0_10px_20px_rgba(47,62,54,0.08)]">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategory(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === tab.key ? "bg-[#4b6154] text-white" : "text-[#718278]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid h-[228px] grid-flow-col grid-rows-[repeat(2,108px)] auto-cols-[84px] gap-x-4 gap-y-3 overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-none pb-1 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x [&::-webkit-scrollbar]:hidden">
          {filteredItems.map(({ asset, availableCount, isNew, isUnlocked, ownedCount, placed, placedCount, selected, stateLabel, subtitleLabel }) => {
            const Icon = asset.assetType === "landmark" ? MapPin : Sparkles;
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelectItem(asset.id)}
                title={asset.name}
                aria-label={`${asset.name}. ${stateLabel}.${subtitleLabel ? ` ${subtitleLabel}.` : ""} ${placedCount} of ${ownedCount} on lawn.`}
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
                  {isUnlocked && placed ? (
                    <span className="absolute bottom-0 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#4b6154] text-white shadow-[0_5px_10px_rgba(48,64,55,0.18)]">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  ) : null}
                  {isUnlocked && availableCount > 1 ? (
                    <span className="absolute left-1 top-1 rounded-full bg-[#41584b] px-1.5 py-0.5 text-[9px] font-medium leading-none text-white shadow-[0_6px_12px_rgba(48,64,55,0.18)]">
                      ×{availableCount}
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
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
