import { useMemo } from "react";
import type { MyScapePlacedLandmark } from "../../types";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";

interface MyScapeSceneProps {
  assets: UnlockedLandmarkAsset[];
  placedLandmarks: MyScapePlacedLandmark[];
  selectedId: string | null;
  boardWidth: number;
  boardHeight: number;
  onSelectItem: (itemId: string) => void;
}

const landmarkPalette = ["#9ab79e", "#7f9c8a", "#b79d7f", "#a5b9c7", "#a8c6ac", "#c4ae8d"];

const getLandmarkColor = (landmarkId: string) => {
  const hash = Array.from(landmarkId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return landmarkPalette[hash % landmarkPalette.length] ?? landmarkPalette[0];
};

const getLandmarkShape = (landmarkId: string) => {
  const hash = Array.from(landmarkId).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
  if (hash === 0) {
    return "inset(0 round 10px)";
  }
  if (hash === 1) {
    return "ellipse(40% 50% at 50% 50%)";
  }
  if (hash === 2) {
    return "polygon(50% 0%, 0% 100%, 100% 100%)";
  }
  return "inset(0 round 999px)";
};

export const MyScapeScene = ({
  assets,
  placedLandmarks,
  selectedId,
  boardWidth,
  boardHeight,
  onSelectItem,
}: MyScapeSceneProps) => {
  const assetMap = useMemo(() => new Map(assets.map((asset) => [asset.id, asset])), [assets]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[15%] h-[58%] w-[72%] -translate-x-1/2 rounded-[32%] bg-[radial-gradient(circle_at_40%_30%,rgba(255,255,255,0.86),rgba(255,255,255,0)_42%),linear-gradient(180deg,#dce8db_0%,#c4d7c6_100%)] shadow-[inset_0_-18px_32px_rgba(98,121,103,0.18)]" />
      <div className="absolute left-1/2 top-[70%] h-10 w-[66%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(70,88,52,0.18),rgba(70,88,52,0)_72%)] blur-md" />

      {placedLandmarks.map((item) => {
        const asset = assetMap.get(item.landmarkId);
        if (!asset) {
          return null;
        }

        const tilt = ((item.x / Math.max(boardWidth, 1)) - 0.5) * 18;
        const depth = ((item.y / Math.max(boardHeight, 1)) - 0.5) * 10;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item.id)}
            className="absolute rounded-[26px] px-3 py-2 text-left shadow-[0_18px_34px_rgba(35,52,40,0.14)] transition"
            style={{
              left: item.x,
              top: item.y,
              width: 92 * item.scale,
              height: 112 * item.scale,
              zIndex: item.zIndex,
              border: selectedId === item.id ? "2px solid rgba(94,119,102,0.55)" : "1px solid rgba(94,119,102,0.14)",
              background: selectedId === item.id
                ? "linear-gradient(180deg, rgba(241,245,240,0.98), rgba(214,227,215,0.98))"
                : "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(236,242,235,0.94))",
              transform: `perspective(900px) rotateX(58deg) rotateZ(${tilt + depth}deg)`,
            }}
            aria-label={`Select placed landmark ${asset.name}`}
          >
            <div
              className="mx-auto mt-1"
              style={{
                width: 38 * item.scale,
                height: 46 * item.scale,
                background: getLandmarkColor(asset.id),
                clipPath: getLandmarkShape(asset.id),
              }}
            />
            <p className="mt-3 text-[11px] font-semibold leading-4 text-ink">{asset.name}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-sage-500">{asset.city}</p>
          </button>
        );
      })}
    </div>
  );
};
