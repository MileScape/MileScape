import { motion } from "framer-motion";
import {
  Activity,
  ChevronRight,
  Clock3,
  Footprints,
  Gauge,
  HeartPulse,
  RefreshCw,
  Watch,
  X
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { buildWearableDataSnapshot, collectedDataTypes, type CollectedDataType } from "../data/wearables";
import { useAppState } from "../hooks/useAppState";
import { cn } from "../utils/cn";

type SheetMode = "disconnect" | null;

const getDeviceIcon = () => <Watch className="h-5 w-5" />;

const collectedDataIconMap: Record<CollectedDataType["id"], typeof HeartPulse> = {
  "heart-rate": HeartPulse,
  steps: Footprints,
  pace: Gauge,
  duration: Clock3,
  distance: Activity
};

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
  const navigate = useNavigate();
  const {
    state,
    disconnectWearable,
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

  const syncedThisWeekDistance = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 6);

    return state.wearableSyncHistory
      .filter((item) => new Date(item.syncedAt) >= weekAgo)
      .reduce((sum, item) => sum + item.distanceKm, 0);
  }, [now, state.wearableSyncHistory]);

  const wearableDataSnapshot = useMemo(
    () => buildWearableDataSnapshot(state.wearableSyncHistory),
    [state.wearableSyncHistory],
  );

  const showToast = (message: string) => setToast(message);

  const handleSync = () => showToast(syncWearableNow().message);
  const handleDisconnect = () => {
    const result = disconnectWearable();
    showToast(result.message);
    if (result.success) {
      setSheetMode(null);
      navigate("/wearables/connect", { replace: true });
    }
  };

  if (!hasConnectedDevice) {
    return <Navigate to="/wearables/connect" replace />;
  }

  return (
    <div className="pb-10">
      {toast ? (
        <div className="sticky top-2 z-30 mb-4 rounded-[22px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-[0_14px_36px_rgba(40,62,50,0.18)]">
          {toast}
        </div>
      ) : null}

      <div className="space-y-8">
          <section className="space-y-3 pt-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">WEARABLES</p>
            <h1 className="text-[2rem] font-semibold tracking-[-0.06em] text-ink">Bring runs into MileScape</h1>
          </section>

          <Surface className="relative overflow-hidden bg-[linear-gradient(152deg,rgba(255,255,255,0.8),rgba(232,241,232,0.97))] px-6 py-7">
            <motion.div
              animate={{ y: [0, -10, 0], opacity: [0.42, 0.72, 0.42] }}
              transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-[-52px] top-[28px] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(188,210,193,0.82),rgba(188,210,193,0.08)_70%,transparent_74%)]"
            />
            <div className="relative space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Connected View</p>
                  <h2 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.05em] text-ink">{connectedDevice?.name}</h2>
                  <p className="mt-3 text-sm text-sage-600">
                    Connected · Last synced {connectedDevice ? formatSyncTime(connectedDevice.lastSyncedAt) : "--:--"}
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/80 text-sage-700 shadow-[0_14px_34px_rgba(49,63,50,0.12)] ring-1 ring-white/85">
                  {getDeviceIcon()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(245,248,244,0.92))] px-4 py-5 text-left shadow-[0_14px_34px_rgba(49,60,50,0.06)]">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-sage-500">Today</p>
                  <p className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-ink">{syncedTodayDistance.toFixed(1)} km</p>
                </div>
                <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(241,247,242,0.82),rgba(255,255,255,0.72))] px-4 py-5 text-left shadow-[0_14px_34px_rgba(49,60,50,0.06)]">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-sage-500">Week</p>
                  <p className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-ink">{syncedThisWeekDistance.toFixed(1)} km</p>
                </div>
              </div>
            </div>
          </Surface>

          <Section title="Collected data" eyebrow="Imported metrics">
            <Surface>
              {wearableDataSnapshot.map((item) => {
                const Icon = collectedDataIconMap[item.id];
                const config = collectedDataTypes.find((entry) => entry.id === item.id);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-50 text-sage-700 ring-1 ring-sage-900/6">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{item.label}</p>
                        <p className="mt-1 text-xs text-sage-500">{config?.detail ?? item.meta}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">{item.value}</p>
                      <p className="mt-1 text-[11px] text-sage-500">{item.meta}</p>
                    </div>
                  </div>
                );
              })}
            </Surface>
          </Section>

          <Section title="Wearables settings" eyebrow="Actions">
            <Surface>
              <button
                type="button"
                onClick={handleSync}
                className="flex w-full items-center justify-between border-t border-sage-900/8 py-4 text-left first:border-t-0 first:pt-0"
              >
                <div>
                  <p className="text-sm font-medium text-ink">Sync now</p>
                  <p className="mt-1 text-xs text-sage-500">Pull the latest run data from your wearable</p>
                </div>
                <RefreshCw className="h-4 w-4 text-sage-500" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/wearables/connect")}
                className="flex w-full items-center justify-between border-t border-sage-900/8 py-4 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-ink">Connect new device</p>
                  <p className="mt-1 text-xs text-sage-500">Go to the device pairing screen</p>
                </div>
                <ChevronRight className="h-4 w-4 text-sage-400" />
              </button>
              <button
                type="button"
                onClick={() => setSheetMode("disconnect")}
                className="flex w-full items-center justify-between border-t border-sage-900/8 py-4 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-rose-600">Disconnect</p>
                  <p className="mt-1 text-xs text-sage-500">Remove this wearable from MileScape</p>
                </div>
                <ChevronRight className="h-4 w-4 text-rose-300" />
              </button>
            </Surface>
          </Section>

          <Section title="Sync activity" eyebrow="Recent imports">
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
        </div>

      <BottomSheet
        open={sheetMode === "disconnect"}
        title="Disconnect wearable?"
        onClose={() => setSheetMode(null)}
      >
        <div className="space-y-3">
          <p className="text-sm leading-6 text-sage-600">
            {connectedDevice?.name} will stop syncing with MileScape. You can reconnect it later from the device screen.
          </p>
          <button
            type="button"
            onClick={handleDisconnect}
            className="flex w-full items-center justify-between rounded-[22px] bg-rose-50 px-4 py-4 text-left ring-1 ring-rose-100"
          >
            <span className="text-sm font-medium text-rose-600">Confirm disconnect</span>
            <ChevronRight className="h-4 w-4 text-rose-300" />
          </button>
          <button
            type="button"
            onClick={() => setSheetMode(null)}
            className="flex w-full items-center justify-between rounded-[22px] bg-white/82 px-4 py-4 text-left ring-1 ring-sage-900/8"
          >
            <span className="text-sm font-medium text-ink">Cancel</span>
            <ChevronRight className="h-4 w-4 text-sage-400" />
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
