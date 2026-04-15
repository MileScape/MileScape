import type { Route, RouteTier } from "../types";

export const tierOrder: RouteTier[] = ["Starter", "Standard", "Advanced", "Premium"];

export const groupRoutesByTier = (routes: Route[]) =>
  tierOrder.map((tier) => ({
    tier,
    routes: routes.filter((route) => route.tier === tier && route.sourceType === "personal")
  }));

export const isRouteOwned = (routeId: string, purchasedRouteIds: string[]) =>
  purchasedRouteIds.includes(routeId);

export const canPurchaseRoute = (
  route: Route,
  currentStamps: number,
  purchasedRouteIds: string[],
) => !isRouteOwned(route.id, purchasedRouteIds) && currentStamps >= route.priceStamps;
