export const isRouteOwned = (routeId: string, purchasedRouteIds: string[]) =>
  purchasedRouteIds.includes(routeId);
