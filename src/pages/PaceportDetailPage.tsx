import { ArrowRight, CheckCircle2, Coins, Flag, Lock, MapPin, Play, RouteIcon, Sparkles, Stamp, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { RunPosterCard } from "../components/run/RunPosterCard";
import { buttonStyles } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAppState } from "../hooks/useAppState";
import type { Landmark } from "../types";
import { getAchievementTier } from "../utils/achievement";
import { cn } from "../utils/cn";
import { formatCountryName } from "../utils/location";
import { getPaceportSummary } from "../utils/paceport";
import { formatDistance } from "../utils/progress";

export const achievementLabel = {
  none: "No Tier",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  prism: "Prism"
} as const;

const paceportLandmarkImages: Record<string, string> = {
  "big-ben": "/models/landmarks/london-route/BigBen.png",
  "eiffel-tower": "/models/landmarks/paris-route/eiffel-tower.png",
  "statue-of-liberty": "/models/landmarks/central-park-route/statue-of-liberty.png",
  "tower-bridge": "/models/landmarks/london-route/TowerBridge.png"
};

const getPaceportLandmarkImageSrc = (landmark: Landmark) =>
  landmark.image || paceportLandmarkImages[landmark.id];

const statusCopy = {
  locked: "Locked",
  owned: "Ready",
  in_progress: "In Progress",
  completed: "Completed"
} as const;

