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
    <div className="rounded-[30px] bg-white/72 p-5 shadow-[0_20px_52px_rgba(42,56,45,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.26em] text-sage-500">PACECREW</p>
          <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em] text-ink">{crew.name}</h3>
          <p className="mt-2 text-sm leading-6 text-sage-700">{crew.description}</p>
        </div>
        <span className="rounded-full bg-white/78 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-sage-700 ring-1 ring-sage-900/8">
          {roleLabel}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[13px] text-sage-600">
        <span className="inline-flex items-center gap-2 rounded-full bg-sage-50/78 px-3 py-2 ring-1 ring-sage-900/6">
          <Users className="h-4 w-4 text-sage-500" />
          {t("pacecrew.members", { count: memberCount })}
        </span>
        <span className="rounded-full bg-sage-50/78 px-3 py-2 ring-1 ring-sage-900/6">
          {t("pacecrew.openMissions", { count: missionCount })}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Link
          to={`/pacecrew/${crew.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-[0_12px_28px_rgba(59,78,68,0.18)] transition hover:bg-sage-800"
        >
          {t("pacecrew.open")}
        </Link>
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="inline-flex items-center justify-center rounded-full bg-white/76 px-4 py-3 text-sm font-medium text-sage-700 ring-1 ring-sage-900/8 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {action.label}
          </button>
        ) : (
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/76 text-sage-500 ring-1 ring-sage-900/8">
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
};
