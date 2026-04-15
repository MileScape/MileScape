import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { Button } from "../components/ui/Button";
import { useAppState } from "../hooks/useAppState";

export const RunSetupPage = () => {
  const navigate = useNavigate();
  const { playableRoutes, state, completeRun, selectRoute } = useAppState();
  const route = playableRoutes.find((entry) => entry.id === state.selectedRouteId) ?? playableRoutes[0];
  const [selectedDistance, setSelectedDistance] = useState(Math.min(5, state.sliderMaxDistanceKm));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setSelectedDistance((current) => Math.min(current, state.sliderMaxDistanceKm));
  }, [state.sliderMaxDistanceKm]);

  if (!route) {
    return <Navigate to="/shop" replace />;
  }

  const effectiveDistance = selectedDistance;
  const progress = state.routeProgress.find((entry) => entry.routeId === route.id);
  const completedDistanceKm = progress?.completedDistanceKm ?? 0;
  const afterRunDistance = Math.min(route.totalDistanceKm, completedDistanceKm + effectiveDistance);
  const hasOverflowPreview = completedDistanceKm + effectiveDistance > route.totalDistanceKm;
  const rawPreviewProgressKm = completedDistanceKm + effectiveDistance;
  const progressCycleCount = hasOverflowPreview
    ? Math.floor((rawPreviewProgressKm - 0.0001) / route.totalDistanceKm) + 1
    : 1;
  const previewProgressKm = hasOverflowPreview
    ? rawPreviewProgressKm % route.totalDistanceKm
    : afterRunDistance;

  const handleStartRun = () => {
    setIsSubmitting(true);

    window.setTimeout(() => {
      completeRun(route.id, effectiveDistance);
      navigate("/run/result");
    }, 900);
  };

  return (
    <>
      <div className="pb-4">
        <section className="overflow-hidden rounded-[42px] bg-gradient-to-b from-white via-white to-sage-50/70 shadow-card ring-1 ring-white/80">
          <div className="px-4 pt-5">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-full rounded-[30px] text-left"
            >
              <RouteArtwork routeId={route.id} label={route.city} />
            </button>

            <div className="mt-3 flex justify-center">
              <div className="inline-flex items-center justify-center rounded-full bg-white/80 p-2 shadow-sm ring-1 ring-sage-100">
                <ChevronDown className="h-4 w-4 text-sage-500" />
              </div>
            </div>

            <div className="pb-4 pt-4 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sage-500">
                {route.city}, {route.country}
              </p>
              <h2 className="mt-2 text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink">
                {route.name}
              </h2>
            </div>
          </div>

          <div className="px-5 pb-6 pt-2">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sage-500">Distance</p>
                <p className="mt-2 text-5xl font-semibold tracking-tight text-ink">
                  {effectiveDistance.toFixed(1)}K
                </p>
              </div>
              <div className="pb-2 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-sage-500">Progress</p>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <p className="text-sm font-medium text-sage-700">
                    {previewProgressKm.toFixed(1)} / {route.totalDistanceKm} km
                  </p>
                  {progressCycleCount > 1 ? (
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-sage-700 px-2 text-xs font-semibold text-white">
                      {progressCycleCount}
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
                <span>Short</span>
                <span>Long</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                fullWidth
                className="bg-ink py-4 text-base text-white hover:bg-sage-900"
                onClick={handleStartRun}
                disabled={isSubmitting || effectiveDistance <= 0}
              >
                {isSubmitting ? "Simulating run..." : "Start run"}
              </Button>
            </div>
          </div>
        </section>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="absolute inset-0 bg-black/18"
            aria-label="Close route picker"
          />
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
                      <p className={`mt-1 text-xs ${active ? "text-white/80" : "text-sage-500"}`}>
                        {item.city}
                      </p>
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
