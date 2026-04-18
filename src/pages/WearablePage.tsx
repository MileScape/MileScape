import {
  ChevronLeft,
  Heart,
  MapPinned,
  MessageCircle,
  Play,
  Settings2,
  Square,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../utils/cn";

interface WearableLandmark {
  id: string;
  name: string;
  distanceKm: number;
  location: string;
}

const wearableLandmarks: WearableLandmark[] = [
  { id: "west-lake", name: "West Lake", distanceKm: 20, location: "Hangzhou" },
  { id: "central-park", name: "Central Park", distanceKm: 9.8, location: "New York" },
  { id: "jinji-lake", name: "Jinji Lake", distanceKm: 14.5, location: "Suzhou" },
  { id: "sydney-opera-house", name: "Sydney Opera House", distanceKm: 6.2, location: "Sydney" },
];

const formatDistance = (value: number) => `${value.toFixed(1)} km`;

const formatElapsed = (elapsedSeconds: number) => {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const iconButtonClassName =
  "flex h-11 w-11 items-center justify-center rounded-full border border-sage-100 bg-white/88 text-sage-700 shadow-card ring-1 ring-white/80 backdrop-blur-xl transition hover:bg-white";

type WearableScreen = "home" | "settings" | "messages" | "landmarks" | "heart";

const OverlayHeader = ({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) => (
  <div className="flex items-center justify-between">
    <button type="button" aria-label="Back" className={iconButtonClassName} onClick={onBack}>
      <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.1} />
    </button>
    <span className="text-sm font-medium tracking-[-0.02em] text-ink">{title}</span>
    <div className="h-11 w-11" />
  </div>
);

export const WearablePage = () => {
  const [selectedLandmarkId, setSelectedLandmarkId] = useState(wearableLandmarks[0].id);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [heartRate, setHeartRate] = useState(128);
  const [activeScreen, setActiveScreen] = useState<WearableScreen>("home");

  const selectedLandmark =
    wearableLandmarks.find((landmark) => landmark.id === selectedLandmarkId) ?? wearableLandmarks[0];

  const progressPercent = Math.min(100, (distanceKm / selectedLandmark.distanceKm) * 100);
  const statusLabel = useMemo(() => formatElapsed(elapsedSeconds), [elapsedSeconds]);
  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
      setDistanceKm((current) =>
        Math.min(selectedLandmark.distanceKm, Number((current + 0.04).toFixed(2))),
      );
      setHeartRate((current) => {
        const next = current + (Math.random() > 0.55 ? 2 : -1);
        return Math.max(118, Math.min(148, next));
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRecording, selectedLandmark.distanceKm]);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    setDistanceKm(0);
    setHeartRate(128);
    setElapsedSeconds(0);
  }, [isRecording, selectedLandmarkId]);

  const handleRunToggle = () => {
    setActiveScreen("home");
    setIsRecording((current) => !current);
  };

  const handleOpenScreen = (screen: WearableScreen) => {
    setActiveScreen(screen);
  };

  const renderOverlay = () => {
    if (activeScreen === "home") {
      return null;
    }

    if (activeScreen === "settings") {
      return (
        <div className="absolute inset-0 z-20 flex flex-col rounded-[2.6rem] bg-[linear-gradient(180deg,rgba(247,245,240,0.98),rgba(236,243,237,0.98))] px-5 py-5 backdrop-blur-2xl">
          <OverlayHeader title="Settings" onBack={() => setActiveScreen("home")} />
          <div className="mt-8 space-y-3">
            {["Auto Pause", "Voice Feedback", "Haptic Alerts"].map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-[1.3rem] border border-sage-100 bg-white/88 px-4 py-4"
              >
                <span className="text-sm text-ink">{item}</span>
                <span
                  className={cn(
                    "h-6 w-11 rounded-full p-[2px] transition",
                    index === 2 ? "bg-sage-200" : "bg-sage-700",
                  )}
                >
                  <span
                    className={cn(
                      "block h-5 w-5 rounded-full bg-white shadow-sm transition",
                      index === 2 ? "translate-x-0" : "translate-x-5",
                    )}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeScreen === "messages") {
      return (
        <div className="absolute inset-0 z-20 flex flex-col rounded-[2.6rem] bg-[linear-gradient(180deg,rgba(247,245,240,0.98),rgba(239,244,239,0.98))] px-5 py-5 backdrop-blur-2xl">
          <OverlayHeader title="Messages" onBack={() => setActiveScreen("home")} />
          <div className="mt-8 space-y-3">
            {[
              { from: "Coach", text: "Pace steady." },
              { from: "Ava", text: "Nice route pick." },
              { from: "Crew", text: "Run synced." },
            ].map((message) => (
              <div
                key={message.from}
                className="rounded-[1.3rem] border border-sage-100 bg-white/88 px-4 py-4"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-sage-500">{message.from}</p>
                <p className="mt-2 text-sm text-ink">{message.text}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeScreen === "heart") {
      return (
        <div className="absolute inset-0 z-20 flex flex-col rounded-[2.6rem] bg-[linear-gradient(180deg,rgba(247,245,240,0.98),rgba(245,233,228,0.98))] px-5 py-5 backdrop-blur-2xl">
          <OverlayHeader title="Heart" onBack={() => setActiveScreen("home")} />
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Heart className="h-10 w-10 text-[#ff9e9e]" fill="currentColor" strokeWidth={1.8} />
            <div className="mt-6 text-[4rem] font-semibold leading-none tracking-[-0.08em] text-ink">
              {heartRate}
            </div>
            <div className="mt-2 text-sm text-sage-500">BPM</div>
            <div className="mt-8 h-2 w-40 overflow-hidden rounded-full bg-sage-100">
              <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#d28f7d,#f4d8ca)]" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 z-20 flex flex-col rounded-[2.6rem] bg-[linear-gradient(180deg,rgba(247,245,240,0.98),rgba(236,243,237,0.98))] px-5 py-5 backdrop-blur-2xl">
        <OverlayHeader title="Landmarks" onBack={() => setActiveScreen("home")} />
        <div className="mt-7 space-y-2 overflow-y-auto">
          {wearableLandmarks.map((landmark) => {
            const active = landmark.id === selectedLandmarkId;

            return (
              <button
                key={landmark.id}
                type="button"
                onClick={() => {
                  setSelectedLandmarkId(landmark.id);
                  setActiveScreen("home");
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-[1.2rem] px-3 py-3 text-left transition",
                  active ? "bg-sage-700 text-white" : "bg-white/88 text-ink ring-1 ring-sage-100",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{landmark.name}</p>
                  <p
                    className={cn(
                      "mt-1 text-[11px] uppercase tracking-[0.18em]",
                      active ? "text-white/60" : "text-sage-500",
                    )}
                  >
                    {landmark.location}
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-3 shrink-0 text-xs font-medium",
                    active ? "text-white/68" : "text-sage-500",
                  )}
                >
                  {formatDistance(landmark.distanceKm)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96)_0%,rgba(243,247,242,0.98)_40%,rgba(220,232,221,0.92)_100%)]" />
      <div className="absolute left-1/2 top-28 h-64 w-64 -translate-x-1/2 rounded-full bg-sage-200/45 blur-3xl" />
      <div className="absolute bottom-12 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#ddb768]/10 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-[344px] max-w-full">
          <div className="relative aspect-square overflow-hidden rounded-[2.9rem] border border-white/90 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98)_0%,rgba(247,245,240,0.98)_42%,rgba(220,232,221,0.92)_100%)] shadow-[0_28px_72px_rgba(64,79,71,0.14)] ring-1 ring-white/80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,255,255,0.86),transparent_26%),radial-gradient(circle_at_50%_86%,rgba(120,146,132,0.10),transparent_28%)]" />

            <div className="relative z-10 h-full px-5 pb-6 pt-5 text-ink">
              <div className="absolute inset-x-5 top-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  aria-label="Settings"
                  className={iconButtonClassName}
                  onClick={() => handleOpenScreen("settings")}
                >
                  <Settings2 className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </button>
                <div className="flex justify-end">
                  <button
                    type="button"
                    aria-label="Messages"
                    className={iconButtonClassName}
                    onClick={() => handleOpenScreen("messages")}
                  >
                    <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2.1} />
                  </button>
                </div>
              </div>

              <div className="pointer-events-none relative z-10 flex h-full items-center justify-center pb-20 pt-16">
                {!isRecording ? (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRunToggle}
                      className="pointer-events-auto flex h-40 w-40 flex-col items-center justify-center rounded-full border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,243,237,0.98))] text-sage-700 shadow-[0_18px_48px_rgba(63,84,72,0.12)] transition duration-300 hover:scale-[1.02]"
                      aria-label="Start run"
                    >
                      <Play className="ml-1 h-9 w-9 fill-current" strokeWidth={2} />
                    </button>

                    <div className="pointer-events-none absolute left-1/2 top-[calc(50%+5.8rem)] -translate-x-1/2 text-center">
                      <p className="text-sm font-medium text-ink">Start</p>
                      <p className="mt-3 text-sm font-medium text-ink">{selectedLandmark.name}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-sage-500">
                        {selectedLandmark.location}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full flex-col items-center pt-8 text-center">
                    <div className="rounded-full border border-sage-100 bg-white/84 px-4 py-1.5 text-[11px] font-medium tracking-[0.24em] text-sage-500">
                      {statusLabel}
                    </div>
                    <div className="mt-5 text-[4.2rem] font-semibold leading-none tracking-[-0.08em] text-ink">
                      {distanceKm.toFixed(1)}
                    </div>
                    <div className="mt-2 text-sm font-medium text-sage-500">KM</div>

                    <div className="mt-6 h-2 w-40 overflow-hidden rounded-full bg-sage-100">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#60796d,#dce8dd)]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <p className="mt-4 text-sm font-medium text-ink">{selectedLandmark.name}</p>
                    <p className="mt-1 text-xs text-sage-500">
                      {formatDistance(distanceKm)} / {formatDistance(selectedLandmark.distanceKm)}
                    </p>

                    <button
                      type="button"
                      onClick={handleRunToggle}
                      className="pointer-events-auto mt-7 flex h-16 w-16 items-center justify-center rounded-full border border-[#f4d8ca] bg-white text-[#c37d6b] shadow-[0_12px_28px_rgba(195,125,107,0.14)] transition hover:bg-[#fff8f4]"
                      aria-label="Stop run"
                    >
                      <Square className="h-5 w-5 fill-current" strokeWidth={2.2} />
                    </button>
                  </div>
                )}
              </div>

              <div
                className={cn(
                  "absolute inset-x-5 bottom-6 z-0 grid grid-cols-2 gap-3 transition-opacity",
                  isRecording && "pointer-events-none opacity-0",
                )}
              >
                <button
                  type="button"
                  aria-label="Choose landmark"
                  onClick={() => handleOpenScreen("landmarks")}
                  className={cn(
                    iconButtonClassName,
                    activeScreen === "landmarks" && "border-sage-700 bg-sage-700 text-white",
                  )}
                >
                  <MapPinned className="h-[18px] w-[18px]" strokeWidth={2.1} />
                </button>
                <div className="flex justify-end">
                  <button
                    type="button"
                    aria-label="Heart rate"
                    onClick={() => handleOpenScreen("heart")}
                    className={cn(
                      iconButtonClassName,
                      activeScreen === "heart" && "border-[#f4d8ca] bg-[#f4d8ca] text-[#b56b6b]",
                    )}
                  >
                    <Heart className="h-[18px] w-[18px]" strokeWidth={2.1} />
                  </button>
                </div>
              </div>
            </div>

            {renderOverlay()}
          </div>
        </div>
      </div>
    </div>
  );
};
