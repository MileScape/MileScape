import { motion } from "framer-motion";
import {
  Activity,
  Apple,
  Check,
  ChevronRight,
  Clock3,
  HeartPulse,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Watch,
  X
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAppState } from "../hooks/useAppState";
import type { WearableAvailability } from "../types";
import { cn } from "../utils/cn";

type SheetMode = "pair" | "manage" | null;

const supportedDevices: Array<{
  id: string;
  name: string;
  maker: string;
  availability: WearableAvailability;
}> = [
  { id: "apple-watch", name: "Apple Watch", maker: "Apple", availability: "available" },
  { id: "garmin", name: "Garmin", maker: "Garmin", availability: "available" },
  { id: "fitbit", name: "Fitbit", maker: "Google", availability: "available" },
  { id: "huawei-watch", name: "Huawei Watch", maker: "Huawei", availability: "coming_soon" },
  { id: "xiaomi-band", name: "Xiaomi Band", maker: "Xiaomi", availability: "coming_soon" }
];

const syncedDataTypes = [
  { label: "Distance", status: "Ready" },
  { label: "Duration", status: "Ready" },
  { label: "Pace", status: "Ready" },
  { label: "Run completion time", status: "Ready" },
  { label: "Heart rate", status: "Coming soon" }
];

const formatSyncTime = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

