import { paceCrews as initialPaceCrews } from "../data/paceCrews";
import { paceCrewMissions as initialPaceCrewMissions } from "../data/paceCrewMissions";
import { routes } from "../data/routes";
import { currentUserId } from "../data/users";
import type {
  AppState,
  AchievementTier,
  Decoration,
  Landmark,
  PaceCrewMission,
  Rarity,
  Route,
  RouteProgress,
  RunDataSource,
  RunHistoryItem,
  RunResultSummary,
  UserMissionState,
  WearableSyncRecord
} from "../types";
import { getAchievementTier } from "./achievement";
import { getMissionCompletionStampReward } from "./missionRewards";
import { createMembership, syncExpiredMissionStates } from "./paceCrew";
import { calculateEarnedStamps } from "./stamps";

const defaultPurchasedRouteIds = ["tokyo-city-route", "west-lake-loop", "central-park-loop"];

const createDefaultRouteProgress = (routeId: string): RouteProgress => ({
  routeId,
  completedDistanceKm: 0,
  unlockedLandmarkIds: [],
  decorations: {},
  runCount: 0,
  achievementTier: "none" as AchievementTier,
  completed: false
});

const createDefaultWearableSyncHistory = (): WearableSyncRecord[] => [];

export const createInitialState = (): AppState =>
  syncExpiredMissionStates({
    language: "en",
    selectedRouteId: defaultPurchasedRouteIds[0] ?? routes[0]?.id ?? null,
    routeProgress: routes.map((route) => createDefaultRouteProgress(route.id)),
    runHistory: [],
    currentStamps: 0,
    totalStampsEarned: 0,
    purchasedRouteIds: defaultPurchasedRouteIds,
    unlockedCrewDestinationIds: [],
    sliderMaxDistanceKm: 20,
    userPaceCrewState: {
      organizedCrewId: null,
      memberships: [createMembership("sunrise-collective", "member")]
    },
    paceCrews: initialPaceCrews,
    paceCrewMissions: initialPaceCrewMissions,
    userMissionStates: [],
    wearableConnection: null,
    wearableSyncHistory: createDefaultWearableSyncHistory(),
    lastRunResult: null
  });

export const normalizeState = (loadedState: Partial<AppState> | null): AppState => {
  const initialState = createInitialState();

  if (!loadedState) {
    return initialState;
  }

  const mergedProgress = routes.map((route) => {
    const existing = loadedState.routeProgress?.find((entry) => entry.routeId === route.id);
    const mergedEntry = {
      ...createDefaultRouteProgress(route.id),
      ...existing,
      decorations: existing?.decorations ?? {}
    };
    const normalizedUnlockedLandmarkIds = route.landmarks
      .filter((landmark) => landmark.milestoneKm <= mergedEntry.completedDistanceKm)
      .map((landmark) => landmark.id);

    return {
      ...mergedEntry,
      unlockedLandmarkIds: normalizedUnlockedLandmarkIds
    };
  });

  const purchasedRouteIds =
    loadedState.purchasedRouteIds && loadedState.purchasedRouteIds.length > 0
      ? Array.from(new Set([...defaultPurchasedRouteIds, ...loadedState.purchasedRouteIds]))
      : defaultPurchasedRouteIds;

  const selectedRouteId =
    loadedState.selectedRouteId && purchasedRouteIds.includes(loadedState.selectedRouteId)
      ? loadedState.selectedRouteId
      : purchasedRouteIds[0] ?? initialState.selectedRouteId;

  const memberships = loadedState.userPaceCrewState?.memberships ?? initialState.userPaceCrewState.memberships;

  return syncExpiredMissionStates({
    language: loadedState.language ?? "en",
    selectedRouteId,
    routeProgress: mergedProgress,
    runHistory: loadedState.runHistory?.map((item) => ({
      ...item,
      runTargetType: item.runTargetType ?? ("personal" as const)
    })) ?? [],
    currentStamps: loadedState.currentStamps ?? 0,
    totalStampsEarned: loadedState.totalStampsEarned ?? 0,
    purchasedRouteIds,
    unlockedCrewDestinationIds: loadedState.unlockedCrewDestinationIds ?? [],
    sliderMaxDistanceKm:
      loadedState.sliderMaxDistanceKm && loadedState.sliderMaxDistanceKm > 0
        ? Math.min(100, loadedState.sliderMaxDistanceKm)
        : 20,
    userPaceCrewState: {
      organizedCrewId: loadedState.userPaceCrewState?.organizedCrewId ?? null,
      memberships
    },
    paceCrews: loadedState.paceCrews ?? initialPaceCrews,
    paceCrewMissions: loadedState.paceCrewMissions ?? initialPaceCrewMissions,
    userMissionStates:
      loadedState.userMissionStates?.map((missionState) => ({
        ...missionState,
        completedDistanceKm: missionState.completedDistanceKm ?? 0
      })) ?? [],
    wearableConnection: loadedState.wearableConnection ?? null,
    wearableSyncHistory: loadedState.wearableSyncHistory ?? createDefaultWearableSyncHistory(),
    lastRunResult: loadedState.lastRunResult
      ? {
          ...loadedState.lastRunResult,
          droppedDecorations: loadedState.lastRunResult.droppedDecorations ?? [],
          updatedDecorations: loadedState.lastRunResult.updatedDecorations ?? {}
        }
      : null
  });
};

