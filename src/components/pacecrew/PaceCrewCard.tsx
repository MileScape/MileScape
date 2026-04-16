import { ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import type { PaceCrew } from "../../types";

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
    <div className="rounded-[28px] bg-white/78 p-4 ring-1 ring-sage-900/8 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">PACECREW</p>
          <h3 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.02em] text-ink">{crew.name}</h3>
          <p className="mt-2 text-sm leading-6 text-sage-700">{crew.description}</p>
        </div>
        <span className="rounded-full bg-sage-100/80 px-2.5 py-1 text-[11px] font-medium text-sage-700">
          {roleLabel}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-sage-600">
        <span className="inline-flex items-center gap-2">
          <Users className="h-4 w-4 text-sage-500" />
          {t("pacecrew.members", { count: memberCount })}
        </span>
        <span>{t("pacecrew.openMissions", { count: missionCount })}</span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Link
          to={`/pacecrew/${crew.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-sage-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-sage-800"
        >
          {t("pacecrew.open")}
        </Link>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="inline-flex items-center justify-center rounded-full bg-sage-900/6 px-4 py-3 text-sm font-medium text-sage-700 ring-1 ring-sage-900/8 transition hover:bg-sage-900/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {action.label}
          </button>
        ) : (
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sage-900/4 text-sage-500">
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
};
