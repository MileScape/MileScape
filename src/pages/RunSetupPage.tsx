import { motion } from "framer-motion";
import { ChevronsLeftRight, Watch } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import runnerIcon from "../assets/runner-slider.svg";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { MapHeroShell } from "../components/ui/MapHeroShell";
import { Button } from "../components/ui/Button";
import { useAppState } from "../hooks/useAppState";
import { formatCountryName } from "../utils/location";
import { getRunSimulationDurationSeconds } from "../utils/routeSimulation";
import { hasSeenJourneySwipeGuide, markJourneySwipeGuideSeen } from "../utils/storage";
import { DistanceSlider } from "../components/run/DistanceSlider";

const getRouteTitleSizeClassName = (routeName: string, variant: "compact" | "hero") => {
  if (variant === "compact") {
    if (routeName.length >= 22) {
      return "text-[1.32rem]";
    }

    if (routeName.length >= 19) {
      return "text-[1.46rem]";
    }

    return "text-[1.62rem]";
  }

  if (routeName.length >= 22) {
    return "text-[1.92rem]";
  }

  if (routeName.length >= 19) {
    return "text-[2.1rem]";
  }

  return "text-[2.35rem]";
};

export const RunSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { routes, playableRoutes, state, completeRun, selectRoute, t } = useAppState();
  const routeState = location.state as { initialDistanceRatio?: number } | null;
  const initialDistanceRatio =
    typeof routeState?.initialDistanceRatio === "number"
      ? Math.min(Math.max(routeState.initialDistanceRatio, 0), 1)
      : null;
  const [selectedDistance, setSelectedDistance] = useState(() =>
    initialDistanceRatio === null
      ? Math.min(5, state.sliderMaxDistanceKm)
      : Math.min(state.sliderMaxDistanceKm, Math.max(0, state.sliderMaxDistanceKm * initialDistanceRatio)),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const journeyGuideCardRef = useRef<HTMLDivElement | null>(null);
  const carouselScrollTimeoutRef = useRef<number | null>(null);
  const carouselJumpingRef = useRef(false);
  const carouselInitializedRef = useRef(false);
  const carouselScrollSelectionRef = useRef(false);
  const initialRouteIdRef = useRef<string | null>(null);
  const [showSwipeGuide, setShowSwipeGuide] = useState(false);

  useEffect(() => {
    setSelectedDistance((current) => Math.min(current, state.sliderMaxDistanceKm));
  }, [state.sliderMaxDistanceKm]);

  const routeCatalog = routes;
  const runnableRouteIds = useMemo(() => new Set(playableRoutes.map((entry) => entry.id)), [playableRoutes]);
  const [selectedCatalogRouteId, setSelectedCatalogRouteId] = useState(
    () => state.selectedRouteId ?? playableRoutes[0]?.id ?? routeCatalog[0]?.id ?? null,
  );
  const route = routeCatalog.find((entry) => entry.id === selectedCatalogRouteId) ?? playableRoutes[0] ?? routeCatalog[0];
  const routeIndex = route ? routeCatalog.findIndex((entry) => entry.id === route.id) : -1;
  const canStartPersonalRun = Boolean(route && runnableRouteIds.has(route.id));

  useEffect(() => {
    if (state.selectedRouteId && !selectedCatalogRouteId) {
      setSelectedCatalogRouteId(state.selectedRouteId);
    }
  }, [selectedCatalogRouteId, state.selectedRouteId]);

  if (!route) {
    return <Navigate to="/paceport" replace />;
  }

  const effectiveDistance = selectedDistance;
  const runSimulationDurationSeconds = useMemo(
    () => getRunSimulationDurationSeconds(effectiveDistance, route?.id),
    [effectiveDistance, route?.id],
  );

  const preview = useMemo(() => {
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
      targetMeta: `${route.city}, ${formatCountryName(route.country)}`
    };
  }, [effectiveDistance, route, state.routeProgress]);

  const routeProgress = route
    ? state.routeProgress.find((entry) => entry.routeId === route.id)
    : undefined;
  const routeExploredPercent = route
    ? Math.round(((routeProgress?.completedDistanceKm ?? 0) / route.totalDistanceKm) * 100)
    : 0;
  const metadataLabel = route
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
    if (!route || hasSeenJourneySwipeGuide()) {
      setShowSwipeGuide(false);
      return;
    }

    initialRouteIdRef.current = route.id;
    setShowSwipeGuide(true);
  }, [route?.id]);

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
      if (route && canStartPersonalRun) {
        completeRun({ targetType: "personal", routeId: route.id, distanceKm: effectiveDistance });
      }
      navigate("/run/result");
    }, runSimulationDurationSeconds * 1000);
  };

  useEffect(() => {
    return () => {
      if (carouselScrollTimeoutRef.current) {
        window.clearTimeout(carouselScrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!carouselRef.current || !route) {
      return;
    }

    if (carouselScrollSelectionRef.current) {
      carouselScrollSelectionRef.current = false;
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
  }, [routeCatalog.length, routeIndex, route?.id]);

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
        carouselScrollSelectionRef.current = true;
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
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-canvas">
        <motion.div
          className="relative shrink-0 overflow-hidden"
          animate={{ height: isSubmitting ? "calc(100vh - 104px)" : "62vh" }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        >
          <MapHeroShell
            className="h-full"
            topFadeClassName="h-28 bg-gradient-to-b from-[#0d1711]/24 via-[#0d1711]/10 to-transparent"
            bottomFadeClassName="h-28 bg-gradient-to-t from-[#f5f3ee] via-[#f5f3ee]/82 to-transparent"
          >
            <div className="block h-full w-full text-left">
              <RouteArtwork
                routeId={route.id}
                variant="hero"
                className="h-full"
                simulation={{
                  active: isSubmitting,
                  durationSeconds: runSimulationDurationSeconds,
                  distanceKm: effectiveDistance,
                  routeDistanceKm: route.totalDistanceKm
                }}
              />
            </div>
          </MapHeroShell>
        </motion.div>

        <motion.section
          initial={false}
          animate={{
            height: isSubmitting ? 136 : "auto",
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`relative z-20 -mt-8 min-h-0 rounded-t-[34px] border-t border-white/75 bg-[linear-gradient(180deg,rgba(250,249,245,0.94)_0%,rgba(245,243,238,0.98)_100%)] px-6 shadow-[0_-14px_32px_rgba(34,49,38,0.08)] backdrop-blur-2xl ${
            isSubmitting ? "flex items-center overflow-hidden py-4" : "pb-6 pt-5"
          }`}
        >
          {showSwipeGuide && !isSubmitting ? (
            <>
              <div className="pointer-events-none absolute inset-0 z-10 rounded-t-[34px] bg-[rgba(246,244,238,0.52)] backdrop-blur-[10px]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0))]" />
            </>
          ) : null}

          {isSubmitting ? (
            <motion.div
              key="running-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="w-full space-y-2.5"
            >
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sage-500">
                  {route.city.toUpperCase()} · {formatCountryName(route.country, { uppercase: true })}
                </p>
                <h2
                  className={`mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-destination-display leading-[0.94] tracking-[0.01em] text-ink ${getRouteTitleSizeClassName(route.name, "compact")}`}
                  title={route.name}
                >
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
          ) : (
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
                          {item.city.toUpperCase()} · {formatCountryName(item.country, { uppercase: true })}
                        </p>
                        <h2
                          className={`mt-3 overflow-hidden text-ellipsis whitespace-nowrap font-destination-display leading-[0.94] tracking-[0.01em] text-ink ${getRouteTitleSizeClassName(item.name, "hero")}`}
                          title={item.name}
                        >
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
          )}

          {!isSubmitting ? (
            <DistanceSlider value={selectedDistance} onChange={setSelectedDistance} max={state.sliderMaxDistanceKm} />
          ) : null}

          {!isSubmitting ? <div className="mt-8">
            <Button
              fullWidth
              className="h-14 bg-sage-700/95 text-base text-white shadow-[0_18px_28px_rgba(61,92,74,0.22)] hover:bg-sage-800"
              onClick={handleStartRun}
              disabled={
                isSubmitting ||
                effectiveDistance <= 0 ||
                !canStartPersonalRun
              }
            >
              {isSubmitting
                ? t("run.simulating")
                : !canStartPersonalRun
                  ? "Unlock in Paceport"
                  : t("run.startRun")}
            </Button>
          </div> : null}
        </motion.section>
      </div>

    </>
  );
};
