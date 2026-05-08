import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { routes } from "../data/routes";
import { currentUserId, users } from "../data/users";
import type { AppContextValue, AppState, PaceCrewMission, WearableSyncRecord } from "../types";
import { translate } from "../utils/i18n";
import {
  clearMyScapeCapsuleState,
  clearState,
  loadMyScapeCapsuleRouteTicketIds,
  loadState,
  MY_SCAPE_CAPSULE_STATE_KEY,
  MY_SCAPE_CAPSULE_STATE_UPDATED_EVENT,
  saveState,
} from "../utils/storage";
import { applyMissionRunToState, applyPersonalRunToState, createInitialState, normalizeState } from "../utils/progress";
import {
  createMembership,
  getMissionById,
  isCrewOrganizer,
  isRouteOwnedInPaceport,
  reconcilePaceCrewMembershipUnlockRouteIds,
  syncExpiredMissionStates
} from "../utils/paceCrew";

export const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

const createCrewId = (name: string) =>
  `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}-${crypto.randomUUID().slice(0, 6)}`;

const createMissionId = (title: string) =>
  `${title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}-${crypto.randomUUID().slice(0, 6)}`;

const areMissionStatesEqual = (left: AppState["userMissionStates"], right: AppState["userMissionStates"]) =>
  left.length === right.length &&
  left.every((entry, index) => {
    const other = right[index];
    return (
      other &&
      entry.missionId === other.missionId &&
      entry.crewId === other.crewId &&
      entry.userId === other.userId &&
      entry.acceptedAt === other.acceptedAt &&
      entry.status === other.status &&
      entry.depositPaid === other.depositPaid &&
      entry.completedDistanceKm === other.completedDistanceKm
    );
  });

const areStringArraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((entry, index) => entry === right[index]);

const getSafeCapsuleRouteTicketIds = (routeIds: string[]) => {
  const personalRouteIds = new Set(
    routes.filter((route) => route.sourceType === "personal" && route.crewOnly !== true).map((route) => route.id),
  );
  return routeIds.filter((routeId) => personalRouteIds.has(routeId));
};

const DEMO_STAMP_BALANCE = 99999;
const DEMO_LOCKED_ROUTE_IDS = ["paris-eiffel-route", "california-discovery-route", "taipei-skyline-route"];
const demoLockedRouteIdSet = new Set(DEMO_LOCKED_ROUTE_IDS);

const getDemoPersonalRouteIds = () =>
  routes
    .filter((route) => route.sourceType === "personal" && !demoLockedRouteIdSet.has(route.id))
    .map((route) => route.id);

const getDemoCrewRouteIds = () => routes.filter((route) => route.sourceType === "pacecrew").map((route) => route.id);

const createDemoRunHistory = (): AppState["runHistory"] => {
  const today = new Date();
  const atDaysAgo = (daysAgo: number, hour: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    date.setHours(hour, 20, 0, 0);
    return date.toISOString();
  };

  return [
    { id: "demo-run-tokyo-today", routeId: "tokyo-city-route", runTargetType: "personal", distanceKm: 6.4, completedAt: atDaysAgo(0, 8) },
    { id: "demo-run-london-yesterday", routeId: "london-landmark-route", runTargetType: "personal", distanceKm: 8.2, completedAt: atDaysAgo(1, 18) },
    { id: "demo-run-cairo-two-days", routeId: "cairo-pyramid-route", runTargetType: "personal", distanceKm: 5.7, completedAt: atDaysAgo(2, 7) },
    { id: "demo-run-barcelona-three-days", routeId: "barcelona-coast-route", runTargetType: "personal", distanceKm: 7.1, completedAt: atDaysAgo(3, 17) },
  ];
};

