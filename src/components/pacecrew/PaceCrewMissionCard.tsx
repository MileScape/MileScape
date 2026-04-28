import { Clock3, Flag, LockKeyhole } from "lucide-react";
import { useAppState } from "../../hooks/useAppState";
import type { PaceCrewMission, UserMissionState } from "../../types";
import { buttonStyles } from "../ui/Button";

interface PaceCrewMissionCardProps {
  mission: PaceCrewMission;
  missionState?: UserMissionState;
  canAccept: boolean;
  onAccept: () => void;
  destinationRewardName?: string;
}

const statusLabel = {
  accepted: "Accepted",
  completed: "Completed",
  failed: "Failed"
} as const;

export const PaceCrewMissionCard = ({
  mission,
  missionState,
  canAccept,
  onAccept,
  destinationRewardName
}: PaceCrewMissionCardProps) => {
  const { t } = useAppState();

  return (
    <div className="rounded-[30px] bg-white/74 p-5 shadow-[0_20px_52px_rgba(42,56,45,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-sage-500">{t("pacecrew.mission")}</p>
          <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em] text-ink">{mission.title}</h3>
          <p className="mt-2 text-sm leading-6 text-sage-700">{mission.description}</p>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-700 ring-1 ring-sage-900/8">
          {missionState ? statusLabel[missionState.status] : mission.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[13px] text-sage-600">
        <span className="rounded-full bg-sage-50/84 px-3 py-2 ring-1 ring-sage-900/6">
          {t("pacecrew.target")}: {mission.targetDistanceKm} km
        </span>
        <span className="rounded-full bg-sage-50/84 px-3 py-2 ring-1 ring-sage-900/6">
          {t("pacecrew.deposit")}: {mission.depositStamps}
        </span>
        <span className="rounded-full bg-sage-50/84 px-3 py-2 ring-1 ring-sage-900/6">
          {t("pacecrew.reward")}: {mission.rewardStamps}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-sage-50/84 px-3 py-2 ring-1 ring-sage-900/6">
          <Clock3 className="h-3.5 w-3.5 text-sage-600" />
          {new Date(mission.deadline).toLocaleDateString()}
        </span>
      </div>

      {destinationRewardName ? (
        <div className="mt-4 rounded-[22px] bg-[#edf5f8]/88 px-4 py-3 ring-1 ring-[#d8e7ee]">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-sky-700">
            <LockKeyhole className="h-4 w-4" />
            Destination reward: {destinationRewardName}
          </p>
        </div>
      ) : null}

      <div className="mt-4">
        {missionState ? (
          <div className="rounded-[22px] bg-sage-50/84 px-4 py-3 text-sm text-sage-700 ring-1 ring-sage-900/6">
            {t("pacecrew.progress")}: {missionState.completedDistanceKm.toFixed(1)} / {mission.targetDistanceKm} km
          </div>
        ) : (
          <button
            type="button"
            onClick={onAccept}
            disabled={!canAccept}
            className={buttonStyles({
              fullWidth: true,
              className: canAccept ? "bg-ink shadow-[0_14px_30px_rgba(46,61,52,0.18)] hover:bg-sage-900" : "",
            })}
          >
            <span className="inline-flex items-center gap-2">
              <Flag className="h-4 w-4" />
              {canAccept ? t("pacecrew.acceptMission") : t("pacecrew.cannotAccept")}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
