import { Compass, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SideDrawer } from "./SideDrawer";

const pageTitles: Record<string, string> = {
  "/": "Welcome",
  "/explore": "Destinations",
  "/run/setup": "Choose Journey",
  "/run/result": "Run Result",
  "/shop": "Shop",
  "/achievements": "Collection",
  "/dashboard": "Profile"
};

export const AppShell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const title = useMemo(() => {
    if (location.pathname.startsWith("/routes/")) {
      return "Route Story";
    }

    return pageTitles[location.pathname] ?? "MileScape";
  }, [location.pathname]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-canvas md:max-w-[430px]">
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header className="sticky top-0 z-30 flex items-center justify-between px-4 pb-3 pt-5 backdrop-blur">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-full bg-white/90 p-3 text-sage-700 shadow-card ring-1 ring-sage-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-sage-500">MileScape</p>
          <h1 className="mt-1 text-base font-semibold text-ink">{title}</h1>
        </div>

        <div className="rounded-full bg-white/80 p-3 text-sage-700 shadow-card ring-1 ring-sage-100">
          <Compass className="h-5 w-5" />
        </div>
      </header>

      <main className="flex-1 px-4 pb-8 pt-1">
        <Outlet />
      </main>
    </div>
  );
};
