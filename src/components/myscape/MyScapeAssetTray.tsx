import { CheckCircle2, Plus } from "lucide-react";
import type { UnlockedLandmarkAsset } from "../../utils/myScape";
import { cn } from "../../utils/cn";

interface MyScapeAssetTrayProps {
  assets: UnlockedLandmarkAsset[];
  placedLandmarkIds: string[];
  onPlace: (landmarkId: string) => void;
}

export const MyScapeAssetTray = ({ assets, placedLandmarkIds, onPlace }: MyScapeAssetTrayProps) => (
  <section className="rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(247,245,240,0.92))] p-4 shadow-[0_24px_54px_rgba(38,56,44,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sage-500">Unlocked Collection</p>
        <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.03em] text-ink">Landmark Tray</h2>
      </div>
      <p className="text-xs text-sage-500">{assets.length} collectible pieces</p>
    </div>

    <div className="flex gap-3 overflow-x-auto pb-1">
      {assets.map((asset) => {
        const isPlaced = placedLandmarkIds.includes(asset.id);

        return (
          <button
            key={`${asset.routeId}-${asset.id}`}
            type="button"
            onClick={() => onPlace(asset.id)}
            disabled={isPlaced}
            className={cn(
              "min-w-[172px] rounded-[26px] border px-4 py-4 text-left transition disabled:cursor-not-allowed",
              isPlaced
                ? "border-sage-200 bg-[linear-gradient(180deg,rgba(242,247,242,0.92),rgba(255,255,255,0.88))]"
                : "border-white/75 bg-white/78 hover:bg-white",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(180deg,rgba(191,212,195,0.95),rgba(149,175,156,0.95))] text-white shadow-[0_10px_22px_rgba(62,85,69,0.14)]">
                <Plus className="h-4 w-4" />
              </div>
              {isPlaced ? <CheckCircle2 className="h-4 w-4 text-sage-500" /> : null}
            </div>
            <div className="mt-4 space-y-1.5">
              <p className="text-sm font-semibold text-ink">{asset.name}</p>
              <p className="text-xs leading-5 text-sage-600">{asset.routeName}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-sage-500">
                {isPlaced ? "Placed on board" : `${asset.city}, ${asset.country}`}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  </section>
);