export const getRouteProgress = (routeId: string, state: AppState): RouteProgress =>
  state.routeProgress.find((entry) => entry.routeId === routeId) ?? createDefaultRouteProgress(routeId);

export const getProgressPercent = (route: Route, completedDistanceKm: number) =>
  Math.min(100, Math.round((completedDistanceKm / route.totalDistanceKm) * 100));

export const formatDistance = (distanceKm: number) => `${Number(distanceKm.toFixed(1))} km`;

export const calculateUnlockedLandmarks = (route: Route, completedDistanceKm: number): Landmark[] =>
  route.landmarks.filter((landmark) => landmark.milestoneKm <= completedDistanceKm);

export function getRarityRates(runCount: number): Record<Rarity, number> {
  if (runCount >= 10) {
    return {
      common: 48,
      rare: 34,
      epic: 14,
      legendary: 4,
    };
  }

  if (runCount >= 6) {
    return {
      common: 55,
      rare: 30,
      epic: 12,
      legendary: 3,
    };
  }

  if (runCount >= 3) {
    return {
      common: 62,
      rare: 26,
      epic: 10,
      legendary: 2,
    };
  }

  return {
    common: 70,
    rare: 22,
    epic: 7,
    legendary: 1,
  };
}

export const rollRarity = (rates: Record<Rarity, number>): Rarity => {
  const rarityOrder: Rarity[] = ["common", "rare", "epic", "legendary"];
  const totalWeight = rarityOrder.reduce((sum, rarity) => sum + Math.max(0, rates[rarity] ?? 0), 0);

  if (totalWeight <= 0) {
    return "common";
  }

  let roll = Math.random() * totalWeight;

  for (const rarity of rarityOrder) {
    roll -= Math.max(0, rates[rarity] ?? 0);
    if (roll < 0) {
      return rarity;
    }
  }

  return "common";
};

export const rollDecorations = (
  routeDecorations: Decoration[] | undefined,
  rarityRates: Record<Rarity, number>,
  lootRolls: number,
): Decoration[] => {
  if (!routeDecorations || routeDecorations.length === 0 || lootRolls <= 0) {
    return [];
  }

  const decorationsByRarity = routeDecorations.reduce<Record<Rarity, Decoration[]>>(
    (accumulator, decoration) => {
      accumulator[decoration.rarity].push(decoration);
      return accumulator;
    },
    { common: [], rare: [], epic: [], legendary: [] },
  );

  const availableRarities = (["common", "rare", "epic", "legendary"] as Rarity[]).filter(
    (rarity) => decorationsByRarity[rarity].length > 0,
  );

  if (availableRarities.length === 0) {
    return [];
  }

  return Array.from({ length: lootRolls }, () => {
    let selectedRarity = rollRarity(rarityRates);

    if (decorationsByRarity[selectedRarity].length === 0) {
      const fallbackRates = availableRarities.reduce<Record<Rarity, number>>(
        (accumulator, rarity) => ({
          ...accumulator,
          [rarity]: rarityRates[rarity],
        }),
        { common: 0, rare: 0, epic: 0, legendary: 0 },
      );
      selectedRarity = rollRarity(fallbackRates);
    }

    const rarityPool = decorationsByRarity[selectedRarity];
    const selectionIndex = Math.floor(Math.random() * rarityPool.length);
    return rarityPool[selectionIndex] ?? decorationsByRarity[availableRarities[0]][0];
  }).filter((decoration): decoration is Decoration => Boolean(decoration));
};

