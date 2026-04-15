import { ArrowRight, Compass, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeader } from "../components/ui/SectionHeader";
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
    <div className="space-y-6">
      <SectionHeader
        eyebrow={t("app.paceCrew")}
        title={t("pacecrew.title")}
      />

      <section className="rounded-[32px] bg-white p-5 shadow-card ring-1 ring-sage-100">
        <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("app.paceCrew")}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            to={organizedCrew ? `/pacecrew/${organizedCrew.id}` : "/pacecrew/create"}
            className="rounded-[24px] bg-sage-50 p-4 transition hover:bg-sage-100"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-sage-500">{t("pacecrew.organizing")}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-ink">{organizedCrew?.name ?? t("pacecrew.create")}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-sage-400" />
            </div>
          </Link>
          <Link to="/pacecrew/missions" className="rounded-[24px] bg-sage-50 p-4 transition hover:bg-sage-100">
            <p className="text-xs uppercase tracking-[0.16em] text-sage-500">{t("pacecrew.acceptedMissions")}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold text-ink">{acceptedMissionCount}</p>
              <ArrowRight className="h-4 w-4 text-sage-400" />
            </div>
          </Link>
        </div>
      </section>

      <div className="space-y-3">
        <Link
          to="/pacecrew/joined"
          className="flex items-center justify-between rounded-[28px] bg-white px-5 py-5 shadow-card ring-1 ring-sage-100 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-sage-50 p-3 text-sage-700">
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
          className="flex items-center justify-between rounded-[28px] bg-white px-5 py-5 shadow-card ring-1 ring-sage-100 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-sage-50 p-3 text-sage-700">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink">{t("pacecrew.discover")}</p>
              <p className="mt-1 text-sm text-sage-600">{t("pacecrew.crews", { count: discoverCount })}</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-sage-400" />
        </Link>
      </div>
    </div>
  );
};
