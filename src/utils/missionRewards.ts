import { calculateEarnedStamps } from "./stamps";

export const getMissionCompletionStampReward = (
  runDistanceKm: number,
  rewardStamps: number,
  depositStamps: number,
) => ({
  baseRunStamps: calculateEarnedStamps(runDistanceKm),
  missionRewardStamps: rewardStamps,
  depositReturnedStamps: depositStamps,
  totalAwardedStamps: calculateEarnedStamps(runDistanceKm) + rewardStamps + depositStamps
});
