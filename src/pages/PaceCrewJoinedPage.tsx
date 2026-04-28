import { useState } from "react";
import { PaceCrewCard } from "../components/pacecrew/PaceCrewCard";
import { useAppState } from "../hooks/useAppState";

export const PaceCrewJoinedPage = () => {
  const { state, leavePaceCrew, t } = useAppState();
  const [toast, setToast] = useState<string | null>(null);

  const joinedCrews = state.paceCrews.filter(
    (crew) =>
      state.userPaceCrewState.memberships.some((membership) => membership.crewId === crew.id) &&
      crew.id !== state.userPaceCrewState.organizedCrewId,
  );

  const handleLeave = (crewId: string) => {
    const result = leavePaceCrew(crewId);
    setToast(result.message);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-[linear-gradient(145deg,rgba(255,255,255,0.76),rgba(238,244,238,0.94))] px-5 py-6 shadow-[0_20px_52px_rgba(42,56,45,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-sage-500">PACECREW</p>
        <h2 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-ink">{t("pacecrew.joined")}</h2>
        <p className="mt-4 flex flex-wrap gap-2 text-[13px] text-sage-600">
          <span className="rounded-full bg-white/80 px-3 py-2 ring-1 ring-sage-900/8">{joinedCrews.length} clubs</span>
          <span className="rounded-full bg-white/80 px-3 py-2 ring-1 ring-sage-900/8">
            {state.currentStamps} Stamps
          </span>
        </p>
      </section>

      {toast ? (
        <div className="rounded-[22px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_46px_rgba(40,62,50,0.24)] ring-1 ring-white/20">{toast}</div>
      ) : null}

      {joinedCrews.length > 0 ? (
        <div className="space-y-4">
          {joinedCrews.map((crew) => (
            <PaceCrewCard
              key={crew.id}
              crew={crew}
              roleLabel={t("pacecrew.member")}
              memberCount={crew.memberIds.length}
              missionCount={state.paceCrewMissions.filter((mission) => mission.crewId === crew.id && mission.status === "open").length}
              action={{ label: t("pacecrew.leave"), onClick: () => handleLeave(crew.id) }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] bg-white/72 p-5 ring-1 ring-sage-900/8 backdrop-blur-xl">
          <p className="text-sm text-sage-700">{t("pacecrew.noJoined")}</p>
        </div>
      )}
    </div>
  );
};
