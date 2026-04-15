import { ChevronLeft, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import { SideDrawer } from "./SideDrawer";

export const AppShell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useAppState();
  const isPrimaryHome = location.pathname === "/run/setup";
  const isOnboarding = location.pathname === "/";
  const isPaceCrewSubpage = location.pathname.startsWith("/pacecrew/") && location.pathname !== "/pacecrew";

  const pageTitles: Record<string, string> = {
    "/": t("app.welcome"),
    "/pacecrew": t("app.paceCrew"),
    "/pacecrew/create": t("app.paceCrewCreate"),
    "/pacecrew/joined": t("app.paceCrewJoined"),
    "/pacecrew/discover": t("app.paceCrewDiscover"),
    "/pacecrew/missions": t("app.paceCrewMissions"),
    "/paceport": t("app.paceport"),
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

      <header className="sticky top-0 z-30 flex items-center justify-between px-4 pb-3 pt-5 backdrop-blur">
        {isPrimaryHome ? (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-full bg-white/90 p-3 text-sage-700 shadow-card ring-1 ring-sage-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : isOnboarding ? (
          <div className="h-11 w-11" />
        ) : (
          <button
            type="button"
            onClick={() => navigate(isPaceCrewSubpage ? "/pacecrew" : "/run/setup")}
            className="rounded-full bg-white/90 p-3 text-sage-700 shadow-card ring-1 ring-sage-100"
            aria-label={isPaceCrewSubpage ? "Return to PaceCrew" : "Return to Choose Journey"}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-sage-500">MileScape</p>
          <h1 className="mt-1 text-base font-semibold text-ink">{title}</h1>
        </div>

        <div className="h-11 w-11" />
      </header>

      <main className="flex-1 px-4 pb-8 pt-1">
        <Outlet />
      </main>
    </div>
  );
};
