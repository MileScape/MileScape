import type { UnlockedLandmarkAsset } from "../../utils/myScape";

interface MyScapeAssetTrayProps {
  assets: UnlockedLandmarkAsset[];
  placedLandmarkIds: string[];
  onPlace: (landmarkId: string) => void;
}

export const MyScapeAssetTray = ({
  assets,
  placedLandmarkIds,
  onPlace,
}: MyScapeAssetTrayProps) => (
  <section className="rounded-[24px] bg-white/76 px-4 py-4 shadow-[0_16px_38px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sage-500">Asset Tray</p>
        <h3 className="mt-1 text-sm font-semibold text-ink">Unlocked landmarks</h3>
      </div>
      <span className="text-xs text-sage-500">{assets.length} items</span>
    </div>

    {assets.length > 0 ? (
      <div className="mt-4 grid grid-cols-2 gap-3">
        {assets.map((asset) => {
          const placed = placedLandmarkIds.includes(asset.id);
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onPlace(asset.id)}
              className="rounded-[18px] bg-sage-50/80 px-4 py-4 text-left ring-1 ring-sage-900/5 transition hover:bg-sage-100/80"
            >
              <p className="text-sm font-semibold text-ink">{asset.name}</p>
              <p className="mt-1 text-xs text-sage-500">{asset.city}</p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-sage-500">
                {placed ? "Placed" : "Tap to place"}
              </p>
            </button>
          );
        })}
      </div>
    ) : (
      <div className="mt-4 rounded-[18px] bg-sage-50/80 px-4 py-6 text-sm text-sage-500">
        Unlock landmarks from routes first, then they will appear here.
      </div>
    )}
  </section>
);
