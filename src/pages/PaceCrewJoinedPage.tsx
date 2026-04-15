import { useState } from "react";
import { PaceCrewCard } from "../components/pacecrew/PaceCrewCard";
import { SectionHeader } from "../components/ui/SectionHeader";
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
      <SectionHeader
        eyebrow={t("app.paceCrew")}
        title={t("pacecrew.joined")}
      />

      {toast ? (
        <div className="rounded-[24px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-card">{toast}</div>
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
        <div className="rounded-[30px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <p className="text-sm text-sage-700">{t("pacecrew.noJoined")}</p>
        </div>
      )}
    </div>
  );
};
