export const STAMPS_PER_KM = 10;

export const calculateEarnedStamps = (completedDistanceKm: number) =>
  Math.round(completedDistanceKm * STAMPS_PER_KM);
