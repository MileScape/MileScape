import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";

const lazyPage = <TModule, TExport extends keyof TModule>(
  importer: () => Promise<TModule>,
  exportName: TExport,
) =>
  lazy(async () => {
    const module = await importer();
    return { default: module[exportName] as unknown as ComponentType };
  });

const routeElement = (element: ReactNode) => (
  <Suspense
    fallback={
      <div className="flex min-h-[240px] items-center justify-center px-6 text-sm font-medium text-sage-600">
        Loading...
      </div>
    }
  >
    {element}
  </Suspense>
);

const AchievementsPage = lazyPage(() => import("../pages/AchievementsPage"), "AchievementsPage");
const DashboardPage = lazyPage(() => import("../pages/DashboardPage"), "DashboardPage");
const ExplorePage = lazyPage(() => import("../pages/ExplorePage"), "ExplorePage");
const HomePage = lazyPage(() => import("../pages/HomePage"), "HomePage");
const MyScapePage = lazyPage(() => import("../pages/MyScapePage"), "MyScapePage");
const PaceCrewCreatePage = lazyPage(() => import("../pages/PaceCrewCreatePage"), "PaceCrewCreatePage");
const PaceCrewDetailPage = lazyPage(() => import("../pages/PaceCrewDetailPage"), "PaceCrewDetailPage");
const PaceCrewDiscoverPage = lazyPage(() => import("../pages/PaceCrewDiscoverPage"), "PaceCrewDiscoverPage");
const PaceCrewJoinedPage = lazyPage(() => import("../pages/PaceCrewJoinedPage"), "PaceCrewJoinedPage");
const PaceCrewMissionsPage = lazyPage(() => import("../pages/PaceCrewMissionsPage"), "PaceCrewMissionsPage");
const PaceCrewPage = lazyPage(() => import("../pages/PaceCrewPage"), "PaceCrewPage");
const PaceportDetailPage = lazyPage(() => import("../pages/PaceportDetailPage"), "PaceportDetailPage");
const PaceportOverviewPage = lazyPage(() => import("../pages/PaceportOverviewPage"), "PaceportOverviewPage");
const RouteDetailPage = lazyPage(() => import("../pages/RouteDetailPage"), "RouteDetailPage");
const RunResultPage = lazyPage(() => import("../pages/RunResultPage"), "RunResultPage");
const RunSetupPage = lazyPage(() => import("../pages/RunSetupPage"), "RunSetupPage");
const WearablesConnectPage = lazyPage(() => import("../pages/WearablesConnectPage"), "WearablesConnectPage");
const WearablesPage = lazyPage(() => import("../pages/WearablesPage"), "WearablesPage");

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: routeElement(<HomePage />) },
      { path: "explore", element: routeElement(<ExplorePage />) },
      { path: "routes/:routeId", element: routeElement(<RouteDetailPage />) },
      { path: "pacecrew", element: routeElement(<PaceCrewPage />) },
      { path: "pacecrew/create", element: routeElement(<PaceCrewCreatePage />) },
      { path: "pacecrew/joined", element: routeElement(<PaceCrewJoinedPage />) },
      { path: "pacecrew/discover", element: routeElement(<PaceCrewDiscoverPage />) },
      { path: "pacecrew/missions", element: routeElement(<PaceCrewMissionsPage />) },
      { path: "pacecrew/:crewId", element: routeElement(<PaceCrewDetailPage />) },
      { path: "paceport", element: routeElement(<PaceportOverviewPage />) },
      { path: "paceport/:routeId", element: routeElement(<PaceportDetailPage />) },
      { path: "myscape", element: routeElement(<MyScapePage />) },
      { path: "achievements", element: routeElement(<AchievementsPage />) },
      { path: "run/setup", element: routeElement(<RunSetupPage />) },
      { path: "run/result", element: routeElement(<RunResultPage />) },
      { path: "wearables", element: routeElement(<WearablesPage />) },
      { path: "wearables/connect", element: routeElement(<WearablesConnectPage />) },
      { path: "dashboard", element: routeElement(<DashboardPage />) }
    ]
  }
]);
