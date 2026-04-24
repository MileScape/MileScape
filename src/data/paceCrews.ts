import type { PaceCrew } from "../types";

export const paceCrews: PaceCrew[] = [
  {
    id: "sunrise-collective",
    name: "Sunrise Collective",
    description: "A calm morning PaceCrew focused on short sessions, dependable rhythm, and soft weekly missions.",
    organizerId: "ava",
    memberIds: ["ava", "marco", "nina"],
    createdAt: "2026-03-28T08:30:00.000Z",
    exclusiveDestinationIds: []
  },
  {
    id: "night-owls",
    name: "Night Owls",
    description: "An after-dark PaceCrew built around flexible evening runs and slightly tougher challenge drops.",
    organizerId: "marco",
    memberIds: ["marco", "jules"],
    createdAt: "2026-03-31T19:00:00.000Z",
    exclusiveDestinationIds: []
  },
  {
    id: "campus-striders",
    name: "Campus Striders",
    description: "A friendly demo PaceCrew for student teams that blends easy missions with milestone-based destination rewards.",
    organizerId: "sora",
    memberIds: ["sora", "ava"],
    createdAt: "2026-04-04T12:10:00.000Z",
    exclusiveDestinationIds: []
  }
];
