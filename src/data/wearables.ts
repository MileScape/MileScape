import type { WearableAvailability, WearableSyncRecord } from "../types";

export interface SupportedDevice {
  id: string;
  name: string;
  maker: string;
  availability: WearableAvailability;
}

export interface CollectedDataType {
  id: string;
  label: string;
  detail: string;
  status: "Ready" | "Soon";
}

export interface WearableDataSnapshot {
  id: CollectedDataType["id"];
  label: string;
  value: string;
  meta: string;
}

export const supportedDevices: SupportedDevice[] = [
  { id: "apple-watch", name: "Apple Watch", maker: "Apple", availability: "available" },
  { id: "apple-watch-ultra", name: "Apple Watch Ultra", maker: "Apple", availability: "available" },
  { id: "garmin-forerunner", name: "Garmin Forerunner", maker: "Garmin", availability: "available" },
  { id: "garmin-fenix", name: "Garmin Fenix", maker: "Garmin", availability: "available" },
  { id: "fitbit-sense", name: "Fitbit Sense", maker: "Google", availability: "available" },
  { id: "fitbit-charge", name: "Fitbit Charge", maker: "Google", availability: "available" },
  { id: "coros-pace", name: "COROS Pace", maker: "COROS", availability: "available" },
  { id: "polar-ignite", name: "Polar Ignite", maker: "Polar", availability: "available" },
  { id: "suunto-race", name: "Suunto Race", maker: "Suunto", availability: "available" },
  { id: "amazfit-cheetah", name: "Amazfit Cheetah", maker: "Amazfit", availability: "available" },
  { id: "huawei-watch", name: "Huawei Watch", maker: "Huawei", availability: "coming_soon" },
  { id: "xiaomi-band", name: "Xiaomi Band", maker: "Xiaomi", availability: "coming_soon" },
  { id: "samsung-galaxy-watch", name: "Galaxy Watch", maker: "Samsung", availability: "coming_soon" }
];

export const collectedDataTypes: CollectedDataType[] = [
  { id: "heart-rate", label: "Heart rate", detail: "BPM during runs", status: "Ready" },
  { id: "steps", label: "Steps", detail: "Daily step count", status: "Ready" },
  { id: "pace", label: "Pace", detail: "Average and live pace", status: "Ready" },
  { id: "duration", label: "Duration", detail: "Elapsed workout time", status: "Ready" },
  { id: "distance", label: "Distance", detail: "Run distance and splits", status: "Ready" }
];

const formatPace = (minutesPerKm: number) => {
  const safeMinutes = Number.isFinite(minutesPerKm) && minutesPerKm > 0 ? minutesPerKm : 0;
  const minutes = Math.floor(safeMinutes);
  const seconds = Math.round((safeMinutes - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}/km`;
};

export const buildWearableDataSnapshot = (history: WearableSyncRecord[]): WearableDataSnapshot[] => {
  const latest = history[0];
  const latestDistance = latest?.distanceKm ?? 6.2;
  const totalDistance = history.reduce((sum, item) => sum + item.distanceKm, 0);
  const runCount = history.length || 1;
  const durationMinutes = Math.max(24, Math.round(latestDistance * 6.4));
  const avgPace = formatPace(durationMinutes / Math.max(latestDistance, 1));
  const averageHeartRate = 136 + Math.min(18, Math.round(latestDistance * 2.4));
  const maxHeartRate = averageHeartRate + 24;
  const stepsToday = Math.round(latestDistance * 1320);
  const totalDuration = Math.round(totalDistance * 6.4);

  return [
    {
      id: "heart-rate",
      label: "Heart rate",
      value: `${averageHeartRate} bpm`,
      meta: `Peak ${maxHeartRate} bpm`
    },
    {
      id: "steps",
      label: "Steps",
      value: stepsToday.toLocaleString(),
      meta: `Across ${runCount} synced runs`
    },
    {
      id: "pace",
      label: "Pace",
      value: avgPace,
      meta: `From latest ${latestDistance.toFixed(1)} km sync`
    },
    {
      id: "duration",
      label: "Duration",
      value: `${durationMinutes} min`,
      meta: `${totalDuration} min synced total`
    },
    {
      id: "distance",
      label: "Distance",
      value: `${latestDistance.toFixed(1)} km`,
      meta: `${totalDistance.toFixed(1)} km overall`
    }
  ];
};
