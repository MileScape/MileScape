import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { MyScapePlacedLandmark } from "../../types";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";
import { PlacedLandmark } from "./PlacedLandmark";

interface MyScapeBoardProps {
  boardRef: RefObject<HTMLDivElement>;
  assets: UnlockedLandmarkAsset[];
  placedLandmarks: MyScapePlacedLandmark[];
  selectedId: string | null;
  expanded?: boolean;
  onItemPointerDown: (event: ReactPointerEvent<HTMLButtonElement>, itemId: string) => void;
  onSelectItem: (itemId: string) => void;
}

export const MyScapeBoard = ({
  boardRef,
  assets,
  placedLandmarks,
  selectedId,
  expanded = false,
  onItemPointerDown,
  onSelectItem,
}: MyScapeBoardProps) => {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden bg-[linear-gradient(180deg,#f6f4ee_0%,#eef2eb_36%,#edf1ea_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(255,255,255,0)_46%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(238,242,235,0)_0%,rgba(238,242,235,0.88)_100%)]" />
      <div className="absolute inset-x-4 top-6 h-24 rounded-full bg-[radial-gradient(circle,rgba(190,213,195,0.3),rgba(190,213,195,0)_72%)] blur-2xl" />
      <div
        className={`absolute left-1/2 rounded-full bg-[radial-gradient(circle,rgba(57,77,63,0.14),rgba(57,77,63,0)_72%)] blur-md ${
          expanded ? "bottom-10 h-20 w-[364px] -translate-x-1/2" : "bottom-14 h-16 w-[306px] -translate-x-1/2"
        }`}
      />

      <div
        className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 ${
          expanded ? "top-[48%] h-[356px] w-[424px]" : "top-[49%] h-[327px] w-[386px]"
        }`}
      >
        <svg viewBox="0 0 296 250" className="h-full w-full overflow-visible">
            <defs>
              <linearGradient id="myscape-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e9f0e7" />
                <stop offset="48%" stopColor="#d7e4d5" />
                <stop offset="100%" stopColor="#bdd0c0" />
              </linearGradient>
              <linearGradient id="myscape-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8ea192" />
                <stop offset="100%" stopColor="#6f8374" />
              </linearGradient>
              <linearGradient id="myscape-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7b8f80" />
                <stop offset="100%" stopColor="#607367" />
              </linearGradient>
              <linearGradient id="myscape-soil-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#98866d" />
                <stop offset="100%" stopColor="#7c6b55" />
              </linearGradient>
              <linearGradient id="myscape-soil-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#877662" />
                <stop offset="100%" stopColor="#6e5e4d" />
              </linearGradient>
              <pattern id="myscape-soil-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="6" fill="rgba(134,115,91,0.24)" />
                <circle cx="23" cy="22" r="5" fill="rgba(171,152,126,0.14)" />
              </pattern>
            </defs>

            <polygon points="148,24 280,94 148,164 16,94" fill="url(#myscape-top)" />
            <polygon points="16,94 148,164 148,208 16,146" fill="url(#myscape-left)" />
            <polygon points="280,94 148,164 148,208 280,146" fill="url(#myscape-right)" />

            <polygon points="16,104 148,172 148,208 16,146" fill="url(#myscape-soil-left)" />
            <polygon points="280,104 148,172 148,208 280,146" fill="url(#myscape-soil-right)" />
            <polygon points="16,104 148,172 148,208 16,146" fill="url(#myscape-soil-dots)" opacity="0.9" />
            <polygon points="280,104 148,172 148,208 280,146" fill="url(#myscape-soil-dots)" opacity="0.78" />

            <polygon points="148,24 280,94 148,164 16,94" fill="rgba(255,255,255,0.08)" />
            <path d="M148 24 L280 94" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
            <path d="M148 24 L16 94" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <path d="M16 94 L148 164 L280 94" fill="none" stroke="rgba(96,121,109,0.24)" strokeWidth="1.5" />
            <path d="M16 94 L16 146 L148 208 L280 146 L280 94" fill="none" stroke="rgba(70,88,52,0.14)" strokeWidth="1.5" />
        </svg>
        <div
          ref={boardRef}
          className={expanded ? "absolute left-[26px] top-[14px] h-[208px] w-[344px]" : "absolute left-[24px] top-[14px] h-[189px] w-[311px]"}
        >
          {placedLandmarks.map((item) => {
            const asset = assetMap.get(item.landmarkId);
            if (!asset) {
              return null;
            }

            return (
              <PlacedLandmark
                key={item.id}
                asset={asset}
                item={item}
                selected={selectedId === item.id}
                onPointerDown={onItemPointerDown}
                onSelect={onSelectItem}
              />
            );
          })}
        </div>
      </div>

      {placedLandmarks.length === 0 ? (
        <div className="pointer-events-none absolute left-1/2 top-[43%] z-10 flex w-[220px] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[28px] bg-white/60 px-5 py-4 text-center shadow-[0_18px_36px_rgba(35,52,40,0.08)] ring-1 ring-white/80 backdrop-blur">

          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sage-500">Under Construction</p>

        </div>
      ) : null}
    </div>
  );
};
