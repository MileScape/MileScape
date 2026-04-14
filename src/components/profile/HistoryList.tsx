import type { Route, RunHistoryItem } from "../../types";
import { formatDistance } from "../../utils/progress";

interface HistoryListProps {
  history: RunHistoryItem[];
  routes: Route[];
}

export const HistoryList = ({ history, routes }: HistoryListProps) => (
  <div className="space-y-3">
    {history.slice(0, 5).map((item) => {
      const route = routes.find((entry) => entry.id === item.routeId);

      return (
        <div
          key={item.id}
          className="rounded-[24px] bg-white p-4 shadow-card ring-1 ring-sage-100"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">{route?.name ?? "Unknown route"}</p>
              <p className="text-xs text-sage-500">
                {new Date(item.completedAt).toLocaleDateString()}
              </p>
            </div>
            <p className="text-sm font-semibold text-sage-700">
              {formatDistance(item.distanceKm)}
            </p>
          </div>
        </div>
      );
    })}
  </div>
);
