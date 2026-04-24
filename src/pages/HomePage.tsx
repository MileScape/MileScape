import { Navigate } from "react-router-dom";

export const HomePage = () => (
  <Navigate to="/run/setup" replace state={{ showWelcomeIntro: true }} />
);
