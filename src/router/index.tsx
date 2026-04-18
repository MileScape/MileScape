import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { HomePage } from "../pages/HomePage";
import { PaceCrewCreatePage } from "../pages/PaceCrewCreatePage";
import { PaceCrewDetailPage } from "../pages/PaceCrewDetailPage";
import { PaceCrewDiscoverPage } from "../pages/PaceCrewDiscoverPage";
import { PaceCrewJoinedPage } from "../pages/PaceCrewJoinedPage";
import { PaceCrewMissionsPage } from "../pages/PaceCrewMissionsPage";
import { PaceCrewPage } from "../pages/PaceCrewPage";
import { PaceportDetailPage } from "../pages/PaceportDetailPage";
import { PaceportOverviewPage } from "../pages/PaceportOverviewPage";
import { RunResultPage } from "../pages/RunResultPage";
import { RunSetupPage } from "../pages/RunSetupPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ShopPage } from "../pages/ShopPage";
import { WearablePage } from "../pages/WearablePage";
import { WearablesPage } from "../pages/WearablesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "pacecrew", element: <PaceCrewPage /> },
      { path: "pacecrew/create", element: <PaceCrewCreatePage /> },
      { path: "pacecrew/joined", element: <PaceCrewJoinedPage /> },
      { path: "pacecrew/discover", element: <PaceCrewDiscoverPage /> },
      { path: "pacecrew/missions", element: <PaceCrewMissionsPage /> },
      { path: "pacecrew/:crewId", element: <PaceCrewDetailPage /> },
      { path: "paceport", element: <PaceportOverviewPage /> },
      { path: "paceport/:routeId", element: <PaceportDetailPage /> },
      { path: "wearable", element: <WearablePage /> },
      { path: "run/setup", element: <RunSetupPage /> },
      { path: "run/result", element: <RunResultPage /> },
      { path: "wearables", element: <WearablesPage /> },
      { path: "shop", element: <ShopPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  }
]);
