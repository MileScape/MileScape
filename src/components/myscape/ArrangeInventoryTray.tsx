import { motion } from "framer-motion";
import { Check, MapPin, Sparkles } from "lucide-react";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";

interface ArrangeInventoryTrayItem {
  asset: UnlockedLandmarkAsset;
  isNew: boolean;
  placed: boolean;
  selected: boolean;
  statusLabel: "Available" | "Placed" | "New";
}

interface ArrangeInventoryTrayProps {
  items: ArrangeInventoryTrayItem[];
  onSelectItem: (assetId: string) => void;
}

export const ArrangeInventoryTray = ({ items, onSelectItem }: ArrangeInventoryTrayProps) => (
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
        <p className="text-[11px] text-[#8a978e]">{items.length} items</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ asset, isNew, placed, selected, statusLabel }) => {
          const Icon = asset.assetType === "landmark" ? MapPin : Sparkles;
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelectItem(asset.id)}
              className={`w-[108px] flex-none rounded-[22px] border px-3 py-3 text-left shadow-[0_10px_20px_rgba(47,62,54,0.08)] backdrop-blur-xl transition ${
                selected
                  ? "border-white/75 bg-[#eef2ea]/88 ring-1 ring-[#91a497]/34"
                  : "border-white/70 bg-white/56 hover:bg-white/64"
              }`}
            >
              <div className="flex h-14 items-center justify-center rounded-[16px] bg-[linear-gradient(180deg,rgba(249,246,241,0.88),rgba(235,239,232,0.82))]">
                {asset.imageSrc ? (
                  <img src={asset.imageSrc} alt={asset.name} className="max-h-12 max-w-[72px] object-contain" draggable={false} />
                ) : (
                  <Icon className="h-5 w-5 text-[#66786e]" />
                )}
                {isNew ? <span className="myscape-sparkle-marker absolute right-2 top-2" /> : null}
              </div>
              <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4 text-[#2f3e36]">{asset.name}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-[9px] uppercase tracking-[0.18em] ${isNew ? "text-[#b97d3e]" : "text-[#85938a]"}`}>
                  {statusLabel}
                </span>
                {placed && !isNew ? <Check className="h-3.5 w-3.5 text-[#4f6658]" /> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </motion.div>
);
