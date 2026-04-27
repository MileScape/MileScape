import { Link } from "react-router-dom";
import { PaceCrewMissionCard } from "../components/pacecrew/PaceCrewMissionCard";
import { buttonStyles } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";

export const PaceCrewMissionsPage = () => {
  const { routes, state, t } = useAppState();

  const acceptedMissionStates = state.userMissionStates.filter((missionState) => missionState.status === "accepted");

  const acceptedMissionEntries = acceptedMissionStates
    .map((missionState) => {
      const mission = state.paceCrewMissions.find((entry) => entry.id === missionState.missionId);
      const crew = mission ? state.paceCrews.find((entry) => entry.id === mission.crewId) : null;

      if (!mission || !crew) {
        return null;
      }

      return { mission, missionState, crew };
    })
    .filter(Boolean) as Array<{
    mission: (typeof state.paceCrewMissions)[number];
    missionState: (typeof state.userMissionStates)[number];
    crew: (typeof state.paceCrews)[number];
  }>;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={t("app.paceCrew")}
        title={t("app.paceCrewMissions")}
      />

      {acceptedMissionEntries.length > 0 ? (
        <div className="space-y-4">
          {acceptedMissionEntries.map(({ mission, missionState, crew }) => {
            const rewardDestinationName = mission.destinationRewardId
              ? routes.find((route) => route.id === mission.destinationRewardId)?.name
              : undefined;

            return (
              <div key={mission.id} className="space-y-3">
                <div className="rounded-[22px] bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
                  <p className="text-xs uppercase tracking-[0.16em] text-sky-700">From PaceCrew</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{crew.name}</p>
                </div>
                <PaceCrewMissionCard
                  mission={mission}
                  missionState={missionState}
                  canAccept={false}
                  onAccept={() => {}}
                  destinationRewardName={rewardDestinationName}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[30px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <p className="text-sm text-sage-700">{t("pacecrew.noAcceptedMissions")}</p>
        </div>
      )}

      <Link to="/pacecrew" className={buttonStyles({ fullWidth: true, variant: "secondary" })}>
        {t("app.paceCrew")}
      </Link>
    </div>
  );
};
