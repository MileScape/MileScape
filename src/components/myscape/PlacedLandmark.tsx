import { Landmark } from "lucide-react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { MyScapePlacedLandmark } from "../../types";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";
import { cn } from "../../utils/cn";

interface PlacedLandmarkProps {
  asset: UnlockedLandmarkAsset;
  item: MyScapePlacedLandmark;
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
  item,
  screenX,
  screenY,
  isEditMode,
  selected,
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
      left: screenX,
      top: screenY,
      transform: `translate(-50%, -100%) scale(${dragging ? item.scale * 1.05 : item.scale})`,
      transformOrigin: "bottom center",
      zIndex: dragging ? 999 : item.zIndex,
    }}
    aria-label={`Place ${asset.name}`}
  >
    {asset.imageSrc ? (
      <div className="relative min-w-[84px]">
        <div
          className={cn(
           "absolute left-1/2 top-full h-8 w-14 -translate-x-1/2 -translate-y-[18px] rounded-full bg-[radial-gradient(circle,rgba(68,86,73,0.22),rgba(68,86,73,0)_72%)] blur-[4px] transition duration-200",
            isEditMode && (selected || dragging) ? "scale-110 opacity-100" : "opacity-70",
          )}
        />
        <div
          className={cn(
            "relative flex items-end justify-center rounded-[18px] transition",
            isEditMode && (selected || dragging)
              ? "drop-shadow-[0_18px_28px_rgba(63,88,74,0.18)]"
              : "drop-shadow-[0_10px_16px_rgba(56,70,60,0.1)]",
          )}
        >
          <img
            src={asset.imageSrc}
            alt={asset.name}
            className={cn(
              "pointer-events-none max-h-[112px] w-auto max-w-[132px] object-contain",
              isEditMode && (selected || dragging) ? "brightness-[1.04] saturate-[1.02]" : "",
            )}
            draggable={false}
          />
        </div>
      </div>
    ) : (
      <div
        className={cn(
          "relative w-[96px] rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(241,246,241,0.92))] px-3 pb-3 pt-2 shadow-[0_18px_34px_rgba(44,62,49,0.14)] transition",
          isEditMode && (selected || dragging) ? "ring-2 ring-sage-300" : "ring-1 ring-sage-900/6",
        )}
      >
        <div className="absolute inset-x-4 bottom-[-10px] h-4 rounded-full bg-[radial-gradient(circle,rgba(68,86,73,0.24),rgba(68,86,73,0)_72%)] blur-[3px]" />
        <div className="mx-auto flex h-12 w-12 items-end justify-center rounded-[18px] bg-[linear-gradient(180deg,rgba(202,219,204,0.95),rgba(150,176,156,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/78 text-sage-700 shadow-[0_6px_16px_rgba(50,68,55,0.1)]">
            <Landmark className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 space-y-1">
          <p className="line-clamp-2 text-[11px] font-semibold leading-4 text-ink">{asset.name}</p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-sage-500">{asset.city}</p>
        </div>
      </div>
    )}
  </button>
);
