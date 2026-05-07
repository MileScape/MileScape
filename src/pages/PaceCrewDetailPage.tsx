import { ChevronRight, Flag, MapPinned, NotebookTabs, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { MissionDepositDialog } from "../components/pacecrew/MissionDepositDialog";
import { PaceCrewMissionCard } from "../components/pacecrew/PaceCrewMissionCard";
import { RunPosterCard } from "../components/run/RunPosterCard";
import { buttonStyles } from "../components/ui/Button";
import { useAppState } from "../hooks/useAppState";
import type { PaceCrewMission } from "../types";
import { formatCountryName } from "../utils/location";
import { isCrewMember, isCrewOrganizer } from "../utils/paceCrew";
import { formatDistance } from "../utils/progress";

export const PaceCrewDetailPage = () => {
  const { crewId } = useParams();
  const { routes, state, acceptMission, dissolvePaceCrew, joinPaceCrew, leavePaceCrew, users, t } = useAppState();
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

  const crewRewardDestinationIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...crew.exclusiveDestinationIds,
          ...missions.map((mission) => mission.destinationRewardId).filter((routeId): routeId is string => Boolean(routeId)),
        ]),
      ),
    [crew.exclusiveDestinationIds, missions],
  );
  const crewRewardDestinations = useMemo(
    () => crewRewardDestinationIds.map((routeId) => routes.find((route) => route.id === routeId)).filter(Boolean) as typeof routes,
    [crewRewardDestinationIds, routes],
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
  const featuredRewardRoute = featuredMission?.destinationRewardId
    ? routes.find((route) => route.id === featuredMission.destinationRewardId)
    : crewRewardDestinations[0] ?? null;
  const joinedDateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(crew.createdAt));

  return (
    <div className="relative -mx-4 -mt-1 min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f5f3ee] pb-10 text-ink">
      <div className="pointer-events-none absolute inset-0 opacity-[0.32] [background-image:radial-gradient(circle_at_center,rgba(129,102,70,0.4)_0_1.2px,transparent_1.35px)] [background-size:15px_15px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(circle_at_center,rgba(216,154,88,0.34)_0_1px,transparent_1.2px)] [background-position:7px_7px] [background-size:15px_15px]" />
      <div className="pointer-events-none absolute left-8 top-0 h-full w-px bg-[#d7b48a]/36" />
      <div className="pointer-events-none absolute left-11 top-0 h-full w-px bg-white/70" />

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

      <main className="relative z-10 px-5 pt-6">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <div>
            <Link to="/pacecrew" className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d674d]">
              PaceCrew Archive
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>

            <div className="mt-6 rotate-[-0.4deg] bg-[#fffaf0]/80 p-6 shadow-[0_24px_60px_rgba(58,48,33,0.10)] ring-1 ring-[#b99361]/18 backdrop-blur">
              <p className="inline-flex rotate-[-1deg] items-center gap-2 bg-[#fff2d6] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d674d] shadow-sm ring-1 ring-[#b99361]/20">
                <NotebookTabs className="h-3.5 w-3.5" />
                Crew Field Note
              </p>
              <h1 className="mt-5 max-w-[11ch] text-[3.1rem] font-semibold leading-[0.88] tracking-[-0.06em] text-ink md:text-[5rem]">
                {crew.name}
              </h1>
              <p className="mt-5 max-w-[48ch] font-mono text-[13px] leading-6 text-[#6c624f]">
                {crew.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: "Organizer", value: organizer?.name ?? "Organizer", icon: Sparkles },
                  { label: "Members", value: crew.memberIds.length, icon: Users },
                  { label: "Missions", value: openMissionCount, icon: Flag },
                  { label: "Reward Map", value: crewRewardDestinations.length, icon: MapPinned },
                ].map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div key={stat.label} className="bg-white/66 p-3 shadow-sm ring-1 ring-[#816646]/12">
                      <Icon className="h-4 w-4 text-[#8a7154]" />
                      <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a7154]">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-lg font-semibold tracking-[-0.04em] text-ink">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {!isMember ? (
                  <button type="button" onClick={() => showToast(joinPaceCrew(crew.id).message)} className={buttonStyles()}>
                    {t("pacecrew.join")}
                  </button>
                ) : !canManage ? (
                  <button type="button" onClick={() => showToast(leavePaceCrew(crew.id).message)} className={buttonStyles({ variant: "secondary" })}>
                    {t("pacecrew.leave")}
                  </button>
                ) : (
                  <div className="rounded-full bg-white/72 px-4 py-3 text-sm font-medium text-sage-700 ring-1 ring-[#816646]/12">
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
            </div>
          </div>

          {featuredRewardRoute ? (
            <aside className="relative mx-auto w-full max-w-[330px] lg:mt-14">
              <p className="mb-4 inline-flex rotate-[-1deg] items-center gap-2 bg-[#edf4ee]/88 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-700 shadow-sm ring-1 ring-sage-200/70 backdrop-blur">
                <MapPinned className="h-3.5 w-3.5" />
                Unique Map Reward
              </p>
              <h2 className="mb-5 text-2xl font-semibold tracking-[-0.05em] text-ink">This crew unlocks</h2>
              <div className="pointer-events-none absolute left-1/2 top-[-14px] z-20 h-7 w-24 -translate-x-1/2 rotate-[-4deg] bg-[#e6d5ad]/70 shadow-sm mix-blend-multiply" />
              <Link
                to={`/paceport/${featuredRewardRoute.id}`}
                state={{ returnTo: `/pacecrew/${crew.id}`, returnLabel: crew.name }}
                className="block transition hover:-translate-y-1"
                aria-label={`Open ${featuredRewardRoute.name} Paceport detail`}
              >
              <div className="rotate-[3deg]">
                <RunPosterCard
                  imageUrl={featuredRewardRoute.coverImage}
                  title={featuredRewardRoute.name}
                  subtitle={`${featuredRewardRoute.city} · ${formatCountryName(featuredRewardRoute.country)}`}
                  topLabel="Featured Reward"
                  dateLabel={joinedDateLabel}
                />
              </div>
              <div className="mt-5 rotate-[-1.5deg] bg-[#f7f1df] p-4 shadow-[0_18px_46px_rgba(58,48,33,0.09)] ring-1 ring-[#816646]/18">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#816646]/72">
                  Route Length
                </p>
                <p className="mt-2 font-mono text-3xl font-semibold text-[#263229]/90">
                  {formatDistance(featuredRewardRoute.totalDistanceKm)}
                </p>
                <p className="mt-3 text-sm leading-6 text-sage-700">
                  {featuredMission ? `Complete ${featuredMission.title} to unlock this map.` : "Crew-only destination reward."}
                </p>
              </div>
              </Link>
            </aside>
          ) : null}
        </section>

        {featuredMission ? (
          <section className="mx-auto mt-10 max-w-6xl">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7154]">
                  Featured
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-ink">Current mission</h2>
              </div>
            </div>
            <div className="rotate-[-0.6deg]">
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
            </div>
          </section>
        ) : null}

      </main>
    </div>
  );
};
