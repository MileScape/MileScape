import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { MissionDepositDialog } from "../components/pacecrew/MissionDepositDialog";
import { PaceCrewMemberList } from "../components/pacecrew/PaceCrewMemberList";
import { PaceCrewMissionCard } from "../components/pacecrew/PaceCrewMissionCard";
import { PaceCrewMissionForm } from "../components/pacecrew/PaceCrewMissionForm";
import { buttonStyles } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";
import type { PaceCrewMission } from "../types";
import { getCrewMemberProfiles, isCrewMember, isCrewOrganizer } from "../utils/paceCrew";

export const PaceCrewDetailPage = () => {
  const { crewId } = useParams();
  const { routes, state, acceptMission, createMission, dissolvePaceCrew, joinPaceCrew, leavePaceCrew, removePaceCrewMember, users, t } = useAppState();
  const [toast, setToast] = useState<string | null>(null);
  const [pendingMission, setPendingMission] = useState<PaceCrewMission | null>(null);
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
    () => routes.filter((route) => route.crewOnly),
    [routes],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleAcceptMission = (mission: PaceCrewMission) => {
    if (state.currentStamps < mission.depositStamps) {
      showToast(`Mission acceptance failed: ${mission.depositStamps} Stamps deposit required, ${state.currentStamps} available.`);
      return;
    }

    setPendingMission(mission);
  };

  const confirmAcceptMission = () => {
    if (!pendingMission) {
      return;
    }

    const result = acceptMission(pendingMission.id);
    setPendingMission(null);
    showToast(result.message);
  };

  const openMissionCount = missions.filter((mission) => mission.status === "open").length;
  const featuredMission = missions.find((mission) => mission.status === "open") ?? missions[0] ?? null;

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="fixed left-1/2 top-4 z-[70] w-[calc(100%-2rem)] max-w-[430px] -translate-x-1/2">
          <div className="rounded-[22px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_46px_rgba(40,62,50,0.24)] ring-1 ring-white/20">
            {toast}
          </div>
        </div>
      ) : null}

      {pendingMission ? (
        <MissionDepositDialog
          mission={pendingMission}
          currentStamps={state.currentStamps}
          onCancel={() => setPendingMission(null)}
          onConfirm={confirmAcceptMission}
        />
      ) : null}

      <section className="rounded-[34px] bg-[linear-gradient(150deg,rgba(255,255,255,0.8),rgba(232,241,232,0.96))] p-6 shadow-[0_22px_56px_rgba(44,58,46,0.1)] ring-1 ring-white/80 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">PACECREW</p>
        <h1 className="mt-2 text-[2.2rem] font-semibold tracking-[-0.06em] text-ink">{crew.name}</h1>
        <p className="mt-3 max-w-[32ch] text-sm leading-6 text-sage-700">{crew.description}</p>

        <div className="mt-5 flex flex-wrap gap-2 text-[13px] text-sage-600">
          <span className="rounded-full bg-white/78 px-3 py-2 ring-1 ring-sage-900/8">
            {organizer?.name ?? "Organizer"}
          </span>
          <span className="rounded-full bg-white/78 px-3 py-2 ring-1 ring-sage-900/8">
            {crew.memberIds.length} members
          </span>
          <span className="rounded-full bg-white/78 px-3 py-2 ring-1 ring-sage-900/8">
            {openMissionCount} open missions
          </span>
          <span className="rounded-full bg-white/78 px-3 py-2 ring-1 ring-sage-900/8">
            {rewardDestinations.length} rewards
          </span>
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

      {featuredMission ? (
        <section className="space-y-4">
          <SectionHeader eyebrow="Featured" title="Current mission" />
          <PaceCrewMissionCard
            mission={featuredMission}
            missionState={state.userMissionStates.find((entry) => entry.missionId === featuredMission.id)}
            canAccept={isMember && !state.userMissionStates.some((entry) => entry.missionId === featuredMission.id) && featuredMission.status === "open"}
            onAccept={() => handleAcceptMission(featuredMission)}
            destinationRewardName={
              featuredMission.destinationRewardId
                ? routes.find((route) => route.id === featuredMission.destinationRewardId)?.name
                : undefined
            }
          />
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionHeader eyebrow="People" title={t("pacecrew.memberList")} />
        <PaceCrewMemberList members={memberProfiles} canManage={canManage} onRemove={(memberId) => showToast(removePaceCrewMember(crew.id, memberId).message)} />
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow="All missions" title={t("pacecrew.missions")} />
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
                canAccept={isMember && !missionState && mission.status === "open"}
                onAccept={() => handleAcceptMission(mission)}
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
        <SectionHeader eyebrow="Paceport" title={t("pacecrew.rewards")} />
        <div className="space-y-3">
          {rewardDestinations.map((route) => (
            <div key={route.id} className="rounded-[28px] bg-white/72 p-4 shadow-[0_20px_52px_rgba(42,56,45,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{route.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-sage-600">{route.description}</p>
                </div>
                <span className="rounded-full bg-[#edf5f8]/88 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700 ring-1 ring-[#d8e7ee]">
                  PaceCrew Only
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {canManage ? (
        <div className="flex justify-end">
          <Link to="/pacecrew" className="inline-flex items-center gap-2 text-sm font-medium text-sage-700">
            Back to PaceCrew
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
};
