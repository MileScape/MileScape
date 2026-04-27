import { motion, useSpring, useTransform } from "framer-motion";
import { ChevronsLeftRight, Flag, Route as RouteIcon, Users, Watch } from "lucide-react";
import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import runnerIcon from "../assets/runner-slider.svg";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { Button } from "../components/ui/Button";
import { useAppState } from "../hooks/useAppState";
import { getRunSimulationDurationSeconds } from "../utils/routeSimulation";
import { getAcceptedMissionStatesForUser, getMissionProgress } from "../utils/paceCrew";
import { hasSeenJourneySwipeGuide, markJourneySwipeGuideSeen, markOnboardingSeen } from "../utils/storage";

export const RunSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { routes, playableRoutes, state, completeRun, selectRoute, t } = useAppState();
  const routeState = location.state as { initialDistanceRatio?: number; showWelcomeIntro?: boolean } | null;
  const initialDistanceRatio =
    typeof routeState?.initialDistanceRatio === "number"
      ? Math.min(Math.max(routeState.initialDistanceRatio, 0), 1)
      : null;
  const [showWelcomeIntro, setShowWelcomeIntro] = useState(Boolean(routeState?.showWelcomeIntro));
  const [welcomeSliderValue, setWelcomeSliderValue] = useState(0);
  const [isWelcomeRevealing, setIsWelcomeRevealing] = useState(false);
  const welcomeTrackRef = useRef<HTMLDivElement | null>(null);
  const welcomeDragActiveRef = useRef(false);
  const welcomeRevealingRef = useRef(false);
  const welcomeDrawProgress = useSpring(0, {
    stiffness: 58,
    damping: 24,
    mass: 0.8,
  });
  const welcomeLandscapeProgress = useTransform(welcomeDrawProgress, [0.04, 0.44], [0, 1]);
  const welcomeRouteProgress = useTransform(welcomeDrawProgress, [0.16, 0.76], [0, 1]);
  const welcomeCityProgress = useTransform(welcomeDrawProgress, [0.44, 0.96], [0, 1]);
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
  const [selectedDistance, setSelectedDistance] = useState(() =>
    initialDistanceRatio === null
      ? Math.min(5, state.sliderMaxDistanceKm)
      : Math.min(state.sliderMaxDistanceKm, Math.max(0, state.sliderMaxDistanceKm * initialDistanceRatio)),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missionPickerOpen, setMissionPickerOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const journeyGuideCardRef = useRef<HTMLDivElement | null>(null);
  const carouselScrollTimeoutRef = useRef<number | null>(null);
  const carouselJumpingRef = useRef(false);
  const carouselInitializedRef = useRef(false);
  const initialRouteIdRef = useRef<string | null>(null);
  const welcomeRevealThreshold = 100;
  const welcomeDistanceRatio = 0.86;
  const [showSwipeGuide, setShowSwipeGuide] = useState(false);

  useEffect(() => {
    welcomeDrawProgress.set(welcomeSliderValue / 100);
  }, [welcomeDrawProgress, welcomeSliderValue]);

  useEffect(() => {
    setSelectedDistance((current) => Math.min(current, state.sliderMaxDistanceKm));
  }, [state.sliderMaxDistanceKm]);

  useEffect(() => {
    if (acceptedMissions.length === 0) {
      setTargetType("personal");
    }
  }, [acceptedMissions.length]);

  const routeCatalog = routes;
  const runnableRouteIds = useMemo(() => new Set(playableRoutes.map((entry) => entry.id)), [playableRoutes]);
  const [selectedCatalogRouteId, setSelectedCatalogRouteId] = useState(
    () => state.selectedRouteId ?? playableRoutes[0]?.id ?? routeCatalog[0]?.id ?? null,
  );
  const route = routeCatalog.find((entry) => entry.id === selectedCatalogRouteId) ?? playableRoutes[0] ?? routeCatalog[0];
  const routeIndex = route ? routeCatalog.findIndex((entry) => entry.id === route.id) : -1;
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(acceptedMissions[0]?.mission.id ?? null);
  const canStartPersonalRun = Boolean(route && route.sourceType === "personal" && runnableRouteIds.has(route.id));

  useEffect(() => {
    if (state.selectedRouteId) {
      setSelectedCatalogRouteId(state.selectedRouteId);
    }
  }, [state.selectedRouteId]);

  useEffect(() => {
    setSelectedMissionId((current) => {
      if (current && acceptedMissions.some((item) => item.mission.id === current)) {
        return current;
      }
      return acceptedMissions[0]?.mission.id ?? null;
    });
  }, [acceptedMissions]);

  if (!route && acceptedMissions.length === 0) {
    return <Navigate to="/paceport" replace />;
  }

  const selectedMissionBundle = acceptedMissions.find((item) => item.mission.id === selectedMissionId) ?? acceptedMissions[0];
  const activeTargetType =
    targetType === "pacecrew_mission" && selectedMissionBundle ? "pacecrew_mission" : "personal";
  const effectiveDistance = selectedDistance;
  const runSimulationDurationSeconds = useMemo(
    () => getRunSimulationDurationSeconds(effectiveDistance),
    [effectiveDistance],
  );

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
  const carouselRoutes = useMemo(() => {
    if (routeCatalog.length <= 1) {
      return routeCatalog.map((item, index) => ({
        item,
        virtualIndex: index,
        isClone: false,
      }));
    }

    const firstRoute = routeCatalog[0];
    const lastRoute = routeCatalog[routeCatalog.length - 1];

    return [
      {
        item: lastRoute,
        virtualIndex: 0,
        isClone: true,
      },
      ...routeCatalog.map((item, index) => ({
        item,
        virtualIndex: index + 1,
        isClone: false,
      })),
      {
        item: firstRoute,
        virtualIndex: routeCatalog.length + 1,
        isClone: true,
      },
    ];
  }, [routeCatalog]);

  useEffect(() => {
    if (showWelcomeIntro || activeTargetType !== "personal" || !route || hasSeenJourneySwipeGuide()) {
      setShowSwipeGuide(false);
      return;
    }

    initialRouteIdRef.current = route.id;
    setShowSwipeGuide(true);
  }, [activeTargetType, route?.id, showWelcomeIntro]);

  useEffect(() => {
    if (!showSwipeGuide || !route) {
      return;
    }

    if (initialRouteIdRef.current && route.id !== initialRouteIdRef.current) {
      markJourneySwipeGuideSeen();
      setShowSwipeGuide(false);
    }
  }, [route?.id, showSwipeGuide]);

  const handleStartRun = () => {
    setIsSubmitting(true);

    window.setTimeout(() => {
      if (activeTargetType === "pacecrew_mission" && selectedMissionBundle) {
        completeRun({
          targetType: "pacecrew_mission",
          missionId: selectedMissionBundle.mission.id,
          distanceKm: effectiveDistance
        });
      } else if (route && canStartPersonalRun) {
        completeRun({ targetType: "personal", routeId: route.id, distanceKm: effectiveDistance });
      }
      navigate("/run/result");
    }, runSimulationDurationSeconds * 1000);
  };

  const completeWelcomeIntro = () => {
    if (isWelcomeRevealing) {
      return;
    }

    welcomeRevealingRef.current = true;
    setIsWelcomeRevealing(true);
    setWelcomeSliderValue(welcomeRevealThreshold);
    setSelectedDistance(state.sliderMaxDistanceKm * welcomeDistanceRatio);
    markOnboardingSeen();

    window.setTimeout(() => {
      setShowWelcomeIntro(false);
    }, 860);
  };

  const getWelcomeSliderValueFromPointer = (clientX: number) => {
    const track = welcomeTrackRef.current;
    if (!track) {
      return welcomeSliderValue;
    }

    const rect = track.getBoundingClientRect();
    return Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 100);
  };

  const syncJourneyDistanceFromPointer = (clientX: number) => {
    const appWidth = Math.min(window.innerWidth, 430);
    const appLeft = (window.innerWidth - appWidth) / 2;
    const trackLeft = appLeft + 24;
    const trackWidth = appWidth - 48;
    const ratio = Math.min(Math.max((clientX - trackLeft) / trackWidth, 0), 1);
    setSelectedDistance(state.sliderMaxDistanceKm * ratio);
  };

  const handleWelcomePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isWelcomeRevealing) {
      return;
    }

    welcomeDragActiveRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const value = getWelcomeSliderValueFromPointer(event.clientX);
    setWelcomeSliderValue(value);
    if (value >= welcomeRevealThreshold) {
      completeWelcomeIntro();
    }
  };

  const handleWelcomePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!welcomeDragActiveRef.current) {
      return;
    }

    if (welcomeRevealingRef.current) {
      syncJourneyDistanceFromPointer(event.clientX);
      return;
    }

    const value = getWelcomeSliderValueFromPointer(event.clientX);
    setWelcomeSliderValue(value);
    if (value >= welcomeRevealThreshold) {
      completeWelcomeIntro();
    }
  };

  const resetWelcomeSlider = () => {
    welcomeDragActiveRef.current = false;
    if (welcomeRevealingRef.current) {
      setShowWelcomeIntro(false);
      return;
    }
    if (!welcomeRevealingRef.current && welcomeSliderValue < welcomeRevealThreshold) {
      setWelcomeSliderValue(0);
    }
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

    const targetVirtualIndex = routeCatalog.length > 1 ? routeIndex + 1 : routeIndex;
    if (targetVirtualIndex < 0) {
      return;
    }

    const activeCard = carouselRef.current.querySelector<HTMLButtonElement>(
      `[data-carousel-index="${targetVirtualIndex}"]`,
    );
    if (!activeCard) {
      return;
    }

    activeCard.scrollIntoView({
      behavior: carouselInitializedRef.current ? "smooth" : "auto",
      inline: "center",
      block: "nearest",
    });
    carouselInitializedRef.current = true;
  }, [activeTargetType, routeCatalog.length, routeIndex, route?.id]);

  const handleRouteCarouselScroll = () => {
    if (!carouselRef.current || carouselJumpingRef.current) {
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
      const virtualIndex = Number(nearestCard?.dataset.carouselIndex);

      if (routeCatalog.length > 1) {
        const jumpToIndex =
          virtualIndex === 0
            ? routeCatalog.length
            : virtualIndex === routeCatalog.length + 1
              ? 1
              : null;

        if (jumpToIndex !== null) {
          const jumpTarget = carousel.querySelector<HTMLButtonElement>(`[data-carousel-index="${jumpToIndex}"]`);
          if (jumpTarget) {
            carouselJumpingRef.current = true;
            jumpTarget.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
            window.setTimeout(() => {
              carouselJumpingRef.current = false;
            }, 40);
          }
        }
      }

      if (nextRouteId && nextRouteId !== route?.id) {
        setSelectedCatalogRouteId(nextRouteId);
        if (runnableRouteIds.has(nextRouteId)) {
          selectRoute(nextRouteId);
        }
      }
    }, 90);
  };

  const dismissSwipeGuide = () => {
    markJourneySwipeGuideSeen();
    setShowSwipeGuide(false);
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-canvas pb-6">
        {activeTargetType === "personal" && route ? (
          <motion.div
            className="relative overflow-hidden"
            animate={{ height: isSubmitting ? "calc(100vh - 104px)" : "62vh" }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="block h-full w-full text-left">
              <RouteArtwork
                routeId={route.id}
                variant="hero"
                className="h-full w-full"
                simulation={{
                  active: isSubmitting,
                  durationSeconds: runSimulationDurationSeconds,
                  distanceKm: effectiveDistance,
                  routeDistanceKm: route.totalDistanceKm
                }}
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0d1711]/24 via-[#0d1711]/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f5f3ee] via-[#f5f3ee]/82 to-transparent" />
          </motion.div>
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

        <motion.section
          initial={false}
          animate={{
            height: isSubmitting ? 136 : "auto",
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`relative z-20 -mt-8 rounded-t-[34px] border-t border-white/75 bg-[linear-gradient(180deg,rgba(250,249,245,0.94)_0%,rgba(245,243,238,0.98)_100%)] px-6 shadow-[0_-14px_32px_rgba(34,49,38,0.08)] backdrop-blur-2xl ${
            isSubmitting ? "flex items-center overflow-hidden py-4" : "pb-8 pt-5"
          }`}
        >
          {showSwipeGuide && activeTargetType === "personal" && !isSubmitting ? (
            <>
              <div className="pointer-events-none absolute inset-0 z-10 rounded-t-[34px] bg-[rgba(246,244,238,0.52)] backdrop-blur-[10px]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0))]" />
            </>
          ) : null}

          {showModeSwitcher && !isSubmitting ? (
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

          {isSubmitting && activeTargetType === "personal" && route ? (
            <motion.div
              key="running-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="w-full space-y-2.5"
            >
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sage-500">
                  {route.city.toUpperCase()} · {route.country.toUpperCase()}
                </p>
                <h2 className="mt-1.5 truncate font-destination-display text-[1.62rem] leading-[0.94] tracking-[0.01em] text-ink">
                  {route.name}
                </h2>
              </div>

              <div>
                <div className="relative h-8 overflow-visible">
                  <div className="absolute inset-x-[15px] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-sage-200/90" />
                  <div className="absolute inset-x-[15px] top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full">
                    <motion.div
                      className="h-full origin-left rounded-full bg-sage-700/25"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: runSimulationDurationSeconds, ease: "easeInOut" }}
                    />
                  </div>
                  <motion.img
                    src={runnerIcon}
                    alt=""
                    aria-hidden="true"
                    className="absolute top-1/2 h-[30px] w-[30px] -translate-y-[80%]"
                    initial={{ left: 0 }}
                    animate={{ left: "calc(100% - 30px)" }}
                    transition={{ duration: runSimulationDurationSeconds, ease: "easeInOut" }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-sage-500">
                  <span>0 km</span>
                  <span>{effectiveDistance.toFixed(1)} km</span>
                </div>
              </div>
            </motion.div>
          ) : activeTargetType === "personal" && route ? (
            <div className={`relative ${showSwipeGuide ? "z-30" : ""}`}>
              {showSwipeGuide ? (
                <div className="pointer-events-none absolute inset-x-0 -top-2 bottom-0 rounded-[28px] bg-white/18 ring-1 ring-white/70 shadow-[0_24px_40px_rgba(33,49,38,0.12)]" />
              ) : null}
              <div
                ref={journeyGuideCardRef}
                className="relative"
              >
                <div
                  ref={carouselRef}
                  onScroll={handleRouteCarouselScroll}
                  className="-mx-6 flex snap-x snap-mandatory overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
              {carouselRoutes.map(({ item, virtualIndex, isClone }) => {
                const active = item.id === route.id;
                const isRunnableRoute = runnableRouteIds.has(item.id);
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
                    key={`${item.id}-${virtualIndex}`}
                    type="button"
                    data-route-id={item.id}
                    data-carousel-index={virtualIndex}
                    onClick={() => {
                      setSelectedCatalogRouteId(item.id);
                      if (isRunnableRoute) {
                        selectRoute(item.id);
                      }
                    }}
                    className={`w-full min-w-full shrink-0 snap-start overflow-hidden px-6 py-1 text-left transition ${
                      active ? "opacity-100" : "opacity-35"
                    }`}
                    aria-label={isRunnableRoute ? `Select ${item.name}` : `${item.name} is PaceCrew exclusive or locked`}
                    tabIndex={isClone ? -1 : 0}
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
              </div>

              {showSwipeGuide ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-x-4 top-[calc(100%+0.4rem)] z-40"
                >
                  <div className="rounded-[22px] bg-white/82 px-4 py-3 shadow-[0_18px_34px_rgba(35,52,40,0.12)] ring-1 ring-white/88 backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">Swipe to choose your next journey</p>
                        <div className="mt-2 flex items-center gap-2 text-sage-500">
                          <ChevronsLeftRight className="h-4 w-4 shrink-0" />
                          <div className="relative h-5 w-16 overflow-hidden">
                            <motion.div
                              className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-sage-700/80"
                              animate={{ x: [0, 28, 0] }}
                              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.div
                              className="absolute left-1 top-1/2 h-[2px] w-12 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(95,117,103,0.18),rgba(95,117,103,0.5),rgba(95,117,103,0.18))]"
                              animate={{ opacity: [0.45, 0.9, 0.45] }}
                              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={dismissSwipeGuide}
                        className="pointer-events-auto shrink-0 rounded-full bg-sage-700 px-3 py-1.5 text-xs font-medium text-white shadow-[0_10px_20px_rgba(61,92,74,0.18)]"
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
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

          {!isSubmitting ? <div className="mt-8">
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
          </div> : null}

          {!isSubmitting ? <div className="mt-8">
            <Button
              fullWidth
              className="h-14 bg-sage-700/95 text-base text-white shadow-[0_18px_28px_rgba(61,92,74,0.22)] hover:bg-sage-800"
              onClick={handleStartRun}
              disabled={
                isSubmitting ||
                effectiveDistance <= 0 ||
                (activeTargetType === "personal" && !canStartPersonalRun) ||
                (activeTargetType === "pacecrew_mission" && !selectedMissionBundle)
              }
            >
              {isSubmitting
                ? t("run.simulating")
                : activeTargetType === "pacecrew_mission"
                  ? t("run.startMissionRun")
                  : !canStartPersonalRun
                    ? route?.sourceType === "pacecrew"
                      ? t("paceport.pacecrewOnly")
                      : "Unlock in Paceport"
                  : t("run.startRun")}
            </Button>
          </div> : null}
        </motion.section>
      </div>

      {showWelcomeIntro ? (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center bg-black/0"
          initial={{ opacity: 1 }}
          animate={isWelcomeRevealing ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => {
            if (isWelcomeRevealing && !welcomeDragActiveRef.current) {
              setShowWelcomeIntro(false);
            }
          }}
        >
          <div className="relative h-screen w-full max-w-md overflow-hidden bg-[#f7f5ef] px-7 text-ink">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(216,229,218,0.62),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(247,245,239,0)_58%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,rgba(247,245,239,0)_0%,rgba(237,243,237,0.78)_100%)]" />

            <motion.main
              className="relative z-10 mt-[-10vh] flex h-full flex-col items-center justify-center text-center"
              animate={isWelcomeRevealing ? { y: -28, opacity: 0 } : { y: 0, opacity: 1 }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative mt-[-1rem] flex h-12 w-full items-center justify-center">
                <motion.h1
                  className="absolute text-xs font-light uppercase tracking-[0.5em] text-sage-800/70"
                  animate={{
                    opacity: [0.9, 0.9, 0, 0, 0.9],
                    filter: ["blur(0px)", "blur(0px)", "blur(4px)", "blur(4px)", "blur(0px)"],
                    scale: [1, 1, 0.98, 0.98, 1],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  MILESCAPE
                </motion.h1>
                <motion.p
                  className="absolute text-[0.85rem] font-light tracking-wide text-sage-600/70"
                  animate={{
                    opacity: [0, 0, 0.9, 0.9, 0],
                    filter: ["blur(4px)", "blur(4px)", "blur(0px)", "blur(0px)", "blur(4px)"],
                    scale: [0.98, 0.98, 1, 1, 0.98],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  Sync your movement with your map.
                </motion.p>
              </div>

              <div className="pointer-events-none relative mt-12 w-full max-w-[280px] sm:max-w-sm">
                <svg
                  viewBox="0 0 400 200"
                  className="h-auto w-full drop-shadow-sm"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M 10 150 C 30 150 50 90 80 90 C 110 90 120 150 150 150 C 182 150 199 124 224 124 C 250 124 264 150 290 150"
                    stroke="rgba(54,83,66,0.46)"
                    strokeWidth="2.2"
                    style={{ pathLength: welcomeLandscapeProgress }}
                  />
                  <motion.path
                    d="M 10 150 C 30 150 50 90 80 90 C 110 90 120 150 150 150 L 180 150 C 200 150 210 120 230 120 C 250 120 260 150 280 150 L 310 150 L 310 100 L 330 100 L 330 150 L 340 150 L 340 70 L 360 70 L 360 150 L 390 150"
                    stroke="rgba(54,83,66,0.2)"
                    strokeWidth="1.4"
                    style={{ pathLength: welcomeDrawProgress }}
                  />
                  <motion.path
                    d="M 42 162 C 86 137 125 135 160 151 C 196 168 229 164 266 142 C 300 121 332 122 374 144"
                    stroke="rgba(54,83,66,0.82)"
                    strokeWidth="3.2"
                    style={{ pathLength: welcomeRouteProgress }}
                  />
                  <motion.path
                    d="M 306 150 L 306 104 L 326 104 L 326 150 M 338 150 L 338 76 L 360 76 L 360 150 M 372 150 L 372 118 L 390 118 L 390 150"
                    stroke="rgba(54,83,66,0.66)"
                    strokeWidth="2.3"
                    style={{ pathLength: welcomeCityProgress }}
                  />
                </svg>
              </div>
            </motion.main>

            <div className="absolute left-1/2 top-[78.2%] z-20 w-[78%] max-w-[18.5rem] -translate-x-1/2">
              <div
                ref={welcomeTrackRef}
                role="slider"
                aria-label="Start your journey"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(welcomeSliderValue)}
                tabIndex={0}
                onPointerDown={handleWelcomePointerDown}
                onPointerMove={handleWelcomePointerMove}
                onPointerUp={resetWelcomeSlider}
                onPointerCancel={resetWelcomeSlider}
                className="relative h-8 touch-none cursor-pointer overflow-visible"
              >
                <div className="absolute inset-x-[15px] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[rgba(188,207,194,0.78)]" />
                <div className="absolute inset-x-[15px] top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full">
                  <div
                    className="h-full origin-left rounded-full bg-[rgba(54,83,66,0.9)]"
                    style={{ transform: `scaleX(${welcomeSliderValue / 100})` }}
                  />
                </div>
                <img
                  src={runnerIcon}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 h-[30px] w-[30px] -translate-x-1/2 -translate-y-[80%]"
                  style={{ left: `calc(${welcomeSliderValue}% + ${15 - welcomeSliderValue * 0.3}px)` }}
                />
              </div>
              <p
                className="mt-7 text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-sage-500"
                style={{ opacity: Math.max(1 - welcomeSliderValue / 50, 0) }}
              >
                Start your journey
              </p>
              <p
                className="mt-3 text-center text-xs leading-5 text-sage-500/80"
                style={{ opacity: Math.max(1 - welcomeSliderValue / 58, 0) }}
              >
                Slide the runner to reveal your route.
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}

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
