import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import type { PaceCrew } from "../../types";
import { buttonStyles } from "../ui/Button";

interface PaceCrewCardProps {
  crew: PaceCrew;
  roleLabel: string;
  memberCount: number;
  missionCount: number;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
}

export const PaceCrewCard = ({ crew, roleLabel, memberCount, missionCount, action }: PaceCrewCardProps) => {
  const { t } = useAppState();

  return (
  <div className="rounded-[30px] bg-white p-5 shadow-card ring-1 ring-sage-100">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-sage-500">PaceCrew</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{crew.name}</h3>
        <p className="mt-2 text-sm leading-6 text-sage-700">{crew.description}</p>
      </div>
      <span className="rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-700">{roleLabel}</span>
    </div>

    <div className="mt-4 flex items-center gap-4 text-sm text-sage-600">
      <span className="inline-flex items-center gap-2">
        <Users className="h-4 w-4 text-sage-500" />
        {t("pacecrew.members", { count: memberCount })}
      </span>
      <span>{t("pacecrew.openMissions", { count: missionCount })}</span>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3">
      <Link to={`/pacecrew/${crew.id}`} className={buttonStyles({ fullWidth: true, variant: "secondary" })}>
        {t("pacecrew.open")}
      </Link>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className={buttonStyles({ fullWidth: true, className: action.disabled ? "" : "bg-ink hover:bg-sage-900" })}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  </div>
  );
};
