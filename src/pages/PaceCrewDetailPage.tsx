import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PaceCrewMemberList } from "../components/pacecrew/PaceCrewMemberList";
import { PaceCrewMissionCard } from "../components/pacecrew/PaceCrewMissionCard";
import { PaceCrewMissionForm } from "../components/pacecrew/PaceCrewMissionForm";
import { buttonStyles } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import { getCrewMemberProfiles, isCrewMember, isCrewOrganizer } from "../utils/paceCrew";

export const PaceCrewDetailPage = () => {
  const { crewId } = useParams();
  const { routes, state, acceptMission, createMission, dissolvePaceCrew, joinPaceCrew, leavePaceCrew, removePaceCrewMember, users, t } = useAppState();
  const [toast, setToast] = useState<string | null>(null);
  const crew = state.paceCrews.find((entry) => entry.id === crewId);

  if (!crew) {
    return <Navigate to="/pacecrew" replace />;
  }

  const organizer = users.find((user) => user.id === crew.organizerId);
  const canManage = isCrewOrganizer(state, crew.id);
  const isMember = isCrewMember(state, crew.id);
  const missions = state.paceCrewMissions.filter((mission) => mission.crewId === crew.id);
  const memberProfiles = getCrewMemberProfiles(crew, state).map((entry) => ({
    id: entry.user.id,
    name: entry.user.name,
    role: entry.user.id === crew.organizerId ? "organizer" as const : "member" as const,
    joinedAt: entry.membership?.joinedAt,
    activeMissionCount: entry.activeMissionCount
  }));

  const rewardDestinations = useMemo(
    () => routes.filter((route) => route.sourceCrewId === crew.id),
    [crew.id, routes],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="space-y-6">
      {toast ? <div className="rounded-[24px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-card">{toast}</div> : null}

      <section className="rounded-[36px] bg-white p-6 shadow-card ring-1 ring-sage-100">
        <p className="text-xs uppercase tracking-[0.22em] text-sage-500">PaceCrew</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{crew.name}</h1>
        <p className="mt-3 text-sm text-sage-700">{crew.description}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-[24px] bg-sage-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-sage-500">{t("pacecrew.organizer")}</p>
            <p className="mt-2 font-semibold text-ink">{organizer?.name ?? "Organizer"}</p>
          </div>
          <div className="rounded-[24px] bg-sage-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-sage-500">{t("pacecrew.membersLabel")}</p>
            <p className="mt-2 font-semibold text-ink">{crew.memberIds.length}</p>
          </div>
          <div className="rounded-[24px] bg-sage-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-sage-500">{t("pacecrew.openMissionsLabel")}</p>
            <p className="mt-2 font-semibold text-ink">{missions.filter((mission) => mission.status === "open").length}</p>
          </div>
          <div className="rounded-[24px] bg-sage-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-sage-500">{t("pacecrew.rewards")}</p>
            <p className="mt-2 font-semibold text-ink">{rewardDestinations.length}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {!isMember ? (
            <button type="button" onClick={() => showToast(joinPaceCrew(crew.id).message)} className={buttonStyles()}>
              {t("pacecrew.join")}
            </button>
          ) : !canManage ? (
            <button type="button" onClick={() => showToast(leavePaceCrew(crew.id).message)} className={buttonStyles({ variant: "secondary" })}>
              {t("pacecrew.leave")}
            </button>
          ) : (
            <div className="rounded-full bg-sage-50 px-4 py-3 text-sm font-medium text-sage-700">
              {t("pacecrew.organizersCannotLeave")}
            </div>
          )}
          <Link to="/run/setup" className={buttonStyles({ variant: "secondary" })}>
            {t("pacecrew.openRunSetup")}
          </Link>
          {canManage ? (
            <button
              type="button"
              onClick={() => showToast(dissolvePaceCrew(crew.id).message)}
              className={buttonStyles({ variant: "secondary", className: "text-rose-600 ring-rose-100 hover:bg-rose-50" })}
            >
              {t("pacecrew.dissolve")}
            </button>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow={t("pacecrew.memberList")} title={t("pacecrew.memberList")} />
        <PaceCrewMemberList members={memberProfiles} canManage={canManage} onRemove={(memberId) => showToast(removePaceCrewMember(crew.id, memberId).message)} />
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow={t("pacecrew.missions")} title={t("pacecrew.missions")} />
        <div className="space-y-4">
          {missions.map((mission) => {
            const missionState = state.userMissionStates.find((entry) => entry.missionId === mission.id);
            const rewardDestinationName = mission.destinationRewardId
              ? routes.find((route) => route.id === mission.destinationRewardId)?.name
              : undefined;

            return (
              <PaceCrewMissionCard
                key={mission.id}
                mission={mission}
                missionState={missionState}
                canAccept={isMember && !missionState && mission.status === "open" && state.currentStamps >= mission.depositStamps}
                onAccept={() => showToast(acceptMission(mission.id).message)}
                destinationRewardName={rewardDestinationName}
              />
            );
          })}
        </div>
      </section>

      {canManage ? (
        <PaceCrewMissionForm
          destinations={rewardDestinations}
          onSubmit={(input) => showToast(createMission(crew.id, input).message)}
        />
      ) : null}

      <section className="space-y-4">
        <SectionHeader eyebrow={t("pacecrew.rewards")} title={t("pacecrew.rewards")} />
        <div className="space-y-3">
          {rewardDestinations.map((route) => (
            <div key={route.id} className="rounded-[24px] bg-white p-4 shadow-card ring-1 ring-sage-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{route.name}</h3>
                </div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                  PaceCrew Only
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