const buildDemoState = (routeAccessState: AppState): AppState => {
  const unlockedPersonalRouteIds = getDemoPersonalRouteIds();
  const unlockedCrewRouteIds = getDemoCrewRouteIds();
  const ownedRouteIdSet = new Set([...unlockedPersonalRouteIds, ...unlockedCrewRouteIds]);
  const demoHistory = [...createDemoRunHistory(), ...routeAccessState.runHistory];

  return {
    ...routeAccessState,
    routeProgress: routes.map((route) => {
      const existingProgress = routeAccessState.routeProgress.find((entry) => entry.routeId === route.id);
      const isDemoOwned = ownedRouteIdSet.has(route.id);

      return {
        routeId: route.id,
        completedDistanceKm: isDemoOwned ? Math.max(existingProgress?.completedDistanceKm ?? 0, route.totalDistanceKm * 0.72) : existingProgress?.completedDistanceKm ?? 0,
        unlockedLandmarkIds: isDemoOwned
          ? route.landmarks.map((landmark) => landmark.id)
          : existingProgress?.unlockedLandmarkIds ?? [],
        decorations: isDemoOwned
          ? Object.fromEntries((route.decorations ?? []).map((decoration) => [decoration.id, Math.max(1, existingProgress?.decorations?.[decoration.id] ?? 0)]))
          : existingProgress?.decorations ?? {},
        runCount: isDemoOwned ? Math.max(existingProgress?.runCount ?? 0, 2) : existingProgress?.runCount ?? 0,
        achievementTier: existingProgress?.achievementTier ?? "none",
        completed: existingProgress?.completed ?? false,
      };
    }),
    runHistory: demoHistory,
    currentStamps: DEMO_STAMP_BALANCE,
    totalStampsEarned: Math.max(routeAccessState.totalStampsEarned, DEMO_STAMP_BALANCE),
    purchasedRouteIds: Array.from(new Set([...unlockedPersonalRouteIds, ...routeAccessState.purchasedRouteIds])),
    unlockedCrewDestinationIds: Array.from(new Set([...unlockedCrewRouteIds, ...routeAccessState.unlockedCrewDestinationIds])),
    selectedRouteId:
      routeAccessState.selectedRouteId && ownedRouteIdSet.has(routeAccessState.selectedRouteId)
        ? routeAccessState.selectedRouteId
        : unlockedPersonalRouteIds[0] ?? routeAccessState.selectedRouteId,
  };
};

const mergeCapsuleRouteTicketsIntoState = (current: AppState, capsuleRouteTicketIds: string[]): AppState => {
  const safeTicketIds = getSafeCapsuleRouteTicketIds(capsuleRouteTicketIds);
  if (safeTicketIds.length === 0) {
    return current;
  }

  const purchasedRouteIds = Array.from(new Set([...current.purchasedRouteIds, ...safeTicketIds]));
  if (areStringArraysEqual(purchasedRouteIds, current.purchasedRouteIds)) {
    return current;
  }

  return {
    ...current,
    purchasedRouteIds,
  };
};

const reconcilePaceCrewRouteAccess = (current: AppState, extraOwnedRouteIds: string[] = []): AppState => {
  const safeExtraOwnedRouteIds = getSafeCapsuleRouteTicketIds(extraOwnedRouteIds);
  const unlockedCrewDestinationIds = reconcilePaceCrewMembershipUnlockRouteIds(
    current.unlockedCrewDestinationIds,
    current.userPaceCrewState.memberships.length,
  );
  const ownedRouteIds = new Set([...current.purchasedRouteIds, ...unlockedCrewDestinationIds, ...safeExtraOwnedRouteIds]);
  const selectedRouteId =
    current.selectedRouteId && ownedRouteIds.has(current.selectedRouteId)
      ? current.selectedRouteId
      : current.purchasedRouteIds[0] ?? safeExtraOwnedRouteIds[0] ?? null;

  if (
    selectedRouteId === current.selectedRouteId &&
    areStringArraysEqual(unlockedCrewDestinationIds, current.unlockedCrewDestinationIds)
  ) {
    return current;
  }

  return {
    ...current,
    selectedRouteId,
    unlockedCrewDestinationIds
  };
};

