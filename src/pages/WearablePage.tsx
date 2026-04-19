import {
  ChevronLeft,
  Heart,
  MapPinned,
  MessageCircle,
  Play,
  Settings,
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

// 优化：提取出按钮基础样式，并加入按压缩放效果 (active:scale-95)
const iconButtonClassName =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1C1C1E] text-white transition active:scale-95";

type WearableScreen = "home" | "settings" | "messages" | "landmarks" | "heart";

const OverlayHeader = ({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) => (
  <div className="flex items-center justify-between shrink-0 pointer-events-none">
    <button type="button" aria-label="Back" className={cn(iconButtonClassName, "pointer-events-auto hover:bg-neutral-800")} onClick={onBack}>
      <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
    </button>
    <span className="text-sm font-semibold tracking-wide text-white">{title}</span>
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

  const [userSettings, setUserSettings] = useState({
    "Auto Pause": false,
    "Voice Feedback": false,
    "Haptic Alerts": true,
  });

  const selectedLandmark =
    wearableLandmarks.find((landmark) => landmark.id === selectedLandmarkId) ?? wearableLandmarks[0];

  const radius = 144;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min(100, (distanceKm / selectedLandmark.distanceKm) * 100);
  const offset = circumference - (progressPercent / 100) * circumference;

  const statusLabel = useMemo(() => formatElapsed(elapsedSeconds), [elapsedSeconds]);

  useEffect(() => {
    if (!isRecording) return;
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
    if (!isRecording) return;
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
    if (activeScreen === "home") return null;

    if (activeScreen === "settings") {
      return (
        <div className="absolute inset-0 z-50 flex flex-col rounded-[2.6rem] bg-black px-5 py-5 pointer-events-auto">
          <OverlayHeader title="Settings" onBack={() => setActiveScreen("home")} />
          <div className="mt-8 space-y-3">
            {(Object.keys(userSettings) as Array<keyof typeof userSettings>).map((item) => {
              const isActive = userSettings[item];
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setUserSettings(prev => ({ ...prev, [item]: !prev[item] }))}
                  className="flex w-full items-center justify-between rounded-[1.3rem] bg-[#1C1C1E] px-4 py-4 transition active:scale-[0.98]"
                >
                  <span className="text-sm font-medium text-white">{item}</span>
                  <span className={cn("flex h-6 w-11 shrink-0 items-center rounded-full p-[2px] transition-colors", isActive ? "bg-[#34C759]" : "bg-neutral-600")}>
                    <span className={cn("block h-5 w-5 rounded-full bg-white shadow-sm transition-transform", isActive ? "translate-x-5" : "translate-x-0")} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (activeScreen === "messages") {
      return (
        <div className="absolute inset-0 z-50 flex flex-col rounded-[2.6rem] bg-black px-5 py-5 pointer-events-auto">
          <OverlayHeader title="Messages" onBack={() => setActiveScreen("home")} />
          <div className="mt-6 space-y-3 overflow-y-auto pb-6">
            {["Coach", "Ava", "Crew"].map((from, i) => (
              <div key={i} className="rounded-[1.3rem] bg-[#1C1C1E] px-4 py-4 shrink-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0A84FF]">{from}</p>
                <p className="mt-1 text-sm font-medium text-white">Running notifications and alerts.</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeScreen === "heart") {
      return (
        <div className="absolute inset-0 z-50 flex flex-col rounded-[2.6rem] bg-black px-5 py-5 pointer-events-auto">
          <OverlayHeader title="Heart Rate" onBack={() => setActiveScreen("home")} />
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Heart className="h-12 w-12 text-[#FF2D55]" fill="currentColor" strokeWidth={1} />
            <div className="mt-6 text-[4.5rem] font-bold tabular-nums leading-none tracking-tight text-white">{heartRate}</div>
            <div className="mt-1 text-sm font-bold text-[#FF2D55]">BPM</div>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 z-50 flex flex-col rounded-[2.6rem] bg-black px-5 py-5 pointer-events-auto">
        <OverlayHeader title="Landmarks" onBack={() => setActiveScreen("home")} />
        <div className="mt-7 space-y-2 overflow-y-auto pb-4">
          {wearableLandmarks.map((landmark) => {
            const active = landmark.id === selectedLandmarkId;
            return (
              <button
                key={landmark.id}
                type="button"
                onClick={() => { setSelectedLandmarkId(landmark.id); setActiveScreen("home"); }}
                className={cn("flex w-full items-center justify-between rounded-[1.2rem] px-4 py-3.5 text-left transition shrink-0", active ? "bg-neutral-800" : "bg-[#1C1C1E]")}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{landmark.name}</p>
                  <p className="mt-0.5 text-[12px] text-gray-400">{landmark.location}</p>
                </div>
                <span className={cn("ml-3 shrink-0 text-sm font-medium tabular-nums", active ? "text-[#34C759]" : "text-gray-400")}>
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
        <div className="w-[344px] max-w-full transform scale-[0.75] origin-center transition-transform">
          
          <div className="relative aspect-square overflow-hidden rounded-[2.9rem] border-[6px] border-[#1C1C1E] bg-black shadow-[0_28px_72px_rgba(64,79,71,0.14)]">
            
            {isRecording && (
              <svg viewBox="0 0 332 332" className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none z-0">
                <circle
                  cx="166" cy="166" r={radius}
                  fill="none" stroke="#1C1C1E" strokeWidth="12"
                />
                <circle
                  cx="166" cy="166" r={radius}
                  fill="none" stroke="#34C759" strokeWidth="12"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset: offset }}
                  strokeLinecap="round"
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                />
              </svg>
            )}

            <div className="relative z-10 h-full w-full text-white">
              
              {/* 修复点1：顶部控制栏，z-30，容器透明且穿透，按钮强制响应 */}
              <div className="absolute inset-x-5 top-6 flex items-center justify-between z-30 pointer-events-none">
                <button
                  type="button"
                  className={cn(iconButtonClassName, isRecording ? "opacity-0 pointer-events-none" : "pointer-events-auto hover:bg-neutral-800")}
                  onClick={() => handleOpenScreen("settings")}
                >
                  <Settings className="h-[20px] w-[20px]" strokeWidth={2} />
                </button>
                <div className="pointer-events-none text-[13px] font-bold uppercase tracking-[0.2em] text-white/80">
                  MileScape
                </div>
                <button
                  type="button"
                  className={cn(iconButtonClassName, isRecording ? "opacity-0 pointer-events-none" : "pointer-events-auto hover:bg-neutral-800")}
                  onClick={() => handleOpenScreen("messages")}
                >
                  <MessageCircle className="h-[20px] w-[20px]" strokeWidth={2} />
                </button>
              </div>

              {/* 修复点2：中心数据区域，剥离为绝对定位，互不遮挡 */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                {!isRecording ? (
                  <>
                    <button
                      type="button"
                      onClick={handleRunToggle}
                      className="pointer-events-auto flex h-36 w-36 items-center justify-center rounded-full bg-[#34C759] text-black transition hover:scale-[1.03] active:scale-95"
                    >
                      <Play className="ml-1.5 h-12 w-12 fill-current" strokeWidth={1} />
                    </button>
                    <div className="absolute top-[calc(50%+5.5rem)] text-center w-full">
                      <p className="text-sm font-semibold text-[#34C759]">START</p>
                      <p className="mt-1 text-base font-medium text-white">{selectedLandmark.name}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex w-full flex-col items-center text-center mt-2 pt-8">
                    <div className="flex w-[72%] items-center justify-between text-[14px] font-bold tracking-wider tabular-nums">
                      <div className="flex items-center text-[#FF2D55]">
                        <Heart className="mr-1.5 h-4 w-4 animate-pulse" fill="currentColor" strokeWidth={2} />
                        {heartRate}
                      </div>
                      <div className="text-[#34C759]">{statusLabel}</div>
                    </div>

                    <div className="mt-2 text-[4.2rem] font-bold leading-none tracking-tight text-white tabular-nums">
                      {distanceKm.toFixed(1)}
                    </div>
                    <div className="mt-1 text-xs font-bold text-[#34C759]">KM</div>

                    <div className="mt-4 text-[10px] font-bold tracking-widest text-gray-400">
                      TARGET: {selectedLandmark.name.toUpperCase()}
                    </div>

                    <button
                      type="button"
                      onClick={handleRunToggle}
                      className="pointer-events-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF3B30] text-white transition hover:scale-[1.05] active:scale-95"
                    >
                      <Square className="h-[18px] w-[18px] fill-current" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>

              {/* 修复点3：底部控制栏，z-30，容器透明且穿透，按钮强制响应 */}
              <div className="absolute inset-x-5 bottom-6 flex items-center justify-between z-30 pointer-events-none">
                <button
                  type="button"
                  onClick={() => handleOpenScreen("landmarks")}
                  className={cn(iconButtonClassName, isRecording ? "opacity-0 pointer-events-none" : "pointer-events-auto hover:bg-neutral-800", activeScreen === "landmarks" && "bg-neutral-800")}
                >
                  <MapPinned className="h-[20px] w-[20px]" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenScreen("heart")}
                  className={cn(iconButtonClassName, isRecording ? "opacity-0 pointer-events-none" : "pointer-events-auto hover:bg-neutral-800", activeScreen === "heart" && "bg-[#FF2D55]/20 text-[#FF2D55]")}
                >
                  <Heart className="h-[20px] w-[20px]" strokeWidth={2} />
                </button>
              </div>
            </div>

            {renderOverlay()}
          </div>
        </div>
      </div>
    </div>
  );
};