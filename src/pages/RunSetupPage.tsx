import { motion } from "framer-motion";
import { Flag, Route as RouteIcon, Users, Watch } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { Button } from "../components/ui/Button";
import { useAppState } from "../hooks/useAppState";
import { getAcceptedMissionStatesForUser, getMissionProgress } from "../utils/paceCrew";

export const RunSetupPage = () => {
  const navigate = useNavigate();
  const { playableRoutes, state, completeRun, selectRoute, t } = useAppState();
  const acceptedMissionStates = getAcceptedMissionStatesForUser(state);
  const acceptedMissions = acceptedMissionStates
    .map((missionState) => {
      const mission = state.paceCrewMissions.find((entry) => entry.id === missionState.missionId && entry.status === "open");
      if (!mission) {
        return null;
      }
      const crew = state.paceCrews.find((entry) => entry.id === mission.crewId);
      return mission && crew ? { mission, missionState, crew } : null;
    })
    .filter(Boolean) as Array<{
    mission: (typeof state.paceCrewMissions)[number];
    missionState: (typeof state.userMissionStates)[number];
    crew: (typeof state.paceCrews)[number];
  }>;

  const [targetType, setTargetType] = useState<"personal" | "pacecrew_mission">(
    acceptedMissions.length > 0 ? "personal" : "personal",
  );
  const [selectedDistance, setSelectedDistance] = useState(Math.min(5, state.sliderMaxDistanceKm));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missionPickerOpen, setMissionPickerOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const carouselScrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedDistance((current) => Math.min(current, state.sliderMaxDistanceKm));
  }, [state.sliderMaxDistanceKm]);

  useEffect(() => {
    if (acceptedMissions.length === 0) {
      setTargetType("personal");
    }
  }, [acceptedMissions.length]);

  const route = playableRoutes.find((entry) => entry.id === state.selectedRouteId) ?? playableRoutes[0];
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(acceptedMissions[0]?.mission.id ?? null);

  useEffect(() => {
    setSelectedMissionId((current) => {
      if (current && acceptedMissions.some((item) => item.mission.id === current)) {
        return current;
      }
      return acceptedMissions[0]?.mission.id ?? null;
    });
  }, [acceptedMissions]);

  if (!route && acceptedMissions.length === 0) {
    return <Navigate to="/shop" replace />;
  }

  const selectedMissionBundle = acceptedMissions.find((item) => item.mission.id === selectedMissionId) ?? acceptedMissions[0];
  const activeTargetType =
    targetType === "pacecrew_mission" && selectedMissionBundle ? "pacecrew_mission" : "personal";
  const effectiveDistance = selectedDistance;

  const preview = useMemo(() => {
    if (activeTargetType === "pacecrew_mission" && selectedMissionBundle) {
      const { mission, missionState } = selectedMissionBundle;
      const missionProgress = getMissionProgress(mission, missionState);
      const rawPreviewDistance = missionProgress.completedDistanceKm + effectiveDistance;
      const hasOverflowPreview = rawPreviewDistance > mission.targetDistanceKm;

      return {
        label: "Mission Progress",
        value: hasOverflowPreview ? mission.targetDistanceKm : rawPreviewDistance,
        total: mission.targetDistanceKm,
        cycleCount: 1,
        hasOverflowPreview,
        targetTitle: mission.title,
        targetMeta: `${selectedMissionBundle.crew.name} · PaceCrew Mission`
      };
    }

    if (!route) {
      return null;
    }

    const totalLoggedDistanceKm = state.runHistory
      .filter((entry) => entry.runTargetType === "personal" && entry.routeId === route.id)
      .reduce((sum, entry) => sum + entry.distanceKm, 0);
    const rawPreviewProgressKm = totalLoggedDistanceKm + effectiveDistance;
    const hasOverflowPreview = rawPreviewProgressKm >= route.totalDistanceKm;
    const progressCycleCount = Math.floor(rawPreviewProgressKm / route.totalDistanceKm) + 1;
    const previewProgressKm =
      rawPreviewProgressKm === 0
        ? 0
        : rawPreviewProgressKm % route.totalDistanceKm === 0
          ? route.totalDistanceKm
          : rawPreviewProgressKm % route.totalDistanceKm;

    return {
      label: "Progress",
      value: previewProgressKm,
      total: route.totalDistanceKm,
      cycleCount: progressCycleCount,
      hasOverflowPreview,
      targetTitle: route.name,
      targetMeta: `${route.city}, ${route.country}`
    };
  }, [activeTargetType, effectiveDistance, route, selectedMissionBundle, state.routeProgress]);

  const routeProgress = route
    ? state.routeProgress.find((entry) => entry.routeId === route.id)
    : undefined;
  const routeExploredPercent = route
    ? Math.round(((routeProgress?.completedDistanceKm ?? 0) / route.totalDistanceKm) * 100)
    : 0;
  const missionProgressPercent =
    activeTargetType === "pacecrew_mission" && selectedMissionBundle
      ? Math.round(
          (getMissionProgress(selectedMissionBundle.mission, selectedMissionBundle.missionState).completedDistanceKm /
            selectedMissionBundle.mission.targetDistanceKm) *
            100,
        )
      : 0;
  const locationLabel =
    activeTargetType === "pacecrew_mission" && selectedMissionBundle
      ? "PACECREW MISSION"
      : route
        ? `${route.city.toUpperCase()} · ${route.country.toUpperCase()}`
        : "";
  const metadataLabel =
    activeTargetType === "pacecrew_mission" && selectedMissionBundle
      ? `${effectiveDistance.toFixed(1)} km selected / ${selectedMissionBundle.mission.targetDistanceKm.toFixed(1)} km · ${missionProgressPercent}% complete`
      : route
        ? `${effectiveDistance.toFixed(1)} km selected / ${route.totalDistanceKm.toFixed(1)} km · ${routeExploredPercent}% explored`
        : `${effectiveDistance.toFixed(1)} km selected`;
  const hasWearablePriority = Boolean(state.wearableConnection && state.wearableConnection.autoSyncEnabled);

  const handleStartRun = () => {
    setIsSubmitting(true);

    window.setTimeout(() => {
      if (activeTargetType === "pacecrew_mission" && selectedMissionBundle) {
        completeRun({
          targetType: "pacecrew_mission",
          missionId: selectedMissionBundle.mission.id,
          distanceKm: effectiveDistance
        });
      } else if (route) {
        completeRun({ targetType: "personal", routeId: route.id, distanceKm: effectiveDistance });
      }
      navigate("/run/result");
    }, 900);
  };

  const showModeSwitcher = acceptedMissions.length > 0;

  useEffect(() => {
    return () => {
      if (carouselScrollTimeoutRef.current) {
        window.clearTimeout(carouselScrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!carouselRef.current || activeTargetType !== "personal" || !route) {
      return;
    }

    const activeCard = carouselRef.current.querySelector<HTMLButtonElement>(`[data-route-id="${route.id}"]`);
    activeCard?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTargetType, route?.id]);

  const handleRouteCarouselScroll = () => {
    if (!carouselRef.current) {
      return;
    }

    if (carouselScrollTimeoutRef.current) {
      window.clearTimeout(carouselScrollTimeoutRef.current);
    }

    carouselScrollTimeoutRef.current = window.setTimeout(() => {
      const carousel = carouselRef.current;
      if (!carousel) {
        return;
      }

      const cards = Array.from(carousel.querySelectorAll<HTMLButtonElement>("[data-route-id]"));
      const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
      const nearestCard = cards.reduce<HTMLButtonElement | null>((nearest, card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        if (!nearest) {
          return card;
        }
        const nearestCenter = nearest.offsetLeft + nearest.offsetWidth / 2;
        return Math.abs(cardCenter - carouselCenter) < Math.abs(nearestCenter - carouselCenter) ? card : nearest;
      }, null);

      const nextRouteId = nearestCard?.dataset.routeId;
      if (nextRouteId && nextRouteId !== route?.id) {
        selectRoute(nextRouteId);
      }
    }, 90);
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-canvas pb-6">
        {activeTargetType === "personal" && route ? (
          <div className="relative min-h-[60vh]">
            <div className="block h-[62vh] w-full text-left">
              <RouteArtwork routeId={route.id} variant="hero" className="h-[62vh] w-full" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0d1711]/24 via-[#0d1711]/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f5f3ee] via-[#f5f3ee]/82 to-transparent" />
          </div>
        ) : (
          <div className="relative flex h-[62vh] items-end overflow-hidden bg-[linear-gradient(180deg,#d9e8dd_0%,#eef4ee_38%,#f5f3ee_100%)] px-6 pb-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff7a,transparent_42%)]" />
            <button
              type="button"
              onClick={() => setMissionPickerOpen(true)}
              className="relative w-full rounded-[30px] border border-white/70 bg-white/62 px-6 py-6 text-left shadow-[0_18px_40px_rgba(24,43,29,0.08)] backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sky-700">
                    PACECREW MISSION
                  </p>
                  <h2 className="mt-3 text-[2rem] leading-[0.98] tracking-[-0.04em] text-ink">
                    {selectedMissionBundle?.mission.title ?? "Choose a mission"}
                  </h2>
                  <p className="mt-2 text-sm text-sage-700">{selectedMissionBundle?.crew.name ?? "Accepted mission"}</p>
                </div>
                <div className="rounded-full bg-sky-100/80 p-3 text-sky-700">
                  <Flag className="h-5 w-5" />
                </div>
              </div>
            </button>
          </div>
        )}

        <section className="relative z-10 -mt-8 rounded-t-[34px] border-t border-white/75 bg-[linear-gradient(180deg,rgba(250,249,245,0.94)_0%,rgba(245,243,238,0.98)_100%)] px-6 pb-8 pt-5 shadow-[0_-14px_32px_rgba(34,49,38,0.08)] backdrop-blur-2xl">
          {showModeSwitcher ? (
            <div className="mb-6 inline-flex rounded-full bg-sage-900/6 p-1 ring-1 ring-sage-900/8">
              <button
                type="button"
                onClick={() => setTargetType("personal")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTargetType === "personal" ? "bg-white text-ink shadow-sm" : "text-sage-600"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <RouteIcon className="h-4 w-4" />
                  {t("run.personalRun")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTargetType("pacecrew_mission")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTargetType === "pacecrew_mission" ? "bg-white text-ink shadow-sm" : "text-sage-600"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("run.pacecrewMission")}
                </span>
              </button>
            </div>
          ) : null}

          {activeTargetType === "personal" && route ? (
            <div
              ref={carouselRef}
              onScroll={handleRouteCarouselScroll}
              className="-mx-6 flex snap-x snap-mandatory overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {playableRoutes.map((item) => {
                const active = item.id === route.id;
                const itemLoggedDistanceKm = state.runHistory
                  .filter((entry) => entry.runTargetType === "personal" && entry.routeId === item.id)
                  .reduce((sum, entry) => sum + entry.distanceKm, 0);
                const itemExploredPercent = Math.round((itemLoggedDistanceKm / item.totalDistanceKm) * 100);
                const itemMetadata =
                  active && metadataLabel
                    ? metadataLabel
                    : `${item.totalDistanceKm.toFixed(1)} km route · ${itemExploredPercent}% explored`;

                return (
                  <button
                    key={item.id}
                    type="button"
                    data-route-id={item.id}
                    onClick={() => selectRoute(item.id)}
                    className={`w-full min-w-full shrink-0 snap-start overflow-hidden px-6 py-1 text-left transition ${
                      active ? "opacity-100" : "opacity-35"
                    }`}
                    aria-label={`Select ${item.name}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sage-500">
                          {item.city.toUpperCase()} · {item.country.toUpperCase()}
                        </p>
                        <h2 className="mt-3 truncate font-destination-display text-[2.35rem] leading-[0.94] tracking-[0.01em] text-ink">
                          {item.name}
                        </h2>
                      </div>
                      {active && hasWearablePriority ? (
                        <div
                          className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-900/4 text-sage-500"
                          aria-label={`${state.wearableConnection?.name ?? "Wearable"} data source`}
                          title={state.wearableConnection?.name ?? "Wearable"}
                        >
                          <Watch className="h-4 w-4" />
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-sage-600">
                      <span>{itemMetadata}</span>
                      {active && preview && preview.cycleCount > 1 ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sage-700 px-1.5 text-[10px] font-semibold text-white">
                          {preview.cycleCount}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sage-500">{locationLabel}</p>
              <div className="mt-3 flex items-start justify-between gap-3">
                <h2 className="font-destination-display text-[2.35rem] leading-[0.94] tracking-[0.01em] text-ink">
                  {preview?.targetTitle}
                </h2>
                {hasWearablePriority ? (
                  <div
                    className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-900/4 text-sage-500"
                    aria-label={`${state.wearableConnection?.name ?? "Wearable"} data source`}
                    title={state.wearableConnection?.name ?? "Wearable"}
                  >
                    <Watch className="h-4 w-4" />
                  </div>
                ) : null}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-sage-600">
                <span>{metadataLabel}</span>
                {preview && preview.cycleCount > 1 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sage-700 px-1.5 text-[10px] font-semibold text-white">
                    {preview.cycleCount}
                  </span>
                ) : null}
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-sage-500">
                Run Distance
              </p>
              <p className="text-[1.9rem] font-semibold tracking-[-0.04em] text-ink">
                {effectiveDistance.toFixed(1)} km
              </p>
            </div>

            <div className="mt-5">
              <input
                type="range"
                min="0"
                max={state.sliderMaxDistanceKm}
                step="0.1"
                value={selectedDistance}
                onChange={(event) => setSelectedDistance(Number(event.target.value))}
                className="ios-slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sage-200/90"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-sage-400">
                <span>0 km</span>
                <span>{state.sliderMaxDistanceKm} km</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button
              fullWidth
              className="h-14 bg-sage-700/95 text-base text-white shadow-[0_18px_28px_rgba(61,92,74,0.22)] hover:bg-sage-800"
              onClick={handleStartRun}
              disabled={isSubmitting || effectiveDistance <= 0 || (activeTargetType === "pacecrew_mission" && !selectedMissionBundle)}
            >
              {isSubmitting
                ? t("run.simulating")
                : activeTargetType === "pacecrew_mission"
                  ? t("run.startMissionRun")
                  : t("run.startRun")}
            </Button>
          </div>
        </section>
      </div>

      {missionPickerOpen ? (
        <div className="fixed inset-0 z-40">
          <button type="button" onClick={() => setMissionPickerOpen(false)} className="absolute inset-0 bg-black/18" aria-label="Close mission picker" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 rounded-t-[32px] bg-white px-4 pb-8 pt-4 shadow-2xl"
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-sage-200" />
            <div className="space-y-3">
              {acceptedMissions.map((item) => {
                const active = item.mission.id === selectedMissionId;
                return (
                  <button
                    key={item.mission.id}
                    type="button"
                    onClick={() => {
                      setSelectedMissionId(item.mission.id);
                      setMissionPickerOpen(false);
                    }}
                    className={`w-full rounded-[24px] p-4 text-left transition ${
                      active ? "bg-sage-700 text-white" : "bg-sky-50 text-ink"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{item.mission.title}</p>
                        <p className={`mt-1 text-xs ${active ? "text-white/80" : "text-sage-500"}`}>
                          {item.crew.name}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-white/15 text-white" : "bg-white text-sky-700"}`}>
                        {item.mission.targetDistanceKm} km
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      ) : null}
    </>
  );
};
