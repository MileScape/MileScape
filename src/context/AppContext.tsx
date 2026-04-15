import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { paceCrews as seedPaceCrews } from "../data/paceCrews";
import { routes } from "../data/routes";
import { currentUserId, users } from "../data/users";
import type { AppContextValue, AppState, PaceCrewMission } from "../types";
import { translate } from "../utils/i18n";
import { clearState, loadState, saveState } from "../utils/storage";
import { applyMissionRunToState, applyPersonalRunToState, createInitialState, normalizeState } from "../utils/progress";
import {
  createMembership,
  getMissionById,
  isCrewOrganizer,
  isRouteOwnedInPaceport,
  syncExpiredMissionStates
} from "../utils/paceCrew";
import { isRouteOwned } from "../utils/shop";

export const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

const createCrewId = (name: string) =>
  `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}-${crypto.randomUUID().slice(0, 6)}`;

const createMissionId = (title: string) =>
  `${title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}-${crypto.randomUUID().slice(0, 6)}`;

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState>(() => normalizeState(loadState()));

  useEffect(() => {
    const synced = syncExpiredMissionStates(state);
    if (JSON.stringify(synced.userMissionStates) !== JSON.stringify(state.userMissionStates)) {
      setState(synced);
      return;
    }
    saveState(state);
  }, [state]);

  const playableRoutes = routes.filter(
    (route) => route.sourceType === "personal" && isRouteOwned(route.id, state.purchasedRouteIds),
  );

  const currentUser = users.find((user) => user.id === currentUserId) ?? users[0];

  const value = useMemo<AppContextValue>(
    () => ({
      language: state.language,
      currentUser,
      users,
      routes,
      playableRoutes,
      state,
      t: (key, params) => translate(state.language, key, params),
      selectRoute: (routeId) => {
        setState((current) =>
          playableRoutes.some((route) => route.id === routeId)
            ? { ...current, selectedRouteId: routeId }
            : current,
        );
      },
      completeRun: (input) => {
        let summary = null as ReturnType<typeof applyPersonalRunToState>["summary"] | null;

        setState((current) => {
          const synced = syncExpiredMissionStates(current);

          if (input.targetType === "personal") {
            const route = routes.find((entry) => entry.id === input.routeId && entry.sourceType === "personal");

            if (!route || !isRouteOwned(route.id, synced.purchasedRouteIds)) {
              throw new Error(`Unknown or locked route: ${input.routeId}`);
            }

            const result = applyPersonalRunToState(synced, route, input.distanceKm);
            summary = result.summary;
            return result.nextState;
          }

          const mission = getMissionById(synced, input.missionId);

          if (!mission) {
            throw new Error(`Unknown mission: ${input.missionId}`);
          }

          const result = applyMissionRunToState(synced, mission, input.distanceKm);
          summary = result.summary;
          return result.nextState;
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

        if (state.purchasedRouteIds.includes(routeId)) {
          return { success: false, message: "Already owned" };
        }

        if (state.currentStamps < route.priceStamps) {
          return { success: false, message: "Insufficient Stamps" };
        }

        setState((current) => ({
          ...current,
          currentStamps: current.currentStamps - route.priceStamps,
          purchasedRouteIds: [...current.purchasedRouteIds, routeId]
        }));

        return { success: true, message: `${route.name} unlocked` };
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

        setState((current) => ({
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
            memberships: [...current.userPaceCrewState.memberships, createMembership(crewId, "organizer")]
          }
        }));

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

        setState((current) => ({
          ...current,
          paceCrews: current.paceCrews.map((entry) =>
            entry.id === crewId && !entry.memberIds.includes(currentUserId)
              ? { ...entry, memberIds: [...entry.memberIds, currentUserId] }
              : entry,
          ),
          userPaceCrewState: {
            ...current.userPaceCrewState,
            memberships: [...current.userPaceCrewState.memberships, createMembership(crewId, "member")]
          }
        }));

        return { success: true, message: `${crew.name} joined` };
      },
      leavePaceCrew: (crewId) => {
        if (state.userPaceCrewState.organizedCrewId === crewId || isCrewOrganizer(state, crewId)) {
          return { success: false, message: "Organizers cannot leave their own PaceCrew directly" };
        }

        if (!state.userPaceCrewState.memberships.some((membership) => membership.crewId === crewId)) {
          return { success: false, message: "You are not a member of this PaceCrew" };
        }

        setState((current) => ({
          ...current,
          paceCrews: current.paceCrews.map((entry) =>
            entry.id === crewId
              ? { ...entry, memberIds: entry.memberIds.filter((memberId) => memberId !== currentUserId) }
              : entry,
          ),
          userPaceCrewState: {
            ...current.userPaceCrewState,
            memberships: current.userPaceCrewState.memberships.filter((membership) => membership.crewId !== crewId)
          },
          userMissionStates: current.userMissionStates.filter((missionState) => missionState.crewId !== crewId)
        }));

        return { success: true, message: "Left PaceCrew" };
      },
      dissolvePaceCrew: (crewId) => {
        if (!isCrewOrganizer(state, crewId) || state.userPaceCrewState.organizedCrewId !== crewId) {
          return { success: false, message: "Only the organizer can dissolve this PaceCrew" };
        }

        setState((current) => ({
          ...current,
          paceCrews: current.paceCrews.filter((crew) => crew.id !== crewId),
          paceCrewMissions: current.paceCrewMissions.filter((mission) => mission.crewId !== crewId),
          userMissionStates: current.userMissionStates.filter((missionState) => missionState.crewId !== crewId),
          userPaceCrewState: {
            organizedCrewId: null,
            memberships: current.userPaceCrewState.memberships.filter((membership) => membership.crewId !== crewId)
          }
        }));

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

        if (state.currentStamps < mission.depositStamps) {
          return { success: false, message: "Insufficient Stamps for deposit" };
        }

        setState((current) => ({
          ...current,
          currentStamps: current.currentStamps - mission.depositStamps,
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
      resetDemo: () => {
        clearState();
        setState(createInitialState());
      }
    }),
    [currentUser, playableRoutes, state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
