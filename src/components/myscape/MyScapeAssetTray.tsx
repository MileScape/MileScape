import { Flower2, Lamp, Landmark, PackageOpen, Shrub, TrafficCone, TreePine } from "lucide-react";
import type { MyScapePlacedLandmark } from "../../types";
import type { MyScapeAsset } from "../../utils/myScape";
import { cn } from "../../utils/cn";
import { formatCountryName } from "../../utils/location";

interface MyScapeAssetTrayProps {
  assets: MyScapeAsset[];
  placedItems: MyScapePlacedLandmark[];
  onPlace: (assetId: string) => void;
}

const iconByDecorationId = {
  "capsule-road-cone": TrafficCone,
  "capsule-shrub": Shrub,
  "capsule-maple-tree": TreePine,
  "capsule-stone-lamp": Lamp,
  "capsule-picnic-cloth": Flower2,
} as const;

const getFallbackIcon = (asset: MyScapeAsset) => {
  if (asset.assetType === "landmark") {
    return Landmark;
  }

  return iconByDecorationId[asset.id as keyof typeof iconByDecorationId] ?? PackageOpen;
};

export const MyScapeAssetTray = ({ assets, placedItems, onPlace }: MyScapeAssetTrayProps) => (
  <section className="rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(246,242,233,0.96))] p-4 shadow-[0_20px_42px_rgba(38,56,44,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-sage-500">Box / Backpack</p>
        <h2 className="mt-1 text-[1.08rem] font-semibold tracking-[-0.03em] text-ink">Stored Pieces</h2>
      </div>
      <p className="text-xs text-sage-500">{assets.length} items</p>
    </div>

    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
      {assets.map((asset) => {
        const placedCount = placedItems.filter((item) => item.landmarkId === asset.id).length;
        const isPlaced = placedCount > 0;
        const FallbackIcon = getFallbackIcon(asset);

        return (
          <button
            key={`${asset.assetType}-${asset.routeId}-${asset.id}`}
            type="button"
            onClick={() => onPlace(asset.id)}
            disabled={isPlaced}
            className={cn(
              "min-w-[176px] rounded-[22px] border px-3 py-3 text-left transition disabled:cursor-not-allowed",
              isPlaced
                ? "border-sage-200 bg-[linear-gradient(180deg,rgba(241,246,241,0.92),rgba(255,255,255,0.88))]"
                : "border-white/75 bg-white/78 hover:bg-white",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,rgba(191,212,195,0.95),rgba(149,175,156,0.95))] text-white shadow-[0_10px_22px_rgba(62,85,69,0.14)]">
                {asset.imageSrc ? (
                  <img src={asset.imageSrc} alt={asset.name} className="h-7 w-7 object-contain" draggable={false} />
                ) : (
                  <FallbackIcon className="h-4.5 w-4.5" />
                )}
              </div>
              <span className="rounded-full bg-sage-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-sage-600">
                {asset.assetType === "landmark" ? "Land" : "Decor"}
              </span>
            </div>

            <div className="mt-3 space-y-1">
              <p className="line-clamp-2 text-sm font-semibold leading-5 text-ink">{asset.name}</p>
              <p className="line-clamp-1 text-[11px] text-sage-600">{asset.routeName}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-sage-500">
                {asset.city}, {formatCountryName(asset.country)}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-sage-500">
                {isPlaced ? "On lawn" : "Stored"}
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em]",
                  isPlaced ? "bg-sage-100 text-sage-500" : "bg-ink text-white",
                )}
              >
                {isPlaced ? `${placedCount}x` : "Place"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  </section>
);
