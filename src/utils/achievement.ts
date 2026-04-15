import type { AchievementTier } from "../types";

export const getAchievementTier = (runCount: number): AchievementTier => {
  if (runCount >= 10) {
    return "prism";
  }
  if (runCount >= 6) {
    return "gold";
  }
  if (runCount >= 3) {
    return "silver";
  }
  if (runCount >= 1) {
    return "bronze";
  }
  return "none";
};
