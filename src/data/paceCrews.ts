import type { PaceCrew } from "../types";

export const paceCrews: PaceCrew[] = [
  {
    id: "sunrise-collective",
    name: "Aurora Run Society",
    description: "A refined morning PaceCrew for quiet consistency, polished weekly missions, and luminous shared route rewards.",
    organizerId: "ava",
    memberIds: ["ava", "marco", "nina"],
    createdAt: "2026-03-28T08:30:00.000Z",
    exclusiveDestinationIds: ["bangkok-floating-route"]
  },
  {
    id: "night-owls",
    name: "Nocturne Mile Club",
    description: "An after-dark PaceCrew for disciplined evening runs, sharper mission stakes, and city-lit destination unlocks.",
    organizerId: "marco",
    memberIds: ["marco", "jules"],
    createdAt: "2026-03-31T19:00:00.000Z",
    exclusiveDestinationIds: ["sydney-harbor-route"]
  },
  {
    id: "campus-striders",
    name: "Atelier Striders",
    description: "A campus-born PaceCrew blending study-break runs, curated team rituals, and milestone-based map rewards.",
    organizerId: "sora",
    memberIds: ["sora", "ava"],
    createdAt: "2026-04-04T12:10:00.000Z",
    exclusiveDestinationIds: ["seoul-heritage-route"]
  }
];
