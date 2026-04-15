import { motion } from "framer-motion";
import { ChevronDown, Flag, Route as RouteIcon, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [missionPickerOpen, setMissionPickerOpen] = useState(false);

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

    const progress = state.routeProgress.find((entry) => entry.routeId === route.id);
    const completedDistanceKm = progress?.completedDistanceKm ?? 0;
    const rawPreviewProgressKm = completedDistanceKm + effectiveDistance;
    const hasOverflowPreview = rawPreviewProgressKm > route.totalDistanceKm;
    const progressCycleCount = hasOverflowPreview
      ? Math.floor((rawPreviewProgressKm - 0.0001) / route.totalDistanceKm) + 1
      : 1;
    const previewProgressKm = hasOverflowPreview ? rawPreviewProgressKm % route.totalDistanceKm : rawPreviewProgressKm;

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

  return (
    <>
      <div className="space-y-4 pb-4">
        {showModeSwitcher ? (
          <div className="rounded-[28px] bg-white/85 p-2 shadow-card ring-1 ring-sage-100">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType("personal")}
                className={`rounded-[22px] px-4 py-3 text-sm font-semibold transition ${
                  activeTargetType === "personal" ? "bg-sage-700 text-white" : "bg-transparent text-sage-700"
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
                className={`rounded-[22px] px-4 py-3 text-sm font-semibold transition ${
                  activeTargetType === "pacecrew_mission" ? "bg-sage-700 text-white" : "bg-transparent text-sage-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("run.pacecrewMission")}
                </span>
              </button>
            </div>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[42px] bg-gradient-to-b from-white via-white to-sage-50/70 shadow-card ring-1 ring-white/80">
          <div className="px-4 pt-5">
            {activeTargetType === "personal" && route ? (
              <button type="button" onClick={() => setPickerOpen(true)} className="w-full rounded-[30px] text-left">
                <RouteArtwork routeId={route.id} label={route.city} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMissionPickerOpen(true)}
                className="w-full rounded-[30px] bg-gradient-to-br from-sky-50 via-white to-sage-50 px-6 py-7 text-left ring-1 ring-sky-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">
                      PaceCrew Mission
                    </p>
                    <h2 className="mt-3 text-[1.9rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink">
                      {selectedMissionBundle?.mission.title ?? "Choose a mission"}
                    </h2>
                    <p className="mt-2 text-sm text-sage-700">{selectedMissionBundle?.crew.name ?? "Accepted mission"}</p>
                  </div>
                  <div className="rounded-full bg-white p-3 shadow-sm ring-1 ring-sky-100">
                    <Flag className="h-5 w-5 text-sky-600" />
                  </div>
                </div>
              </button>
            )}

            <div className="mt-3 flex justify-center">
              <div className="inline-flex items-center justify-center rounded-full bg-white/80 p-2 shadow-sm ring-1 ring-sage-100">
                <ChevronDown className="h-4 w-4 text-sage-500" />
              </div>
            </div>

            <div className="pb-4 pt-4 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-500">
                {preview?.targetMeta}
              </p>
              <h2 className="mt-2 text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink">
                {preview?.targetTitle}
              </h2>
            </div>
          </div>

          <div className="px-5 pb-6 pt-2">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sage-500">{t("run.distance")}</p>
                <p className="mt-2 text-5xl font-semibold tracking-tight text-ink">
                  {effectiveDistance.toFixed(1)}K
                </p>
              </div>
              <div className="pb-2 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-sage-500">
                  {activeTargetType === "pacecrew_mission" ? t("run.missionProgress") : t("run.progress")}
                </p>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <p className="text-sm font-medium text-sage-700">
                    {preview?.value.toFixed(1)} / {preview?.total} km
                  </p>
                  {preview && preview.cycleCount > 1 ? (
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-sage-700 px-2 text-xs font-semibold text-white">
                      {preview.cycleCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] bg-white/75 px-4 py-5 ring-1 ring-sage-100/80 backdrop-blur">
              <input
                type="range"
                min="0"
                max={state.sliderMaxDistanceKm}
                step="0.1"
                value={selectedDistance}
                onChange={(event) => setSelectedDistance(Number(event.target.value))}
                className="ios-slider h-2.5 w-full cursor-pointer appearance-none rounded-full bg-sage-100"
              />
              <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-sage-400">
                <span>{t("run.short")}</span>
                <span>{t("run.long")}</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                fullWidth
                className="bg-ink py-4 text-base text-white hover:bg-sage-900"
                onClick={handleStartRun}
                disabled={isSubmitting || effectiveDistance <= 0 || (activeTargetType === "pacecrew_mission" && !selectedMissionBundle)}
              >
                {isSubmitting ? t("run.simulating") : activeTargetType === "pacecrew_mission" ? t("run.startMissionRun") : t("run.startRun")}
              </Button>
            </div>
          </div>
        </section>
      </div>

      {pickerOpen && route ? (
        <div className="fixed inset-0 z-40">
          <button type="button" onClick={() => setPickerOpen(false)} className="absolute inset-0 bg-black/18" aria-label="Close route picker" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 rounded-t-[32px] bg-white px-4 pb-8 pt-4 shadow-2xl"
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-sage-200" />
            <div className="space-y-3">
              {playableRoutes.map((item) => {
                const active = item.id === route.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      selectRoute(item.id);
                      setPickerOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-[24px] p-3 text-left transition ${
                      active ? "bg-sage-700 text-white" : "bg-sage-50 text-ink"
                    }`}
                  >
                    <RouteArtwork routeId={item.id} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className={`mt-1 text-xs ${active ? "text-white/80" : "text-sage-500"}`}>{item.city}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
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
