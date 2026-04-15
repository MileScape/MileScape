import { ArrowRight, Sparkles } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { RouteArtwork } from "../components/route/RouteArtwork";
import { buttonStyles } from "../components/ui/Button";
import { useAppState } from "../hooks/useAppState";
import { hasSeenOnboarding, markOnboardingSeen } from "../utils/storage";

export const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useAppState();

  if (hasSeenOnboarding()) {
    return <Navigate to="/run/setup" replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col justify-between">
      <section className="space-y-8 pt-2">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sage-700 shadow-card ring-1 ring-sage-100">
            <Sparkles className="h-4 w-4" />
            MileScape
          </span>
          <h2 className="max-w-sm text-5xl font-semibold leading-[1.02] tracking-tight text-ink">
            {t("home.title")}
          </h2>
        </div>

        <div className="flex justify-center py-2">
          <RouteArtwork routeId="central-park-loop" label="Central Park" />
        </div>
      </section>

      <section className="space-y-3 pb-2 pt-8">
        <button
          type="button"
          onClick={() => {
            markOnboardingSeen();
            navigate("/run/setup", { replace: true });
          }}
          className={buttonStyles({ fullWidth: true, className: "py-4 text-base" })}
        >
          <span className="inline-flex items-center gap-2">
            {t("home.start")}
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </section>
    </div>
  );
};
