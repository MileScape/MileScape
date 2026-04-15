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
  <div className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-sage-100">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("pacecrew.mission")}</p>
        <h3 className="mt-2 text-xl font-semibold text-ink">{mission.title}</h3>
        <p className="mt-2 text-sm leading-6 text-sage-700">{mission.description}</p>
      </div>
      <span className="rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-700">
        {missionState ? statusLabel[missionState.status] : mission.status}
      </span>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
      <div className="rounded-[20px] bg-sage-50 p-3">
        <p className="text-sage-500">{t("pacecrew.target")}</p>
        <p className="mt-1 font-semibold text-ink">{mission.targetDistanceKm} km</p>
      </div>
      <div className="rounded-[20px] bg-sage-50 p-3">
        <p className="text-sage-500">{t("pacecrew.deposit")}</p>
        <p className="mt-1 font-semibold text-ink">{mission.depositStamps} Stamps</p>
      </div>
      <div className="rounded-[20px] bg-sage-50 p-3">
        <p className="text-sage-500">{t("pacecrew.reward")}</p>
        <p className="mt-1 font-semibold text-ink">{mission.rewardStamps} Stamps</p>
      </div>
      <div className="rounded-[20px] bg-sage-50 p-3">
        <p className="text-sage-500">{t("pacecrew.deadline")}</p>
        <p className="mt-1 inline-flex items-center gap-2 font-semibold text-ink">
          <Clock3 className="h-4 w-4 text-sage-600" />
          {new Date(mission.deadline).toLocaleDateString()}
        </p>
      </div>
    </div>

    {destinationRewardName ? (
      <div className="mt-4 rounded-[20px] bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-sky-700">
          <LockKeyhole className="h-4 w-4" />
          Destination reward: {destinationRewardName}
        </p>
      </div>
    ) : null}

    <div className="mt-4">
      {missionState ? (
        <div className="rounded-[20px] bg-sage-50 px-4 py-3 text-sm text-sage-700">
          {t("pacecrew.progress")}: {missionState.completedDistanceKm.toFixed(1)} / {mission.targetDistanceKm} km
        </div>
      ) : (
        <button
          type="button"
          onClick={onAccept}
          disabled={!canAccept}
          className={buttonStyles({ fullWidth: true, className: canAccept ? "bg-ink hover:bg-sage-900" : "" })}
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
