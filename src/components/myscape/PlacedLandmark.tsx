import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { MyScapePlacedLandmark } from "../../types";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";
import { cn } from "../../utils/cn";

interface PlacedLandmarkProps {
  asset: UnlockedLandmarkAsset;
  animateIn?: boolean;
  editable?: boolean;
  item: MyScapePlacedLandmark;
  index?: number;
  screenX: number;
  screenY: number;
  isEditMode: boolean;
  selected: boolean;
  dragging: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => void;
  onSelect: (itemId: string) => void;
}

export const PlacedLandmark = ({
  asset,
  animateIn = false,
  editable = false,
  item,
  index = 0,
  screenX,
  screenY,
  isEditMode,
  selected: _selected,
  dragging,
  onPointerDown,
  onSelect,
}: PlacedLandmarkProps) => (
  <button
    type="button"
    onPointerDown={(event) => onPointerDown(event, item.id)}
    onClick={() => onSelect(item.id)}
    className={cn(
      "absolute touch-none select-none text-left transition duration-200 ease-out",
      isEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-default",
    )}
    style={{
      left: screenX + (asset.offsetX ?? 0),
      top: screenY + (asset.offsetY ?? 0),
      transform: `translate(-50%, -100%) scale(${dragging ? item.scale * 1.05 : item.scale})`,
      transformOrigin: "bottom center",
      zIndex: dragging ? 999 : item.zIndex,
    }}
    aria-label={`${asset.name} on your lawn`}
  >
    {asset.imageSrc ? (
      <motion.div
        className="relative min-w-[84px]"
        animate={
          editable && !dragging
            ? { scale: [1.015, 1.025, 1.015], y: [-2, -4, -2] }
            : animateIn
              ? { scale: 1, y: 0 }
              : { scale: 1, y: 0 }
        }
        transition={
          editable && !dragging
            ? { duration: 2.8, delay: index * 0.03, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.36, delay: index * 0.045, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <div
          className={cn(
           "absolute left-1/2 top-full h-7 w-12 -translate-x-1/2 -translate-y-[18px] rounded-full bg-[radial-gradient(circle,rgba(68,86,73,0.08),rgba(68,86,73,0)_72%)] blur-[3px] transition duration-200",
            dragging ? "opacity-32" : editable ? "opacity-26" : "opacity-18",
          )}
        />
        <div className="relative flex items-end justify-center rounded-[18px] transition">
          <img
            src={asset.imageSrc}
            alt={asset.name}
            className="pointer-events-none max-h-[112px] w-auto max-w-[132px] object-contain"
            draggable={false}
          />
        </div>
      </motion.div>
    ) : (
      <motion.div
        className={cn(
          "relative w-[96px] rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(241,246,241,0.92))] px-3 pb-3 pt-2 transition",
          dragging ? "ring-1 ring-sage-300/50" : "ring-1 ring-sage-900/6",
        )}
        animate={
          editable && !dragging
            ? { scale: [1.015, 1.025, 1.015], y: [-2, -4, -2] }
            : animateIn
              ? { scale: 1, y: 0 }
              : { scale: 1, y: 0 }
        }
        transition={
          editable && !dragging
            ? { duration: 2.8, delay: index * 0.03, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.36, delay: index * 0.045, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <div className="absolute inset-x-4 bottom-[-10px] h-4 rounded-full bg-[radial-gradient(circle,rgba(68,86,73,0.08),rgba(68,86,73,0)_72%)] blur-[3px]" />
        <div className="mx-auto flex h-12 w-12 items-end justify-center rounded-[18px] bg-[linear-gradient(180deg,rgba(202,219,204,0.95),rgba(150,176,156,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/78 text-sage-700">
            <Landmark className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 space-y-1">
          <p className="line-clamp-2 text-[11px] font-semibold leading-4 text-ink">{asset.name}</p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-sage-500">{asset.city}</p>
        </div>
      </motion.div>
    )}
  </button>
);