const formatTimelineTime = (value: string) => {
  const date = new Date(value);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return formatSyncTime(value);
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const isSameDay = (left: string, right: Date) => new Date(left).toDateString() === right.toDateString();

const BottomSheet = ({
  open,
  title,
  subtitle,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-ink/18 backdrop-blur-[2px]"
        aria-label="Close sheet"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[32px] bg-[#fbf9f4]/96 px-5 pb-8 pt-4 shadow-[0_-18px_60px_rgba(36,50,40,0.18)] ring-1 ring-sage-900/8 backdrop-blur-2xl">
        <div className="mx-auto h-1.5 w-14 rounded-full bg-sage-200" />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">WEARABLES</p>
            <h3 className="mt-1 text-[1.45rem] font-semibold tracking-[-0.03em] text-ink">{title}</h3>
            {subtitle ? <p className="mt-2 text-sm leading-6 text-sage-600">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/80 p-2 text-sage-700 ring-1 ring-sage-900/8"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};

const Section = ({
  title,
  eyebrow,
  action,
  children
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className="space-y-4 border-t border-sage-900/8 pt-6 first:border-t-0 first:pt-0">
    <div className="flex items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">{eyebrow}</p> : null}
        <h2 className="mt-1 text-[1.3rem] font-semibold tracking-[-0.03em] text-ink">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Surface = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div
    className={cn(
      "rounded-[28px] bg-white/68 p-5 shadow-[0_22px_60px_rgba(49,60,50,0.08)] ring-1 ring-white/80 backdrop-blur-xl",
      className,
    )}
  >
    {children}
  </div>
);

export const WearablesPage = () => {
  const {
    state,
    connectWearable,
    disconnectWearable,
    reconnectWearable,
    setWearableAutoSync,
    syncWearableNow
  } = useAppState();
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const connection = state.wearableConnection;
  const hasConnectedDevice = Boolean(connection);
  const connectedDevice = connection;
  const now = new Date();

  const syncedTodayDistance = useMemo(
    () =>
      state.wearableSyncHistory
        .filter((item) => isSameDay(item.syncedAt, now))
        .reduce((sum, item) => sum + item.distanceKm, 0),
    [now, state.wearableSyncHistory],
  );

  const importedRunsToday = useMemo(
    () => state.wearableSyncHistory.filter((item) => isSameDay(item.syncedAt, now)).length,
    [now, state.wearableSyncHistory],
  );

  const syncedThisWeekDistance = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 6);

    return state.wearableSyncHistory
      .filter((item) => new Date(item.syncedAt) >= weekAgo)
      .reduce((sum, item) => sum + item.distanceKm, 0);
  }, [now, state.wearableSyncHistory]);

  const showToast = (message: string) => setToast(message);

  const handleConnect = (deviceId: string, deviceName: string) => {
    const result = connectWearable({ id: deviceId, name: deviceName });
    showToast(result.message);
    if (result.success) {
      setSheetMode(null);
    }
  };

  const handleSync = () => showToast(syncWearableNow().message);
  const handleReconnect = () => showToast(reconnectWearable().message);
  const handleDisconnect = () => {
    const result = disconnectWearable();
    showToast(result.message);
    if (result.success) {
      setSheetMode(null);
    }
  };

  const handleToggleAutoSync = () => {
    if (!connection) {
      return;
    }

    showToast(setWearableAutoSync(!connection.autoSyncEnabled).message);
  };

  return (
    <div className="pb-10">
      {toast ? (
        <div className="sticky top-2 z-30 mb-4 rounded-[22px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-[0_14px_36px_rgba(40,62,50,0.18)]">
          {toast}
        </div>
      ) : null}

      {!hasConnectedDevice ? (
        <div className="space-y-8">
          <section className="space-y-3 pt-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">WEARABLES</p>
            <h1 className="max-w-[17ch] text-[2rem] font-semibold tracking-[-0.06em] text-ink">
              Sync your movement with your map
            </h1>
          </section>

          <Surface className="overflow-hidden bg-[linear-gradient(160deg,rgba(255,255,255,0.86),rgba(234,242,235,0.96))] px-6 py-7">
            <div className="relative flex min-h-[42vh] flex-col items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.55, 0.75, 0.55] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(188,210,193,0.7),rgba(188,210,193,0.08)_68%,transparent_72%)]"
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-36 w-36 items-center justify-center rounded-[36px] bg-white/78 shadow-[0_22px_48px_rgba(48,63,50,0.12)] ring-1 ring-white/85 backdrop-blur-xl"
              >
                <Watch className="h-16 w-16 text-sage-700" />
              </motion.div>
              <div className="relative mt-8 text-center">
                <h2 className="text-[1.8rem] font-semibold tracking-[-0.04em] text-ink">No wearable connected</h2>
                <p className="mt-3 max-w-[25ch] text-sm leading-6 text-sage-600">
                  Connect a device to automatically sync your runs into MileScape.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSheetMode("pair")}
                className="relative mt-8 inline-flex items-center rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-900"
              >
                Start Pairing
              </button>
            </div>
          </Surface>

          <Section title="Why connect" eyebrow="What it unlocks">
            <div className="space-y-0">
              {[
                "Automatically update destination progress",
                "Validate PaceCrew missions",
                "Earn Stamps from synced runs",
                "Unlock Paceport content more seamlessly"
              ].map((item) => (
                <div key={item} className="flex items-center justify-between border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0 last:pb-0">
                  <p className="text-sm text-ink">{item}</p>
                  <Check className="h-4 w-4 text-sage-500" />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Supported devices" eyebrow="Compatibility">
            <Surface>
              {supportedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-50 text-sage-700 ring-1 ring-sage-900/6">
                      {device.id === "apple-watch" ? <Apple className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{device.name}</p>
                      <p className="mt-1 text-xs text-sage-500">{device.maker}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]",
                      device.availability === "available"
                        ? "bg-sage-100/85 text-sage-700"
                        : "bg-sand/70 text-sage-500",
                    )}
                  >
                    {device.availability === "available" ? "Available" : "Coming soon"}
                  </span>
                </div>
              ))}
            </Surface>
          </Section>
        </div>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3 pt-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">WEARABLES</p>
                <h1 className="max-w-[17ch] text-[2rem] font-semibold tracking-[-0.06em] text-ink">
                  Bring your real runs into MileScape
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setSheetMode("manage")}
                className="rounded-full bg-white/80 px-4 py-2.5 text-sm font-medium text-sage-700 ring-1 ring-sage-900/8"
              >
                Manage
              </button>
            </div>
          </section>

          <Surface className="space-y-5 bg-[linear-gradient(160deg,rgba(255,255,255,0.8),rgba(232,241,232,0.96))]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Current Device</p>
                <h2 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-ink">{connectedDevice?.name}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-sage-600">
                  <span className="rounded-full bg-white/80 px-3 py-2 ring-1 ring-sage-900/8">Connected</span>
                  <span>Last synced {connectedDevice ? formatSyncTime(connectedDevice.lastSyncedAt) : "--:--"}</span>
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/78 text-sage-700 shadow-[0_14px_34px_rgba(49,63,50,0.12)] ring-1 ring-white/85">
                {connectedDevice?.id === "apple-watch" ? <Apple className="h-8 w-8" /> : <Watch className="h-8 w-8" />}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[22px] bg-white/78 px-3 py-4 ring-1 ring-sage-900/8">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-ink">{syncedTodayDistance.toFixed(1)} km</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-sage-500">Synced today</p>
              </div>
              <div className="rounded-[22px] bg-white/78 px-3 py-4 ring-1 ring-sage-900/8">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-ink">{importedRunsToday}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-sage-500">Runs imported</p>
              </div>
              <div className="rounded-[22px] bg-white/78 px-3 py-4 ring-1 ring-sage-900/8">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-ink">{syncedThisWeekDistance.toFixed(1)} km</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-sage-500">This week</p>
              </div>
            </div>
          </Surface>

          <Section
            title="Sync activity"
            eyebrow="Recent imports"
            action={
              <button type="button" onClick={handleSync} className="text-sm font-medium text-sage-700">
                Sync now
              </button>
            }
          >
            <div className="space-y-0">
              {state.wearableSyncHistory.map((item) => (
                <div key={item.id} className="flex items-start gap-4 border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0 last:pb-0">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-sage-50 text-sage-700 ring-1 ring-sage-900/6">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{item.title}</p>
                        <p className="mt-1 text-xs text-sage-500">{item.sourceName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-ink">{item.distanceKm.toFixed(1)} km</p>
                        <p className="mt-1 text-xs text-sage-500">{formatTimelineTime(item.syncedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="What gets synced" eyebrow="Imported data">
            <Surface>
              {syncedDataTypes.map((item) => (
                <div key={item.label} className="flex items-center justify-between border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-50 text-sage-700 ring-1 ring-sage-900/6">
                      {item.label === "Heart rate" ? <HeartPulse className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                    </div>
                    <p className="text-sm text-ink">{item.label}</p>
                  </div>
                  <span className={cn("text-[11px] uppercase tracking-[0.14em]", item.status === "Ready" ? "text-sage-600" : "text-sage-400")}>
                    {item.status}
                  </span>
                </div>
              ))}
            </Surface>
          </Section>

          <Section title="How MileScape uses this data" eyebrow="Powered by sync">
            <Surface>
              {[
                "Destination progress stays aligned with your real-world runs.",
                "PaceCrew mission validation becomes automatic after import.",
                "Synced activity can feed Stamps rewards and Paceport unlock flow.",
                "Your wearable history stays lightweight and readable here."
              ].map((item) => (
                <div key={item} className="flex gap-3 border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0 last:pb-0">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
                  <p className="text-sm leading-6 text-sage-600">{item}</p>
                </div>
              ))}
            </Surface>
          </Section>

          <Section title="Device actions" eyebrow="Controls">
            <Surface>
              <button type="button" onClick={handleSync} className="flex w-full items-center justify-between border-t border-sage-900/8 py-4 text-left first:border-t-0 first:pt-0">
                <span className="text-sm text-ink">Sync now</span>
                <RefreshCw className="h-4 w-4 text-sage-500" />
              </button>
              <button type="button" onClick={handleReconnect} className="flex w-full items-center justify-between border-t border-sage-900/8 py-4 text-left">
                <span className="text-sm text-ink">Reconnect</span>
                <ChevronRight className="h-4 w-4 text-sage-400" />
              </button>
              <button type="button" onClick={handleToggleAutoSync} className="flex w-full items-center justify-between border-t border-sage-900/8 py-4 text-left">
                <span className="text-sm text-ink">Auto Sync</span>
                <span className={cn("rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em]", connectedDevice?.autoSyncEnabled ? "bg-sage-100 text-sage-700" : "bg-sand/70 text-sage-500")}>
                  {connectedDevice?.autoSyncEnabled ? "On" : "Off"}
                </span>
              </button>
              <button type="button" onClick={() => setSheetMode("manage")} className="flex w-full items-center justify-between border-t border-sage-900/8 py-4 text-left text-rose-600">
                <span className="text-sm font-medium">Disconnect</span>
                <ChevronRight className="h-4 w-4 text-rose-300" />
              </button>
            </Surface>
          </Section>
        </div>
      )}

      <BottomSheet
        open={sheetMode === "pair"}
        title="Choose a device"
        subtitle="Start with a supported wearable and MileScape will prepare a calm, automatic sync flow."
        onClose={() => setSheetMode(null)}
      >
        <div className="space-y-3">
          {supportedDevices.map((device) => (
            <button
              key={device.id}
              type="button"
              disabled={device.availability !== "available"}
              onClick={() => handleConnect(device.id, device.name)}
              className={cn(
                "flex w-full items-center justify-between rounded-[24px] px-4 py-4 text-left ring-1 transition",
                device.availability === "available"
                  ? "bg-white/82 text-ink ring-sage-900/8 hover:bg-white"
                  : "bg-sage-50/70 text-sage-400 ring-sage-900/5",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-50 text-sage-700 ring-1 ring-sage-900/6">
                  {device.id === "apple-watch" ? <Apple className="h-5 w-5" /> : <Watch className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{device.name}</p>
                  <p className="mt-1 text-xs text-sage-500">{device.maker}</p>
                </div>
              </div>
              <span className="text-[11px] uppercase tracking-[0.14em]">
                {device.availability === "available" ? "Pair" : "Soon"}
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        open={sheetMode === "manage"}
        title="Manage connection"
        subtitle={connection ? `${connection.name} is active in MileScape.` : undefined}
        onClose={() => setSheetMode(null)}
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              handleSync();
              setSheetMode(null);
            }}
            className="flex w-full items-center justify-between rounded-[22px] bg-white/82 px-4 py-4 text-left ring-1 ring-sage-900/8"
          >
            <span className="text-sm font-medium text-ink">Sync now</span>
            <RefreshCw className="h-4 w-4 text-sage-500" />
          </button>
          <button
            type="button"
            onClick={() => {
              handleReconnect();
              setSheetMode(null);
            }}
            className="flex w-full items-center justify-between rounded-[22px] bg-white/82 px-4 py-4 text-left ring-1 ring-sage-900/8"
          >
            <span className="text-sm font-medium text-ink">Reconnect</span>
            <ChevronRight className="h-4 w-4 text-sage-400" />
          </button>
          <button
            type="button"
            onClick={handleDisconnect}
            className="flex w-full items-center justify-between rounded-[22px] bg-rose-50 px-4 py-4 text-left ring-1 ring-rose-100"
          >
            <span className="text-sm font-medium text-rose-600">Disconnect</span>
            <ChevronRight className="h-4 w-4 text-rose-300" />
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
