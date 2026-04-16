import { ArrowRight, Compass, Plus, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppState } from "../hooks/useAppState";

export const PaceCrewPage = () => {
  const { state, t } = useAppState();

  const organizedCrew = state.userPaceCrewState.organizedCrewId
    ? state.paceCrews.find((crew) => crew.id === state.userPaceCrewState.organizedCrewId)
    : null;

  const joinedCount = state.userPaceCrewState.memberships.filter(
    (membership) => membership.crewId !== state.userPaceCrewState.organizedCrewId,
  ).length;
  const discoverCount = state.paceCrews.filter(
    (crew) => !state.userPaceCrewState.memberships.some((membership) => membership.crewId === crew.id),
  ).length;
  const acceptedMissionCount = state.userMissionStates.filter((missionState) => missionState.status === "accepted").length;

  return (
    <div className="space-y-8">
      <section className="space-y-2 pt-1">
        <p className="text-[11px] uppercase tracking-[0.28em] text-sage-500">MILESCAPE</p>
        <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-ink">{t("app.paceCrew")}</h2>
        <p className="text-sm text-sage-600">{t("pacecrew.title")}</p>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to={organizedCrew ? `/pacecrew/${organizedCrew.id}` : "/pacecrew/create"}
            className="rounded-[28px] bg-white/72 p-4 ring-1 ring-sage-900/8 backdrop-blur-xl transition hover:bg-white/84"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100/80 text-sage-700">
              <Plus className="h-4 w-4" />
            </div>
            <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-sage-500">{t("pacecrew.organizing")}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-base font-semibold tracking-[-0.02em] text-ink">{organizedCrew?.name ?? t("pacecrew.create")}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-sage-400" />
            </div>
          </Link>
          <Link to="/pacecrew/missions" className="rounded-[28px] bg-white/72 p-4 ring-1 ring-sage-900/8 backdrop-blur-xl transition hover:bg-white/84">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100/80 text-sage-700">
              <Target className="h-4 w-4" />
            </div>
            <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-sage-500">{t("pacecrew.acceptedMissions")}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-[1.75rem] font-semibold tracking-[-0.04em] text-ink">{acceptedMissionCount}</p>
              <ArrowRight className="h-4 w-4 text-sage-400" />
            </div>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Your Crew Hub</p>
        <Link
          to="/pacecrew/joined"
          className="flex items-center justify-between rounded-[24px] bg-white/72 px-4 py-4 ring-1 ring-sage-900/8 backdrop-blur-xl transition hover:bg-white/84"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-sage-100/80 p-3 text-sage-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink">{t("pacecrew.joined")}</p>
              <p className="mt-1 text-sm text-sage-600">{t("pacecrew.crews", { count: joinedCount })}</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-sage-400" />
        </Link>

        <Link
          to="/pacecrew/discover"
          className="flex items-center justify-between rounded-[24px] bg-white/72 px-4 py-4 ring-1 ring-sage-900/8 backdrop-blur-xl transition hover:bg-white/84"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-sage-100/80 p-3 text-sage-700">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink">{t("pacecrew.discover")}</p>
              <p className="mt-1 text-sm text-sage-600">{t("pacecrew.crews", { count: discoverCount })}</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-sage-400" />
        </Link>
      </section>
    </div>
  );
};
