import { ChevronLeft, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import { cn } from "../../utils/cn";
import { SideDrawer } from "./SideDrawer";

export const AppShell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { state, t } = useAppState();
  const isPrimaryHome = location.pathname === "/run/setup";
  const isOnboarding = location.pathname === "/";
  const isPaceCrewHome = location.pathname === "/pacecrew";
  const isWearableHome = location.pathname === "/wearable";
  const isWearablesHome = location.pathname === "/wearables";
  const isRunResult = location.pathname === "/run/result";
  const isPaceCrewSubpage = location.pathname.startsWith("/pacecrew/") && location.pathname !== "/pacecrew";
  const isWearablesSubpage = location.pathname.startsWith("/wearables/") && location.pathname !== "/wearables";
  const isWearablesFullBleed = isWearablesHome && !state.wearableConnection;

  const pageTitles: Record<string, string> = {
    "/": t("app.welcome"),
    "/pacecrew": t("app.paceCrew"),
    "/pacecrew/create": t("app.paceCrewCreate"),
    "/pacecrew/joined": t("app.paceCrewJoined"),
    "/pacecrew/discover": t("app.paceCrewDiscover"),
    "/pacecrew/missions": t("app.paceCrewMissions"),
    "/paceport": t("app.paceport"),
    "/wearable": t("app.wearable"),
    "/wearables": t("app.wearables"),
    "/wearables/connect": "Connect Device",
    "/run/setup": t("app.chooseJourney"),
    "/run/result": t("app.runResult"),
    "/shop": t("app.shop"),
    "/dashboard": t("app.profile")
  };

  const title = useMemo(() => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    if (location.pathname.startsWith("/pacecrew/")) {
      return t("app.paceCrewDetail");
    }
    if (location.pathname.startsWith("/paceport/")) {
      return t("app.paceportDetail");
    }
    return "MileScape";
  }, [location.pathname, pageTitles, t]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-canvas md:max-w-[430px]">
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header
        className={cn(
          "sticky top-0 z-30 flex items-center justify-between px-4 pt-5",
          isOnboarding
            ? "hidden"
            : isRunResult
            ? "mb-[-4.35rem] pb-3 backdrop-blur-2xl bg-[linear-gradient(180deg,rgba(245,243,238,0.86)_0%,rgba(245,243,238,0.56)_42%,rgba(245,243,238,0.18)_72%,rgba(245,243,238,0)_100%)]"
            : isPrimaryHome || isWearableHome || isWearablesFullBleed
            ? "mb-[-4.75rem] pb-0"
            : "pb-3 backdrop-blur",
        )}
      >
        {isPrimaryHome ? (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-full bg-white/68 p-3 text-sage-700 shadow-[0_10px_28px_rgba(24,43,29,0.12)] ring-1 ring-white/75 backdrop-blur-xl"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : isWearableHome ? (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-full bg-white/74 p-3 text-sage-700 shadow-[0_10px_28px_rgba(24,43,29,0.12)] ring-1 ring-white/75 backdrop-blur-xl"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : isOnboarding ? (
          <div className="h-11 w-11" />
        ) : (
          <button
            type="button"
            onClick={() =>
              navigate(
                isPaceCrewSubpage
                  ? "/pacecrew"
                  : isWearablesSubpage
                    ? state.wearableConnection
                      ? "/wearables"
                      : "/run/setup"
                    : "/run/setup",
              )
            }
            className="rounded-full bg-white/90 p-3 text-sage-700 shadow-card ring-1 ring-sage-100"
            aria-label={
              isPaceCrewSubpage
                ? "Return to PaceCrew"
                : isWearablesSubpage
                  ? state.wearableConnection
                    ? "Return to Wearables"
                    : "Return to Choose Journey"
                  : "Return to Choose Journey"
            }
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div className="text-center">
          <p className={cn("uppercase tracking-[0.28em]", isPrimaryHome ? "text-[10px] text-white/92" : "text-[11px] text-sage-500")}>
            MILESCAPE
          </p>
          {!isPrimaryHome && !isPaceCrewHome && !isWearableHome && !isWearablesFullBleed ? <h1 className="mt-1 text-base font-semibold text-ink">{title}</h1> : null}
        </div>

        <div className="h-11 w-11" />
      </header>

      <main
        className={cn(
          "flex-1",
          isOnboarding || isPrimaryHome || isWearableHome || isWearablesFullBleed
            ? "px-0 pb-0 pt-0"
            : isRunResult
              ? "px-0 pb-8 pt-0"
              : "px-4 pb-8 pt-1",
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};
