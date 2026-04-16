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
      <section className="space-y-2 pt-1">
        <p className="text-[11px] uppercase tracking-[0.28em] text-sage-500">MILESCAPE</p>
        <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-ink">{t("pacecrew.joined")}</h2>
      </section>

      {toast ? (
        <div className="rounded-[22px] bg-sage-700 px-4 py-3 text-sm font-medium text-white">{toast}</div>
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
