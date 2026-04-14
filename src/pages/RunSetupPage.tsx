import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { Button } from "../components/ui/Button";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, getRouteProgress } from "../utils/progress";

export const RunSetupPage = () => {
  const navigate = useNavigate();
  const { routes, state, completeRun, selectRoute } = useAppState();
  const route = routes.find((entry) => entry.id === state.selectedRouteId) ?? routes[0];
  const [selectedDistance, setSelectedDistance] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const effectiveDistance = useMemo(() => selectedDistance, [selectedDistance]);

  if (!route) {
    return <Navigate to="/explore" replace />;
  }

  const progress = getRouteProgress(route.id, state);
  const remainingDistance = Math.max(0, route.totalDistanceKm - progress.completedDistanceKm);
  const afterRunDistance = Math.min(route.totalDistanceKm, progress.completedDistanceKm + effectiveDistance);

  const handleStartRun = () => {
    setIsSubmitting(true);

    window.setTimeout(() => {
      completeRun(route.id, effectiveDistance);
      navigate("/run/result");
    }, 900);
  };

  return (
    <>
      <div className="space-y-5 pb-4">
        <section className="rounded-[36px] bg-white px-4 pb-5 pt-5 shadow-card ring-1 ring-sage-100">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="w-full rounded-[30px] text-left"
          >
            <RouteArtwork routeId={route.id} label={route.city} />
          </button>

          <div className="mt-3 flex items-center justify-center gap-1 text-[11px] uppercase tracking-[0.2em] text-sage-500">
            <span>Tap to switch</span>
            <ChevronDown className="h-4 w-4" />
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sage-500">
              {route.city}, {route.country}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{route.name}</h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-sage-500">Done</p>
              <p className="mt-2 font-semibold text-ink">{formatDistance(progress.completedDistanceKm)}</p>
            </div>
            <div className="rounded-[24px] bg-sage-50 p-4">
              <p className="text-sage-500">Left</p>
              <p className="mt-2 font-semibold text-ink">{formatDistance(remainingDistance)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <p className="text-xs uppercase tracking-[0.2em] text-sage-500">Distance</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">
            {effectiveDistance.toFixed(1)}K
          </p>

          <div className="mt-6">
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={selectedDistance}
              onChange={(event) => setSelectedDistance(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-sage-100 accent-sage-700"
            />
            <div className="mt-3 flex justify-between text-xs font-medium text-sage-500">
              {[1, 2, 3, 4, 5].map((value) => (
                <span key={value}>{value}K</span>
              ))}
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedDistance(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedDistance === value
                    ? "bg-sage-700 text-white"
                    : "bg-sage-50 text-sage-700"
                }`}
              >
                {value}K
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[24px] bg-sage-50 px-4 py-3 text-center text-sm font-medium text-sage-700">
            {afterRunDistance.toFixed(1)} / {route.totalDistanceKm} km
          </div>
        </section>

        <motion.div layout>
          <Button fullWidth onClick={handleStartRun} disabled={isSubmitting || effectiveDistance <= 0}>
            {isSubmitting ? "Simulating run..." : "Start run"}
          </Button>
        </motion.div>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="absolute inset-0 bg-black/18"
            aria-label="Close route picker"
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[32px] bg-white px-4 pb-8 pt-4 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-sage-200" />
            <div className="space-y-3">
              {routes.map((item) => {
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
                        {item.city} · {item.totalDistanceKm} km
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
