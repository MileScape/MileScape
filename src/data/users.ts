import type { UserProfile } from "../types";

export const currentUserId = "you";

export const users: UserProfile[] = [
  { id: currentUserId, name: "You" },
  { id: "ava", name: "Ava Chen" },
  { id: "marco", name: "Marco Lin" },
  { id: "nina", name: "Nina Park" },
  { id: "jules", name: "Jules Martin" },
  { id: "sora", name: "Sora Ito" }
];