export const addDecorationCounts = (
  currentDecorations: Record<string, number> | undefined,
  droppedDecorations: Decoration[],
): Record<string, number> => {
  const nextDecorations = { ...(currentDecorations ?? {}) };

  for (const decoration of droppedDecorations) {
    nextDecorations[decoration.id] = (nextDecorations[decoration.id] ?? 0) + 1;
  }

  return nextDecorations;
};

const buildRunHistoryItem = (
  input:
    | {
        targetType: "personal";
        routeId: string;
        distanceKm: number;
        plannedDistanceKm?: number;
        dataSource?: RunDataSource;
        sourceName?: string;
      }
    | {
        targetType: "pacecrew_mission";
        missionId: string;
        crewId: string;
        distanceKm: number;
        plannedDistanceKm?: number;
        dataSource?: RunDataSource;
        sourceName?: string;
      },
): RunHistoryItem => ({
  id: crypto.randomUUID(),
  runTargetType: input.targetType,
  routeId: input.targetType === "personal" ? input.routeId : undefined,
  missionId: input.targetType === "pacecrew_mission" ? input.missionId : undefined,
  crewId: input.targetType === "pacecrew_mission" ? input.crewId : undefined,
  distanceKm: input.distanceKm,
  plannedDistanceKm: input.plannedDistanceKm,
  dataSource: input.dataSource,
  sourceName: input.sourceName,
  completedAt: new Date().toISOString()
});

export const applyPersonalRunToState = (
  previousState: AppState,
  route: Route,
  distanceKm: number,
  options?: {
    plannedDistanceKm?: number;
    dataSource?: RunDataSource;
    sourceName?: string;
    fallbackReason?: string;
  },
): { nextState: AppState; summary: RunResultSummary } => {
  const routeProgress = getRouteProgress(route.id, previousState);
  const previousDistanceKm = routeProgress.completedDistanceKm;
  const remainingDistanceKm = Math.max(0, route.totalDistanceKm - previousDistanceKm);
  const appliedDistanceKm = Math.min(distanceKm, remainingDistanceKm);
  const overflowDistanceKm = Math.max(0, distanceKm - remainingDistanceKm);
  const updatedDistanceKm = Math.min(route.totalDistanceKm, previousDistanceKm + appliedDistanceKm);
  const earnedStamps = calculateEarnedStamps(distanceKm);
  const updatedStampsBalance = previousState.currentStamps + earnedStamps;
  const unlockedLandmarks = calculateUnlockedLandmarks(route, updatedDistanceKm);
  const newlyUnlockedLandmarks = unlockedLandmarks.filter(
    (landmark) => !routeProgress.unlockedLandmarkIds.includes(landmark.id),
  );
  const completed = updatedDistanceKm >= route.totalDistanceKm;
  const updatedRunCount = routeProgress.runCount + 1;
  const updatedAchievementTier = getAchievementTier(updatedRunCount);
  const lootRolls = Math.max(1, Math.ceil(distanceKm / 2));
  const rarityRates = getRarityRates(updatedRunCount);
  const droppedDecorations = rollDecorations(route.decorations, rarityRates, lootRolls);
  const updatedDecorations = addDecorationCounts(routeProgress.decorations, droppedDecorations);

  const nextRouteProgress: RouteProgress = {
    routeId: route.id,
    completedDistanceKm: updatedDistanceKm,
    unlockedLandmarkIds: unlockedLandmarks.map((landmark) => landmark.id),
    decorations: updatedDecorations,
    runCount: updatedRunCount,
    achievementTier: updatedAchievementTier,
    completed
  };

  const summary: RunResultSummary = {
    routeId: route.id,
    runTargetType: "personal",
    runDistanceKm: distanceKm,
    plannedDistanceKm: options?.plannedDistanceKm,
    dataSource: options?.dataSource,
    sourceName: options?.sourceName,
    fallbackReason: options?.fallbackReason,
    appliedDistanceKm,
    overflowDistanceKm,
    previousDistanceKm,
    updatedDistanceKm,
    earnedStamps,
    missionRewardStamps: 0,
    depositReturnedStamps: 0,
    updatedStampsBalance,
    updatedRunCount,
    updatedAchievementTier,
    newlyUnlockedLandmarks,
    droppedDecorations,
    updatedDecorations,
    destinationCompletedAfterRun: completed,
    unlockedDestinationIds: []
  };

  return {
    nextState: {
      ...previousState,
      selectedRouteId: route.id,
      routeProgress: previousState.routeProgress.map((entry) =>
        entry.routeId === route.id ? nextRouteProgress : entry,
      ),
      runHistory: [
        buildRunHistoryItem({
          targetType: "personal",
          routeId: route.id,
          distanceKm,
          plannedDistanceKm: options?.plannedDistanceKm,
          dataSource: options?.dataSource,
          sourceName: options?.sourceName
        }),
        ...previousState.runHistory
      ],
      currentStamps: updatedStampsBalance,
      totalStampsEarned: previousState.totalStampsEarned + earnedStamps,
      lastRunResult: summary
    },
    summary
  };
};

