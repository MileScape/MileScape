import { useMemo, useState } from "react";
import { ShopRouteCard } from "../components/shop/ShopRouteCard";
import { StampBalanceCard } from "../components/shop/StampBalanceCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { groupRoutesByTier, tierOrder } from "../utils/shop";

export const ShopPage = () => {
  const { routes, state, purchaseRoute, t } = useAppState();
  const [activeTier, setActiveTier] = useState<(typeof tierOrder)[number] | "All">("All");
  const [toast, setToast] = useState<string | null>(null);

  const groups = useMemo(() => groupRoutesByTier(routes), [routes]);
  const visibleGroups = activeTier === "All" ? groups : groups.filter((group) => group.tier === activeTier);

  const handlePurchase = (routeId: string) => {
    const result = purchaseRoute(routeId);
    setToast(result.message);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="space-y-6">
      <StampBalanceCard
        currentStamps={state.currentStamps}
        totalStampsEarned={state.totalStampsEarned}
      />

      <section className="space-y-4">
        <SectionHeader
          eyebrow={t("app.shop")}
          title={t("shop.unlockDestinations")}
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["All", ...tierOrder] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setActiveTier(tier)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTier === tier ? "bg-sage-700 text-white" : "bg-white text-sage-700 ring-1 ring-sage-100"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </section>

      {toast ? (
        <div className="rounded-[24px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-card">
          {toast}
        </div>
      ) : null}

      <div className="space-y-8">
        {visibleGroups.map((group) => (
          <section key={group.tier} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">{group.tier}</h2>
              <p className="text-sm text-sage-500">{t("shop.destinations", { count: group.routes.length })}</p>
            </div>
            <div className="grid gap-4">
              {group.routes.map((route) => (
                <ShopRouteCard
                  key={route.id}
                  route={route}
                  currentStamps={state.currentStamps}
                  purchasedRouteIds={state.purchasedRouteIds}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
