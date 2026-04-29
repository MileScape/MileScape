export interface Landmark {
  id: string;
  name: string;
  milestoneKm: number;
  description: string;
  image: string;
}

export type RouteTier = "Starter" | "Standard" | "Advanced" | "Premium";
export type AchievementTier = "none" | "bronze" | "silver" | "gold" | "prism";
export type PaceportStatus = "locked" | "owned" | "in_progress" | "completed";
export type RouteSourceType = "personal" | "pacecrew";
export type PaceCrewRole = "organizer" | "member";
export type PaceCrewMissionStatus = "open" | "closed";
export type UserMissionStatus = "accepted" | "completed" | "failed";
export type RunTargetType = "personal" | "pacecrew_mission";
export type RunDataSource = "wearable" | "manual";
export type AppLanguage = "en" | "zh";
export type WearableAvailability = "available" | "coming_soon";

export interface UserProfile {
  id: string;
  name: string;
}

export interface Route {
  id: string;
  name: string;
  city: string;
  country: string;
  totalDistanceKm: number;
  coverImage: string;
  description: string;
  motivation: string;
  tier: RouteTier;
  priceStamps: number;
  sourceType: RouteSourceType;
  crewOnly?: boolean;
  sourceCrewId?: string | null;
  landmarks: Landmark[];
}

export interface RouteProgress {
  routeId: string;
  completedDistanceKm: number;
  unlockedLandmarkIds: string[];
  runCount: number;
  achievementTier: AchievementTier;
  completed: boolean;
}

export interface RunHistoryItem {
  id: string;
  routeId?: string;
  missionId?: string;
  crewId?: string;
  runTargetType: RunTargetType;
  distanceKm: number;
  plannedDistanceKm?: number;
  dataSource?: RunDataSource;
  sourceName?: string;
  completedAt: string;
}

export interface RunResultSummary {
  routeId?: string;
  missionId?: string;
  crewId?: string;
  runTargetType: RunTargetType;
  runDistanceKm: number;
  plannedDistanceKm?: number;
  dataSource?: RunDataSource;
  sourceName?: string;
  fallbackReason?: string;
  appliedDistanceKm: number;
  overflowDistanceKm: number;
  previousDistanceKm: number;
  updatedDistanceKm: number;
  earnedStamps: number;
  missionRewardStamps: number;
  depositReturnedStamps: number;
  updatedStampsBalance: number;
  updatedRunCount: number;
  updatedAchievementTier: AchievementTier;
  newlyUnlockedLandmarks: Landmark[];
  destinationCompletedAfterRun: boolean;
  missionCompletedAfterRun?: boolean;
  unlockedDestinationIds?: string[];
}

export interface PaceCrew {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  memberIds: string[];
  createdAt: string;
  exclusiveDestinationIds: string[];
}

export interface PaceCrewMembership {
  crewId: string;
  userId: string;
  role: PaceCrewRole;
  joinedAt: string;
}

export interface UserPaceCrewState {
  organizedCrewId: string | null;
  memberships: PaceCrewMembership[];
}

export interface PaceCrewMission {
  id: string;
  crewId: string;
  title: string;
  description: string;
  targetDistanceKm: number;
  depositStamps: number;
  rewardStamps: number;
  deadline: string;
  maxParticipants?: number;
  destinationRewardId?: string;
  status: PaceCrewMissionStatus;
}

export interface UserMissionState {
  missionId: string;
  crewId: string;
  userId: string;
  acceptedAt: string;
  status: UserMissionStatus;
  depositPaid: number;
  completedDistanceKm: number;
}

export interface WearableConnection {
  id: string;
  name: string;
  connectedAt: string;
  lastSyncedAt: string;
  autoSyncEnabled: boolean;
}

export interface WearableSyncRecord {
  id: string;
  title: string;
  sourceName: string;
  distanceKm: number;
  syncedAt: string;
}

export interface MyScapePlacedLandmark {
  id: string;
  landmarkId: string;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

export interface MyScapeLayout {
  placedLandmarks: MyScapePlacedLandmark[];
  updatedAt: string;
}

export interface AppState {
  language: AppLanguage;
  selectedRouteId: string | null;
  routeProgress: RouteProgress[];
  runHistory: RunHistoryItem[];
  currentStamps: number;
  totalStampsEarned: number;
  purchasedRouteIds: string[];
  unlockedCrewDestinationIds: string[];
  sliderMaxDistanceKm: number;
  userPaceCrewState: UserPaceCrewState;
  paceCrews: PaceCrew[];
  paceCrewMissions: PaceCrewMission[];
  userMissionStates: UserMissionState[];
  wearableConnection: WearableConnection | null;
  wearableSyncHistory: WearableSyncRecord[];
  lastRunResult: RunResultSummary | null;
}

export interface AppContextValue {
  language: AppLanguage;
  currentUser: UserProfile;
  users: UserProfile[];
  routes: Route[];
  playableRoutes: Route[];
  state: AppState;
  selectRoute: (routeId: string) => void;
  completeRun: (
    input:
      | { targetType: "personal"; routeId: string; distanceKm: number }
      | { targetType: "pacecrew_mission"; missionId: string; distanceKm: number },
  ) => RunResultSummary;
  purchaseRoute: (routeId: string) => { success: boolean; message: string };
  spendStampsForGacha: (amount: number) => { success: boolean; message: string };
  unlockRouteByGacha: (routeId: string) => { success: boolean; message: string };
  t: (key: string, params?: Record<string, string | number>) => string;
  setLanguage: (language: AppLanguage) => void;
  setSliderMaxDistanceKm: (distanceKm: number) => void;
  createPaceCrew: (input: { name: string; description: string }) => { success: boolean; message: string };
  joinPaceCrew: (crewId: string) => { success: boolean; message: string };
  leavePaceCrew: (crewId: string) => { success: boolean; message: string };
  dissolvePaceCrew: (crewId: string) => { success: boolean; message: string };
  removePaceCrewMember: (crewId: string, memberId: string) => { success: boolean; message: string };
  createMission: (
    crewId: string,
    input: {
      title: string;
      description: string;
      targetDistanceKm: number;
      depositStamps: number;
      rewardStamps: number;
      deadline: string;
      destinationRewardId?: string;
    },
  ) => { success: boolean; message: string };
  acceptMission: (missionId: string) => { success: boolean; message: string };
  connectWearable: (input: { id: string; name: string }) => { success: boolean; message: string };
  disconnectWearable: () => { success: boolean; message: string };
  reconnectWearable: () => { success: boolean; message: string };
  syncWearableNow: () => { success: boolean; message: string };
  setWearableAutoSync: (enabled: boolean) => { success: boolean; message: string };
  resetDemo: () => void;
}
