import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { AchievementsPage } from "../pages/AchievementsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ExplorePage } from "../pages/ExplorePage";
import { HomePage } from "../pages/HomePage";
import { RouteDetailPage } from "../pages/RouteDetailPage";
import { RunResultPage } from "../pages/RunResultPage";
import { RunSetupPage } from "../pages/RunSetupPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "routes/:routeId", element: <RouteDetailPage /> },
      { path: "run/setup", element: <RunSetupPage /> },
      { path: "run/result", element: <RunResultPage /> },
      { path: "achievements", element: <AchievementsPage /> },
      { path: "dashboard", element: <DashboardPage /> }
    ]
  }
]);
