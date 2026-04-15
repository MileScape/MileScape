import { CheckCircle2, Lock, MapPinned } from "lucide-react";
import type { Route } from "../../types";
import { formatDistance } from "../../utils/progress";
import { canPurchaseRoute, isRouteOwned } from "../../utils/shop";
import { Button } from "../ui/Button";

interface ShopRouteCardProps {
  route: Route;
  currentStamps: number;
  purchasedRouteIds: string[];
  onPurchase: (routeId: string) => void;
}

export const ShopRouteCard = ({
  route,
  currentStamps,
  purchasedRouteIds,
  onPurchase
}: ShopRouteCardProps) => {
  const owned = isRouteOwned(route.id, purchasedRouteIds);
  const purchasable = canPurchaseRoute(route, currentStamps, purchasedRouteIds);

  return (
    <article className="rounded-[28px] bg-white p-4 shadow-card ring-1 ring-sage-100">
      <div className="rounded-[24px] bg-gradient-to-br from-sage-50 to-sky-50 p-5 ring-1 ring-sage-100">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sage-700 ring-1 ring-sage-100">
            {route.tier}
          </span>
          {owned ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Owned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sage-500 ring-1 ring-sage-100">
              <Lock className="h-3.5 w-3.5" />
              Locked
            </span>
          )}
        </div>

        <div className="mt-8 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-sage-500">
              {route.city}, {route.country}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{route.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-sage-500">Price</p>
            <p className="mt-2 text-xl font-semibold text-ink">{route.priceStamps}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-sm leading-6 text-sage-700">{route.description}</p>
        <div className="flex items-center justify-between text-sm text-sage-600">
          <span className="inline-flex items-center gap-2">
            <MapPinned className="h-4 w-4" />
            {formatDistance(route.totalDistanceKm)}
          </span>
          <span>{route.landmarks.length} landmarks</span>
        </div>
        <Button
          fullWidth
          variant={owned ? "secondary" : "primary"}
          disabled={!owned && !purchasable}
          onClick={() => onPurchase(route.id)}
        >
          {owned ? "Owned" : purchasable ? `Unlock for ${route.priceStamps} Stamps` : "Insufficient Stamps"}
        </Button>
      </div>
    </article>
  );
};