export const PaceportDetailPage = () => {
  const { routeId } = useParams();
  const location = useLocation();
  const { routes, state, purchaseRoute, selectRoute, t } = useAppState();
  const [toast, setToast] = useState<string | null>(null);
  const route = routes.find((entry) => entry.id === routeId);
  const routeState = location.state as { returnTo?: string; returnLabel?: string } | null;

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  if (!route) {
    return <Navigate to="/paceport" replace />;
  }

  const summary = getPaceportSummary(route, state);
  const owned = summary.status !== "locked";
  const achievementTier = getAchievementTier(summary.runCount);
  const canUnlock = state.currentStamps >= route.priceStamps;
  const nextLandmark = route.landmarks.find((landmark) => !summary.progress.unlockedLandmarkIds.includes(landmark.id));
  const sourceCrew = route.sourceCrewId ? state.paceCrews.find((crew) => crew.id === route.sourceCrewId) : null;
  const completedDistance = formatDistance(summary.progress.completedDistanceKm);
  const totalDistance = formatDistance(route.totalDistanceKm);

  return (
    <div className="relative -mx-4 -mt-1 min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f5f3ee] pb-32 text-ink">
      <div className="pointer-events-none absolute inset-0 opacity-[0.32] [background-image:radial-gradient(circle_at_center,rgba(129,102,70,0.4)_0_1.2px,transparent_1.35px)] [background-size:15px_15px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_center,rgba(216,154,88,0.34)_0_1px,transparent_1.2px)] [background-position:7px_7px] [background-size:15px_15px]" />
      <div className="pointer-events-none absolute left-8 top-0 h-full w-px bg-[#d7b48a]/36" />
      <div className="pointer-events-none absolute left-11 top-0 h-full w-px bg-white/70" />

      {toast ? (
        <div className="fixed left-1/2 top-24 z-50 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-sage-700 px-4 py-2 text-[12px] font-medium text-white shadow-[0_14px_32px_rgba(34,49,38,0.18)]">
          {toast}
        </div>
      ) : null}

      <main className="relative z-10 px-5 pt-7">
        <section className="mx-auto max-w-5xl">
          <Link
            to={routeState?.returnTo ?? "/paceport"}
            className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d674d]"
          >
            {routeState?.returnLabel ? `Back to ${routeState.returnLabel}` : "Back to Paceport"}
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </Link>

          <div className="flex flex-col gap-7 md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
            <div>
              <p className="inline-flex rotate-[-1deg] items-center gap-2 bg-[#fff9ed] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d674d] shadow-sm ring-1 ring-[#b99361]/20">
                <MapPin className="h-3.5 w-3.5" />
                {route.city} / {formatCountryName(route.country)}
              </p>
              <h1 className="mt-5 max-w-[9ch] text-[clamp(2.45rem,11vw,5.9rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-ink">
                {route.name}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 bg-white/62 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6c624f] shadow-sm ring-1 ring-[#816646]/14 backdrop-blur">
                  <RouteIcon className="h-3.5 w-3.5" />
                  {totalDistance}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/62 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6c624f] shadow-sm ring-1 ring-[#816646]/14 backdrop-blur">
                  <Trophy className="h-3.5 w-3.5" />
                  {achievementLabel[achievementTier]}
                </span>
                {route.crewOnly ? (
                  <span className="inline-flex items-center gap-2 bg-[#edf4ee]/80 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-700 shadow-sm ring-1 ring-sage-200/70 backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("paceport.pacecrewOnly")}
                  </span>
                ) : null}
              </div>
            </div>

            <p className="max-w-[36ch] font-mono text-[13px] leading-6 text-[#6c624f] [font-family:'Courier_New','Courier_Prime','American_Typewriter','Special_Elite',monospace] md:justify-self-end">
              {route.description}
            </p>
          </div>
        </section>

        <section className="mx-auto mt-9 grid max-w-5xl gap-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="relative mx-auto w-full max-w-[340px] lg:mx-0">
            <div className="pointer-events-none absolute left-1/2 top-[-14px] z-20 h-7 w-28 -translate-x-1/2 rotate-[-4deg] bg-[#e6d5ad]/70 shadow-sm mix-blend-multiply" />
            <div className={cn("relative -rotate-[2.5deg] transition duration-500", !owned && "grayscale opacity-70")}>
              <RunPosterCard
                imageUrl={route.coverImage}
                title={route.name}
                subtitle={`${route.city} / ${formatCountryName(route.country)}`}
                topLabel="Paceport"
                dateLabel={statusCopy[summary.status]}
              />
              {!owned ? (
                <div className="absolute inset-0 grid place-items-center bg-[#1f2421]/18">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/86 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f554f] shadow-sm">
                    <Lock className="h-3.5 w-3.5" />
                    Locked
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white/72 p-5 shadow-[0_18px_46px_rgba(58,48,33,0.09)] ring-1 ring-[#816646]/12 backdrop-blur">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7154]">
                    Route Passport
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-ink">{summary.progressPercent}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-semibold text-sage-700">{completedDistance}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-sage-500">of {totalDistance}</p>
                </div>
              </div>
              <div className="mt-5">
                <ProgressBar value={summary.progressPercent} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#fff9ed]/76 p-4 shadow-sm ring-1 ring-[#816646]/12 backdrop-blur">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7154]">Status</p>
                <p className="mt-2 text-sm font-semibold text-ink">{statusCopy[summary.status]}</p>
              </div>
              <div className="bg-[#fff9ed]/76 p-4 shadow-sm ring-1 ring-[#816646]/12 backdrop-blur">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7154]">Runs</p>
                <p className="mt-2 text-sm font-semibold text-ink">{summary.runCount}</p>
              </div>
              <div className="bg-[#fff9ed]/76 p-4 shadow-sm ring-1 ring-[#816646]/12 backdrop-blur">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7154]">Stamps</p>
                <p className="mt-2 text-sm font-semibold text-ink">{route.priceStamps}</p>
              </div>
            </div>

            <div className="bg-white/66 p-5 shadow-[0_18px_46px_rgba(58,48,33,0.08)] ring-1 ring-[#816646]/12 backdrop-blur">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7154]">
                Next Unlock
              </p>
              {nextLandmark ? (
                <div className="mt-4 flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center">
                    {getPaceportLandmarkImageSrc(nextLandmark) ? (
                      <img src={getPaceportLandmarkImageSrc(nextLandmark)} alt="" className="h-full w-full object-contain opacity-70 grayscale drop-shadow-[0_8px_14px_rgba(58,48,33,0.12)]" />
                    ) : (
                      <Flag className="h-6 w-6 text-sage-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold tracking-[-0.03em] text-ink">{nextLandmark.name}</p>
                    <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-sage-500">
                      Unlock at {formatDistance(nextLandmark.milestoneKm)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-sage-700">All landmarks have been unlocked.</p>
              )}
            </div>

            {sourceCrew ? (
              <Link
                to={`/pacecrew/${sourceCrew.id}`}
                className="flex items-center justify-between bg-[#edf4ee]/76 p-4 text-sm font-semibold text-sage-800 shadow-sm ring-1 ring-sage-200/70 backdrop-blur"
              >
                <span>{t("paceport.fromPaceCrew", { name: sourceCrew.name })}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-5xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a7154]">
                Landmarks
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-ink">{t("paceport.destinationUnlocks")}</h2>
            </div>
            <p className="shrink-0 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-sage-600">
              {summary.unlockedLandmarkCount}/{route.landmarks.length}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {route.landmarks.map((landmark, index) => {
              const unlocked = summary.progress.unlockedLandmarkIds.includes(landmark.id);
              const imageSrc = getPaceportLandmarkImageSrc(landmark);

              return (
                <article
                  key={landmark.id}
                  className={cn(
                    "grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-b border-[#816646]/12 px-1 py-5 last:border-b-0 md:grid-cols-[5rem_minmax(0,1fr)_auto]",
                    index % 2 === 0 ? "-rotate-[0.4deg]" : "rotate-[0.35deg]",
                  )}
                >
                  <div className="grid h-16 w-16 place-items-center md:h-20 md:w-20">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt=""
                        loading="lazy"
                        className={cn(
                          "h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(58,48,33,0.13)]",
                          unlocked ? "opacity-100" : "opacity-45 grayscale",
                        )}
                      />
                    ) : (
                      <Flag className={cn("h-7 w-7", unlocked ? "text-sage-700" : "text-sage-300")} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold tracking-[-0.03em] text-ink">{landmark.name}</h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                          unlocked ? "bg-sage-100 text-sage-700" : "bg-white text-sage-500 ring-1 ring-sage-100",
                        )}
                      >
                        {unlocked ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-sage-500">
                      {unlocked ? `${formatDistance(landmark.milestoneKm)} milestone` : `Unlock at ${formatDistance(landmark.milestoneKm)}`}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-sage-700">{landmark.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[390px] -translate-x-1/2">
        <div className="rounded-full border border-white/55 bg-white/24 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_22px_54px_rgba(36,50,40,0.18)] backdrop-blur-2xl">
          {owned && !route.crewOnly ? (
            <Link
              to="/run/setup"
              className={buttonStyles({
                fullWidth: true,
                className: "h-[54px] bg-sage-700 shadow-[0_12px_28px_rgba(36,50,40,0.16)] hover:bg-sage-800",
              })}
              onClick={() => selectRoute(route.id)}
            >
              <span className="inline-flex items-center gap-2">
                <Play className="h-4 w-4 fill-current" />
                {t("paceport.startRun")}
              </span>
            </Link>
          ) : owned && route.crewOnly ? (
            <div className="flex h-[54px] items-center justify-center rounded-full bg-[#edf4ee]/74 px-5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-sage-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
              {t("paceport.exclusiveTeamReward")}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                const result = purchaseRoute(route.id);
                setToast(result.message);
              }}
              disabled={!canUnlock}
              className={buttonStyles({
                fullWidth: true,
                className: cn(
                  "h-[54px] shadow-[0_12px_28px_rgba(36,50,40,0.16)]",
                  !canUnlock && "bg-sage-900/5 text-sage-400 shadow-none hover:bg-sage-900/5",
                ),
              })}
            >
              <span className="inline-flex items-center gap-2">
                {canUnlock ? <Stamp className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {canUnlock ? `Unlock for ${route.priceStamps} stamps` : `${state.currentStamps} / ${route.priceStamps} stamps`}
              </span>
            </button>
          )}
        </div>
        {!owned ? (
          <div className="mx-auto mt-2 inline-flex items-center gap-2 rounded-full bg-white/54 px-3 py-1.5 text-[11px] font-medium text-sage-700 shadow-sm ring-1 ring-white/70 backdrop-blur-xl">
            <Coins className="h-3.5 w-3.5" />
            {state.currentStamps} stamps available
          </div>
        ) : null}
      </nav>
    </div>
  );
};