const buildWearableHistoryFromState = (current: AppState): WearableSyncRecord[] => {
  const routeNameById = new Map(routes.map((route) => [route.id, route.name]));
  const syncedRuns = current.runHistory
    .filter((entry) => entry.runTargetType === "personal" && entry.routeId)
    .slice(0, 4)
    .map((entry) => ({
      id: `wearable-${entry.id}`,
      title: routeNameById.get(entry.routeId ?? "") ?? "Outdoor Run",
      sourceName: "Synced Run",
      distanceKm: entry.distanceKm,
      syncedAt: entry.completedAt
    }));

  if (syncedRuns.length > 0) {
    return syncedRuns;
  }

  const now = Date.now();

  return [
    {
      id: crypto.randomUUID(),
      title: "Evening Run",
      sourceName: "Synced Run",
      distanceKm: 5.2,
      syncedAt: new Date(now - 45 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: "Morning Run",
      sourceName: "Synced Run",
      distanceKm: 2.1,
      syncedAt: new Date(now - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: "West Lake Run",
      sourceName: "Imported Yesterday",
      distanceKm: 8,
      syncedAt: new Date(now - 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

const createWearableSyncRecord = (current: AppState): WearableSyncRecord => {
  const latestRouteId = [...current.runHistory].find((entry) => entry.runTargetType === "personal" && entry.routeId)?.routeId;
  const routeName = latestRouteId ? routes.find((route) => route.id === latestRouteId)?.name : undefined;

  return {
    id: crypto.randomUUID(),
    title: routeName ?? "Outdoor Run",
    sourceName: "Manual Sync",
    distanceKm: latestRouteId ? 4.6 : 3.8,
    syncedAt: new Date().toISOString()
  };
};

const resolveRunMeasurement = (current: AppState, plannedDistanceKm: number) => {
  const connection = current.wearableConnection;

  if (!connection) {
    return {
      distanceKm: plannedDistanceKm,
      dataSource: "manual" as const,
      sourceName: "App input",
      fallbackReason: undefined
    };
  }

  const feedbackAgeMs = Date.now() - new Date(connection.lastSyncedAt).getTime();
  const hasWearableFeedback = connection.autoSyncEnabled && feedbackAgeMs <= 12 * 60 * 60 * 1000;

  if (!hasWearableFeedback) {
    return {
      distanceKm: plannedDistanceKm,
      dataSource: "manual" as const,
      sourceName: "App input",
      fallbackReason: connection.autoSyncEnabled
        ? "No recent wearable feedback, so MileScape used app input."
        : "Wearable sync is paused, so MileScape used app input."
    };
  }

  const offsetPattern = [-0.1, 0, 0.1, 0.2];
  const offset = offsetPattern[current.runHistory.length % offsetPattern.length] ?? 0;
  const measuredDistanceKm = Math.max(0.1, Number((plannedDistanceKm + offset).toFixed(1)));

  return {
    distanceKm: measuredDistanceKm,
    dataSource: "wearable" as const,
    sourceName: connection.name,
    fallbackReason: undefined
  };
};

const createWearableSyncRecordFromRun = (
  current: AppState,
  input: { targetType: "personal"; routeId: string } | { targetType: "pacecrew_mission"; missionId: string },
  distanceKm: number,
  sourceName: string,
): WearableSyncRecord => {
  if (input.targetType === "personal") {
    const routeName = routes.find((route) => route.id === input.routeId)?.name ?? "Outdoor Run";
    return {
      id: crypto.randomUUID(),
      title: routeName,
      sourceName,
      distanceKm,
      syncedAt: new Date().toISOString()
    };
  }

  const missionTitle = current.paceCrewMissions.find((mission) => mission.id === input.missionId)?.title ?? "Mission Run";
  return {
    id: crypto.randomUUID(),
    title: missionTitle,
    sourceName,
    distanceKm,
    syncedAt: new Date().toISOString()
  };
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState>(() => normalizeState(loadState()));
  const [capsuleRouteTicketIds, setCapsuleRouteTicketIds] = useState<string[]>(() => loadMyScapeCapsuleRouteTicketIds());
  const demoModeEnabled = state.demoModeEnabled ?? false;

  useEffect(() => {
    const syncCapsuleTickets = () => {
      setCapsuleRouteTicketIds(loadMyScapeCapsuleRouteTicketIds());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === MY_SCAPE_CAPSULE_STATE_KEY) {
        syncCapsuleTickets();
      }
    };

    window.addEventListener(MY_SCAPE_CAPSULE_STATE_UPDATED_EVENT, syncCapsuleTickets);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(MY_SCAPE_CAPSULE_STATE_UPDATED_EVENT, syncCapsuleTickets);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    const synced = syncExpiredMissionStates(state);
    if (!areMissionStatesEqual(synced.userMissionStates, state.userMissionStates)) {
      setState(synced);
    }
  }, [state.paceCrewMissions, state.userMissionStates]);

  useEffect(() => {
    setState((current) => reconcilePaceCrewRouteAccess(current, capsuleRouteTicketIds));
  }, [
    capsuleRouteTicketIds,
    state.purchasedRouteIds,
    state.selectedRouteId,
    state.unlockedCrewDestinationIds,
    state.userPaceCrewState.memberships,
  ]);

  useEffect(() => {
    const saveTimer = window.setTimeout(() => {
      saveState(state);
    }, 120);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [state]);

  const effectiveState = useMemo<AppState>(() => {
    const routeAccessState = mergeCapsuleRouteTicketsIntoState(
      reconcilePaceCrewRouteAccess(state, capsuleRouteTicketIds),
      capsuleRouteTicketIds,
    );

    if (demoModeEnabled) {
      return buildDemoState(routeAccessState);
    }

    return routeAccessState;
  }, [capsuleRouteTicketIds, demoModeEnabled, state]);

  const playableRoutes = routes.filter((route) => isRouteOwnedInPaceport(route.id, effectiveState));

  const currentUser = users.find((user) => user.id === currentUserId) ?? users[0];

  const value = useMemo<AppContextValue>(
    () => ({
      language: state.language,
      currentUser,
      users,
      routes,
      playableRoutes,
      state: effectiveState,
      t: (key, params) => translate(state.language, key, params),
      selectRoute: (routeId) => {
        setState((current) => {
          const routeAccessState = reconcilePaceCrewRouteAccess(current, capsuleRouteTicketIds);
          const effectiveRouteAccessState = mergeCapsuleRouteTicketsIntoState(routeAccessState, capsuleRouteTicketIds);
          const selectableState = routeAccessState.demoModeEnabled ? buildDemoState(effectiveRouteAccessState) : effectiveRouteAccessState;
          return routes.some((route) => route.id === routeId && isRouteOwnedInPaceport(route.id, selectableState))
            ? { ...routeAccessState, selectedRouteId: routeId }
            : routeAccessState;
        });
      },
      completeRun: (input) => {
        let summary = null as ReturnType<typeof applyPersonalRunToState>["summary"] | null;

        setState((current) => {
          const synced = syncExpiredMissionStates(reconcilePaceCrewRouteAccess(current, capsuleRouteTicketIds));
          const effectiveSynced = mergeCapsuleRouteTicketsIntoState(synced, capsuleRouteTicketIds);
          const measurement = resolveRunMeasurement(synced, input.distanceKm);

          if (input.targetType === "personal") {
            const route = routes.find((entry) => entry.id === input.routeId);

            const playableState = synced.demoModeEnabled ? buildDemoState(effectiveSynced) : effectiveSynced;
            if (!route || !isRouteOwnedInPaceport(route.id, playableState)) {
              throw new Error(`Unknown or locked route: ${input.routeId}`);
            }

            const result = applyPersonalRunToState(synced, route, measurement.distanceKm, {
              plannedDistanceKm: input.distanceKm,
              dataSource: measurement.dataSource,
              sourceName: measurement.sourceName,
              fallbackReason: measurement.fallbackReason
            });
            summary = result.summary;
            if (measurement.dataSource !== "wearable" || !synced.wearableConnection) {
              return result.nextState;
            }

            return {
              ...result.nextState,
              wearableConnection: {
                ...synced.wearableConnection,
                lastSyncedAt: new Date().toISOString()
              },
              wearableSyncHistory: [
                createWearableSyncRecordFromRun(synced, { targetType: "personal", routeId: route.id }, measurement.distanceKm, measurement.sourceName),
                ...synced.wearableSyncHistory
              ].slice(0, 8)
            };
          }

          const mission = getMissionById(synced, input.missionId);

          if (!mission) {
            throw new Error(`Unknown mission: ${input.missionId}`);
          }

          const result = applyMissionRunToState(synced, mission, measurement.distanceKm, {
            plannedDistanceKm: input.distanceKm,
            dataSource: measurement.dataSource,
            sourceName: measurement.sourceName,
            fallbackReason: measurement.fallbackReason
          });
          summary = result.summary;
          if (measurement.dataSource !== "wearable" || !synced.wearableConnection) {
            return result.nextState;
          }

          return {
            ...result.nextState,
            wearableConnection: {
              ...synced.wearableConnection,
              lastSyncedAt: new Date().toISOString()
            },
            wearableSyncHistory: [
              createWearableSyncRecordFromRun(
                synced,
                { targetType: "pacecrew_mission", missionId: mission.id },
                measurement.distanceKm,
                measurement.sourceName,
              ),
              ...synced.wearableSyncHistory
            ].slice(0, 8)
          };
        });

        if (!summary) {
          throw new Error("Run summary could not be generated");
        }

        return summary;
      },
      purchaseRoute: (routeId) => {
        const route = routes.find((entry) => entry.id === routeId);

        if (!route || route.sourceType !== "personal") {
          return { success: false, message: "This destination is not sold in Shop" };
        }

        if (effectiveState.purchasedRouteIds.includes(routeId)) {
          return { success: false, message: "Already owned" };
        }

        if (!demoModeEnabled && state.currentStamps < route.priceStamps) {
          return { success: false, message: "Insufficient Stamps" };
        }

        setState((current) => ({
          ...current,
          currentStamps: current.demoModeEnabled ? current.currentStamps : current.currentStamps - route.priceStamps,
          purchasedRouteIds: [...current.purchasedRouteIds, routeId]
        }));

        return { success: true, message: `${route.name} unlocked` };
      },
      spendStamps: (amount, reason = "Stamps spent") => {
        const normalizedAmount = Math.max(0, Math.round(amount));

        if (normalizedAmount <= 0) {
          return { success: true, message: reason, updatedStamps: effectiveState.currentStamps };
        }

        if (demoModeEnabled) {
          return { success: true, message: reason, updatedStamps: DEMO_STAMP_BALANCE };
        }

        if (state.currentStamps < normalizedAmount) {
          return { success: false, message: "Insufficient Stamps", updatedStamps: state.currentStamps };
        }

        const updatedStamps = state.currentStamps - normalizedAmount;
        setState((current) => ({
          ...current,
          currentStamps: Math.max(0, current.currentStamps - normalizedAmount),
        }));

        return { success: true, message: reason, updatedStamps };
      },
      setDemoModeEnabled: (enabled) => {
        setState((current) => ({
          ...current,
          demoModeEnabled: enabled,
          selectedRouteId:
            enabled && !current.selectedRouteId
              ? getDemoPersonalRouteIds()[0] ?? routes.find((route) => route.sourceType === "personal")?.id ?? null
              : current.selectedRouteId,
        }));
      },
      setLanguage: (language) => {
        setState((current) => ({ ...current, language }));
      },
      setSliderMaxDistanceKm: (distanceKm) => {
        setState((current) => ({
          ...current,
          sliderMaxDistanceKm: Math.min(100, Math.max(1, distanceKm))
        }));
      },
      createPaceCrew: ({ name, description }) => {
        if (state.userPaceCrewState.organizedCrewId) {
          return { success: false, message: "You are already organizing a PaceCrew" };
        }

        const crewId = createCrewId(name);

        setState((current) => {
          const memberships = [...current.userPaceCrewState.memberships, createMembership(crewId, "organizer")];

          return {
            ...current,
            paceCrews: [
              ...current.paceCrews,
              {
                id: crewId,
                name,
                description,
                organizerId: currentUserId,
                memberIds: [currentUserId],
                createdAt: new Date().toISOString(),
                exclusiveDestinationIds: []
              }
            ],
            userPaceCrewState: {
              organizedCrewId: crewId,
              memberships
            },
            unlockedCrewDestinationIds: reconcilePaceCrewMembershipUnlockRouteIds(
              current.unlockedCrewDestinationIds,
              memberships.length,
            )
          };
        });

        return { success: true, message: "PaceCrew created" };
      },
      joinPaceCrew: (crewId) => {
        const crew = state.paceCrews.find((entry) => entry.id === crewId);

        if (!crew) {
          return { success: false, message: "PaceCrew not found" };
        }

        if (state.userPaceCrewState.memberships.some((membership) => membership.crewId === crewId)) {
          return { success: false, message: "Already joined" };
        }

        setState((current) => {
          const memberships = [...current.userPaceCrewState.memberships, createMembership(crewId, "member")];

          return {
            ...current,
            paceCrews: current.paceCrews.map((entry) =>
              entry.id === crewId && !entry.memberIds.includes(currentUserId)
                ? { ...entry, memberIds: [...entry.memberIds, currentUserId] }
                : entry,
            ),
            userPaceCrewState: {
              ...current.userPaceCrewState,
              memberships
            },
            unlockedCrewDestinationIds: reconcilePaceCrewMembershipUnlockRouteIds(
              current.unlockedCrewDestinationIds,
              memberships.length,
            ),
          };
        });

        return { success: true, message: `${crew.name} joined` };
      },
      leavePaceCrew: (crewId) => {
        if (state.userPaceCrewState.organizedCrewId === crewId || isCrewOrganizer(state, crewId)) {
          return { success: false, message: "Organizers cannot leave their own PaceCrew directly" };
        }

        if (!state.userPaceCrewState.memberships.some((membership) => membership.crewId === crewId)) {
          return { success: false, message: "You are not a member of this PaceCrew" };
        }

        setState((current) => {
          const memberships = current.userPaceCrewState.memberships.filter((membership) => membership.crewId !== crewId);
          const unlockedCrewDestinationIds = reconcilePaceCrewMembershipUnlockRouteIds(
            current.unlockedCrewDestinationIds,
            memberships.length,
          );
          const selectedRouteStillOwned =
            !current.selectedRouteId ||
            current.purchasedRouteIds.includes(current.selectedRouteId) ||
            unlockedCrewDestinationIds.includes(current.selectedRouteId) ||
            capsuleRouteTicketIds.includes(current.selectedRouteId);

          return {
            ...current,
            paceCrews: current.paceCrews.map((entry) =>
              entry.id === crewId
                ? { ...entry, memberIds: entry.memberIds.filter((memberId) => memberId !== currentUserId) }
                : entry,
            ),
            selectedRouteId: selectedRouteStillOwned ? current.selectedRouteId : current.purchasedRouteIds[0] ?? capsuleRouteTicketIds[0] ?? null,
            userPaceCrewState: {
              ...current.userPaceCrewState,
              memberships
            },
            unlockedCrewDestinationIds,
            userMissionStates: current.userMissionStates.filter((missionState) => missionState.crewId !== crewId)
          };
        });

        return { success: true, message: "Left PaceCrew" };
      },
      dissolvePaceCrew: (crewId) => {
        if (!isCrewOrganizer(state, crewId) || state.userPaceCrewState.organizedCrewId !== crewId) {
          return { success: false, message: "Only the organizer can dissolve this PaceCrew" };
        }

        setState((current) => {
          const memberships = current.userPaceCrewState.memberships.filter((membership) => membership.crewId !== crewId);
          const unlockedCrewDestinationIds = reconcilePaceCrewMembershipUnlockRouteIds(
            current.unlockedCrewDestinationIds,
            memberships.length,
          );
          const selectedRouteStillOwned =
            !current.selectedRouteId ||
            current.purchasedRouteIds.includes(current.selectedRouteId) ||
            unlockedCrewDestinationIds.includes(current.selectedRouteId) ||
            capsuleRouteTicketIds.includes(current.selectedRouteId);

          return {
            ...current,
            paceCrews: current.paceCrews.filter((crew) => crew.id !== crewId),
            paceCrewMissions: current.paceCrewMissions.filter((mission) => mission.crewId !== crewId),
            selectedRouteId: selectedRouteStillOwned ? current.selectedRouteId : current.purchasedRouteIds[0] ?? capsuleRouteTicketIds[0] ?? null,
            unlockedCrewDestinationIds,
            userMissionStates: current.userMissionStates.filter((missionState) => missionState.crewId !== crewId),
            userPaceCrewState: {
              organizedCrewId: null,
              memberships
            }
          };
        });

        return { success: true, message: "PaceCrew dissolved" };
      },
      removePaceCrewMember: (crewId, memberId) => {
        if (!isCrewOrganizer(state, crewId)) {
          return { success: false, message: "Only the organizer can manage members" };
        }

        if (memberId === currentUserId) {
          return { success: false, message: "Organizer cannot remove themselves" };
        }

        setState((current) => ({
          ...current,
          paceCrews: current.paceCrews.map((crew) =>
            crew.id === crewId ? { ...crew, memberIds: crew.memberIds.filter((id) => id !== memberId) } : crew,
          ),
          userMissionStates: current.userMissionStates.filter(
            (missionState) => !(missionState.crewId === crewId && missionState.userId === memberId),
          )
        }));

        return { success: true, message: "Member removed" };
      },
      publishPaceCrewMap: (crewId, routeId) => {
        if (!isCrewOrganizer(state, crewId)) {
          return { success: false, message: "Only the organizer can publish maps" };
        }

        const route = routes.find((entry) => entry.id === routeId);
        if (!route) {
          return { success: false, message: "Route not found" };
        }

        const crew = state.paceCrews.find((entry) => entry.id === crewId);
        if (!crew) {
          return { success: false, message: "PaceCrew not found" };
        }

        if (crew.exclusiveDestinationIds.includes(routeId)) {
          return { success: false, message: "Map already published" };
        }

        setState((current) => ({
          ...current,
          paceCrews: current.paceCrews.map((entry) =>
            entry.id === crewId
              ? { ...entry, exclusiveDestinationIds: [...entry.exclusiveDestinationIds, routeId] }
              : entry,
          ),
          unlockedCrewDestinationIds: Array.from(new Set([...current.unlockedCrewDestinationIds, routeId])),
        }));

        return { success: true, message: `${route.name} published` };
      },
      createMission: (crewId, input) => {
        if (!isCrewOrganizer(state, crewId)) {
          return { success: false, message: "Only the organizer can publish missions" };
        }

        const mission: PaceCrewMission = {
          id: createMissionId(input.title),
          crewId,
          title: input.title,
          description: input.description,
          targetDistanceKm: input.targetDistanceKm,
          depositStamps: input.depositStamps,
          rewardStamps: input.rewardStamps,
          deadline: input.deadline,
          destinationRewardId: input.destinationRewardId,
          status: "open"
        };

        setState((current) => ({
          ...current,
          paceCrewMissions: [mission, ...current.paceCrewMissions]
        }));

        return { success: true, message: "Mission published" };
      },
      updateMission: (missionId, input) => {
        const mission = state.paceCrewMissions.find((entry) => entry.id === missionId);
        if (!mission) {
          return { success: false, message: "Mission not found" };
        }

        if (!isCrewOrganizer(state, mission.crewId)) {
          return { success: false, message: "Only the organizer can manage missions" };
        }

        setState((current) => ({
          ...current,
          paceCrewMissions: current.paceCrewMissions.map((entry) =>
            entry.id === missionId
              ? {
                  ...entry,
                  ...input,
                  targetDistanceKm:
                    input.targetDistanceKm === undefined
                      ? entry.targetDistanceKm
                      : Math.max(0.5, input.targetDistanceKm),
                  depositStamps:
                    input.depositStamps === undefined ? entry.depositStamps : Math.max(0, Math.round(input.depositStamps)),
                  rewardStamps:
                    input.rewardStamps === undefined ? entry.rewardStamps : Math.max(0, Math.round(input.rewardStamps)),
                }
              : entry,
          ),
        }));

        return { success: true, message: "Mission updated" };
      },
      acceptMission: (missionId) => {
        const mission = state.paceCrewMissions.find((entry) => entry.id === missionId);

        if (!mission || mission.status !== "open") {
          return { success: false, message: "Mission is not available" };
        }

        if (!state.userPaceCrewState.memberships.some((membership) => membership.crewId === mission.crewId)) {
          return { success: false, message: "Join this PaceCrew before accepting missions" };
        }

        if (state.userMissionStates.some((missionState) => missionState.missionId === missionId)) {
          return { success: false, message: "Mission already accepted" };
        }

        if (!demoModeEnabled && state.currentStamps < mission.depositStamps) {
          return { success: false, message: "Insufficient Stamps for deposit" };
        }

        setState((current) => ({
          ...current,
          currentStamps: current.demoModeEnabled ? current.currentStamps : current.currentStamps - mission.depositStamps,
          userMissionStates: [
            ...current.userMissionStates,
            {
              missionId,
              crewId: mission.crewId,
              userId: currentUserId,
              acceptedAt: new Date().toISOString(),
              status: "accepted",
              depositPaid: mission.depositStamps,
              completedDistanceKm: 0
            }
          ]
        }));

        return { success: true, message: "Mission accepted" };
      },
      connectWearable: ({ id, name }) => {
        setState((current) => ({
          ...current,
          wearableConnection: {
            id,
            name,
            connectedAt: new Date().toISOString(),
            lastSyncedAt: new Date().toISOString(),
            autoSyncEnabled: true
          },
          wearableSyncHistory: buildWearableHistoryFromState(current)
        }));

        return { success: true, message: `${name} connected` };
      },
      disconnectWearable: () => {
        if (!state.wearableConnection) {
          return { success: false, message: "No wearable connected" };
        }

        setState((current) => ({
          ...current,
          wearableConnection: null,
          wearableSyncHistory: []
        }));

        return { success: true, message: "Wearable disconnected" };
      },
      reconnectWearable: () => {
        if (!state.wearableConnection) {
          return { success: false, message: "No wearable connected" };
        }

        setState((current) => ({
          ...current,
          wearableConnection: current.wearableConnection
            ? { ...current.wearableConnection, lastSyncedAt: new Date().toISOString() }
            : null
        }));

        return { success: true, message: "Connection refreshed" };
      },
      syncWearableNow: () => {
        if (!state.wearableConnection) {
          return { success: false, message: "No wearable connected" };
        }

        setState((current) => ({
          ...current,
          wearableConnection: current.wearableConnection
            ? { ...current.wearableConnection, lastSyncedAt: new Date().toISOString() }
            : null,
          wearableSyncHistory: [createWearableSyncRecord(current), ...current.wearableSyncHistory].slice(0, 8)
        }));

        return { success: true, message: "Sync complete" };
      },
      setWearableAutoSync: (enabled) => {
        if (!state.wearableConnection) {
          return { success: false, message: "No wearable connected" };
        }

        setState((current) => ({
          ...current,
          wearableConnection: current.wearableConnection
            ? { ...current.wearableConnection, autoSyncEnabled: enabled }
            : null
        }));

        return { success: true, message: enabled ? "Auto Sync enabled" : "Auto Sync paused" };
      },
      resetDemo: () => {
        clearMyScapeCapsuleState();
        clearState();
        setState(createInitialState());
      }
    }),
    [capsuleRouteTicketIds, currentUser, demoModeEnabled, effectiveState, playableRoutes, state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
