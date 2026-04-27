import { currentUserId, users } from "../data/users";
import type {
  AppState,
  PaceCrew,
  PaceCrewMembership,
  PaceCrewMission,
  Route,
  UserMissionState,
  UserProfile
} from "../types";

export const isCrewOnlyRoute = (route: Route) => route.sourceType === "pacecrew" || route.crewOnly;

export const getOwnedRouteIds = (state: AppState) =>
  Array.from(new Set([...state.purchasedRouteIds, ...state.unlockedCrewDestinationIds]));

export const isRouteOwnedInPaceport = (routeId: string, state: AppState) =>
  getOwnedRouteIds(state).includes(routeId);

export const getUserProfile = (userId: string): UserProfile =>
  users.find((user) => user.id === userId) ?? { id: userId, name: "Member" };

export const getCrewMembership = (state: AppState, crewId: string) =>
  state.userPaceCrewState.memberships.find((membership) => membership.crewId === crewId);

export const isCrewOrganizer = (state: AppState, crewId: string) =>
  getCrewMembership(state, crewId)?.role === "organizer";

export const isCrewMember = (state: AppState, crewId: string) =>
  Boolean(getCrewMembership(state, crewId));

export const getAcceptedMissionState = (state: AppState, missionId: string) =>
  state.userMissionStates.find((missionState) => missionState.missionId === missionId);

export const getCrewById = (state: AppState, crewId: string) =>
  state.paceCrews.find((crew) => crew.id === crewId);

export const getMissionById = (state: AppState, missionId: string) =>
  state.paceCrewMissions.find((mission) => mission.id === missionId);

export const getCrewMemberProfiles = (
  crew: PaceCrew,
  state: AppState,
): Array<{
  user: UserProfile;
  membership: PaceCrewMembership | undefined;
  activeMissionCount: number;
}> =>
  crew.memberIds.map((memberId) => ({
    user: getUserProfile(memberId),
    membership: state.userPaceCrewState.memberships.find(
      (membership) => membership.crewId === crew.id && membership.userId === memberId,
    ),
    activeMissionCount: state.userMissionStates.filter(
      (missionState) => missionState.userId === memberId && missionState.crewId === crew.id && missionState.status === "accepted",
    ).length
  }));

export const syncExpiredMissionStates = (state: AppState): AppState => {
  const now = Date.now();
  const nextMissionStates = state.userMissionStates.map((missionState) => {
    if (missionState.status !== "accepted") {
      return missionState;
    }

    const mission = state.paceCrewMissions.find((entry) => entry.id === missionState.missionId);

    if (!mission) {
      return missionState;
    }

    if (new Date(mission.deadline).getTime() <= now) {
      return { ...missionState, status: "failed" as const };
    }

    return missionState;
  });

  return { ...state, userMissionStates: nextMissionStates };
};

export const getAvailableCrewsToJoin = (state: AppState) =>
  state.paceCrews.filter(
    (crew) => !state.userPaceCrewState.memberships.some((membership) => membership.crewId === crew.id),
  );

export const createMembership = (crewId: string, role: PaceCrewMembership["role"]): PaceCrewMembership => ({
  crewId,
  userId: currentUserId,
  role,
  joinedAt: new Date().toISOString()
});

export const getAcceptedMissionStatesForUser = (state: AppState) =>
  state.userMissionStates.filter(
    (missionState) => missionState.userId === currentUserId && missionState.status === "accepted",
  );

export const getMissionProgress = (mission: PaceCrewMission, missionState?: UserMissionState | null) => {
  const completedDistanceKm = missionState?.completedDistanceKm ?? 0;
  return {
    completedDistanceKm,
    remainingDistanceKm: Math.max(0, mission.targetDistanceKm - completedDistanceKm),
    progressPercent: Math.min(100, Math.round((completedDistanceKm / mission.targetDistanceKm) * 100))
  };
};
