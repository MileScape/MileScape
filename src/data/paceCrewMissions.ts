import type { PaceCrewMission } from "../types";

export const paceCrewMissions: PaceCrewMission[] = [
  {
    id: "mission-evening-sprint",
    crewId: "sunrise-collective",
    title: "Evening Sprint",
    description: "Complete 2 km before tomorrow evening and unlock a compact Bangkok team route.",
    targetDistanceKm: 2,
    depositStamps: 15,
    rewardStamps: 40,
    deadline: "2026-12-31T18:00:00.000Z",
    destinationRewardId: "bangkok-floating-route",
    status: "open"
  },
  {
    id: "mission-river-push",
    crewId: "night-owls",
    title: "Bay Push",
    description: "Log 4 km this week and unlock a Sydney harbor route for the whole team archive.",
    targetDistanceKm: 4,
    depositStamps: 25,
    rewardStamps: 60,
    deadline: "2026-12-31T23:00:00.000Z",
    destinationRewardId: "sydney-harbor-route",
    status: "open"
  },
  {
    id: "mission-study-break",
    crewId: "campus-striders",
    title: "Study Break Loop",
    description: "Sneak in 1.5 km between classes for an easy deposit-backed reward.",
    targetDistanceKm: 1.5,
    depositStamps: 10,
    rewardStamps: 25,
    deadline: "2026-12-31T12:00:00.000Z",
    status: "open"
  }
];
