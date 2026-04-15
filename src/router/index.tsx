import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { HomePage } from "../pages/HomePage";
import { PaceportDetailPage } from "../pages/PaceportDetailPage";
import { PaceportOverviewPage } from "../pages/PaceportOverviewPage";
import { RunResultPage } from "../pages/RunResultPage";
import { RunSetupPage } from "../pages/RunSetupPage";
import { ShopPage } from "../pages/ShopPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "paceport", element: <PaceportOverviewPage /> },
      { path: "paceport/:routeId", element: <PaceportDetailPage /> },
      { path: "run/setup", element: <RunSetupPage /> },
      { path: "run/result", element: <RunResultPage /> },
      { path: "shop", element: <ShopPage /> },
      { path: "dashboard", element: <DashboardPage /> }
    ]
  }
]);