export const applyMissionRunToState = (
  previousState: AppState,
  mission: PaceCrewMission,
  distanceKm: number,
  options?: {
    plannedDistanceKm?: number;
    dataSource?: RunDataSource;
    sourceName?: string;
    fallbackReason?: string;
  },
): { nextState: AppState; summary: RunResultSummary } => {
  const missionState = previousState.userMissionStates.find(
    (entry) => entry.missionId === mission.id && entry.userId === currentUserId,
  );

  if (!missionState || missionState.status !== "accepted") {
    throw new Error("Mission must be accepted before running");
  }

  const previousDistanceKm = missionState.completedDistanceKm ?? 0;
  const remainingDistanceKm = Math.max(0, mission.targetDistanceKm - previousDistanceKm);
  const appliedDistanceKm = Math.min(distanceKm, remainingDistanceKm);
  const overflowDistanceKm = Math.max(0, distanceKm - remainingDistanceKm);
  const updatedDistanceKm = Math.min(mission.targetDistanceKm, previousDistanceKm + distanceKm);
  const missionCompletedAfterRun = updatedDistanceKm >= mission.targetDistanceKm;

  const baseRunStamps = calculateEarnedStamps(distanceKm);
  const rewardBundle = missionCompletedAfterRun
    ? getMissionCompletionStampReward(distanceKm, mission.rewardStamps, missionState.depositPaid)
    : {
        baseRunStamps,
        missionRewardStamps: 0,
        depositReturnedStamps: 0,
        totalAwardedStamps: baseRunStamps
      };
  const updatedStampsBalance = previousState.currentStamps + rewardBundle.totalAwardedStamps;

  const unlockedDestinationIds =
    missionCompletedAfterRun && mission.destinationRewardId ? [mission.destinationRewardId] : [];

  const nextMissionState: UserMissionState = {
    ...missionState,
    completedDistanceKm: updatedDistanceKm,
    status: missionCompletedAfterRun ? "completed" : missionState.status
  };

  const summary: RunResultSummary = {
    missionId: mission.id,
    crewId: mission.crewId,
    runTargetType: "pacecrew_mission",
    runDistanceKm: distanceKm,
    plannedDistanceKm: options?.plannedDistanceKm,
    dataSource: options?.dataSource,
    sourceName: options?.sourceName,
    fallbackReason: options?.fallbackReason,
    appliedDistanceKm,
    overflowDistanceKm,
    previousDistanceKm,
    updatedDistanceKm,
    earnedStamps: rewardBundle.baseRunStamps,
    missionRewardStamps: rewardBundle.missionRewardStamps,
    depositReturnedStamps: rewardBundle.depositReturnedStamps,
    updatedStampsBalance,
    updatedRunCount: 0,
    updatedAchievementTier: "none",
    newlyUnlockedLandmarks: [],
    droppedDecorations: [],
    updatedDecorations: {},
    destinationCompletedAfterRun: false,
    missionCompletedAfterRun,
    unlockedDestinationIds
  };

  return {
    nextState: {
      ...previousState,
      userMissionStates: previousState.userMissionStates.map((entry) =>
        entry.missionId === mission.id && entry.userId === currentUserId ? nextMissionState : entry,
      ),
      unlockedCrewDestinationIds: Array.from(
        new Set([...previousState.unlockedCrewDestinationIds, ...unlockedDestinationIds]),
      ),
      runHistory: [
        buildRunHistoryItem({
          targetType: "pacecrew_mission",
          missionId: mission.id,
          crewId: mission.crewId,
          distanceKm,
          plannedDistanceKm: options?.plannedDistanceKm,
          dataSource: options?.dataSource,
          sourceName: options?.sourceName
        }),
        ...previousState.runHistory
      ],
      currentStamps: updatedStampsBalance,
      totalStampsEarned: previousState.totalStampsEarned + rewardBundle.totalAwardedStamps,
      lastRunResult: summary
    },
    summary
  };
};
