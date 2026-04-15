import { useState } from "react";
import { PaceCrewCard } from "../components/pacecrew/PaceCrewCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { getAvailableCrewsToJoin } from "../utils/paceCrew";

export const PaceCrewDiscoverPage = () => {
  const { state, joinPaceCrew, t } = useAppState();
  const [toast, setToast] = useState<string | null>(null);
  const discoverCrews = getAvailableCrewsToJoin(state);

  const handleJoin = (crewId: string) => {
    const result = joinPaceCrew(crewId);
    setToast(result.message);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={t("app.paceCrew")}
        title={t("pacecrew.discover")}
      />

      {toast ? (
        <div className="rounded-[24px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-card">{toast}</div>
      ) : null}

      <div className="space-y-4">
        {discoverCrews.map((crew) => (
            <PaceCrewCard
              key={crew.id}
              crew={crew}
              roleLabel={t("pacecrew.available")}
              memberCount={crew.memberIds.length}
              missionCount={state.paceCrewMissions.filter((mission) => mission.crewId === crew.id && mission.status === "open").length}
              action={{ label: t("pacecrew.join"), onClick: () => handleJoin(crew.id) }}
            />
        ))}
      </div>
    </div>
  );
};
