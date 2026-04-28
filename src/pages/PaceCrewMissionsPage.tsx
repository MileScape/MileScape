import { Link } from "react-router-dom";
import { PaceCrewMissionCard } from "../components/pacecrew/PaceCrewMissionCard";
import { buttonStyles } from "../components/ui/Button";
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
      <section className="rounded-[32px] bg-[linear-gradient(145deg,rgba(255,255,255,0.76),rgba(238,244,238,0.94))] px-5 py-6 shadow-[0_20px_52px_rgba(42,56,45,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-sage-500">PACECREW</p>
        <h2 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-ink">{t("app.paceCrewMissions")}</h2>
      </section>

      {acceptedMissionEntries.length > 0 ? (
        <div className="space-y-4">
          {acceptedMissionEntries.map(({ mission, missionState, crew }) => {
            const rewardDestinationName = mission.destinationRewardId
              ? routes.find((route) => route.id === mission.destinationRewardId)?.name
              : undefined;

            return (
              <div key={mission.id} className="space-y-3">
                <div className="rounded-[24px] bg-[#edf5f8]/88 px-4 py-3 ring-1 ring-[#d8e7ee] backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700">From PaceCrew</p>
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
        <div className="rounded-[30px] bg-white/72 p-5 shadow-[0_20px_52px_rgba(42,56,45,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
          <p className="text-sm text-sage-700">{t("pacecrew.noAcceptedMissions")}</p>
        </div>
      )}

      <Link to="/pacecrew" className={buttonStyles({ fullWidth: true, variant: "secondary" })}>
        {t("app.paceCrew")}
      </Link>
    </div>
  );
};
