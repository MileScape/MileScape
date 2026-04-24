import { ChevronRight, Plus, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAppState } from "../hooks/useAppState";
import type { PaceCrew, PaceCrewMission, Route } from "../types";
import {
  getAcceptedMissionState,
  getAvailableCrewsToJoin,
  getCrewMemberProfiles,
  getMissionProgress,
  getUserProfile,
  isCrewMember
} from "../utils/paceCrew";
import { cn } from "../utils/cn";

type PaceCrewTab = "discover" | "my-crew" | "joined";
type SheetMode = "create-crew" | "create-mission" | null;

const tabs: Array<{ id: PaceCrewTab; label: string }> = [
  { id: "discover", label: "Discover" },
  { id: "my-crew", label: "My Crew" },
  { id: "joined", label: "Joined" }
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });

const getRewardRoutesForCrew = (crew: PaceCrew | null, routes: Route[]) => {
  if (!crew) {
    return [];
  }

  return routes.filter((route) => route.crewOnly);
};

const Section = ({
  title,
  eyebrow,
  action,
  children
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className="space-y-4 border-t border-sage-900/8 pt-6 first:border-t-0 first:pt-0">
    <div className="flex items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">{eyebrow}</p> : null}
        <h2 className="mt-1 text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Surface = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-[28px] bg-white/68 p-5 shadow-[0_22px_60px_rgba(49,60,50,0.08)] ring-1 ring-white/80 backdrop-blur-xl",
      className,
    )}
  >
    {children}
  </div>
);

const CrewListItem = ({
  crew,
  organizerName,
  missionCount,
  rewardCount,
  actionLabel,
  onAction,
  onPreview,
  muted = false
}: {
  crew: PaceCrew;
  organizerName: string;
  missionCount: number;
  rewardCount: number;
  actionLabel?: string;
  onAction?: () => void;
  onPreview: () => void;
  muted?: boolean;
}) => (
  <div className="border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0 last:pb-0">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">{crew.name}</h3>
          {muted ? (
            <span className="rounded-full bg-sage-100/80 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-sage-600">
              Joined
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-sage-700">{crew.description}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-sage-600">
          <span>{crew.memberIds.length} members</span>
          <span>{missionCount} open missions</span>
          <span>{rewardCount} rewards</span>
          <span>Hosted by {organizerName}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onPreview}
        className="rounded-full bg-white/75 px-3 py-2 text-xs font-medium text-sage-700 ring-1 ring-sage-900/8 transition hover:bg-white"
      >
        Preview
      </button>
    </div>

    {actionLabel && onAction ? (
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAction}
          className={cn(
            "inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold transition",
            muted ? "bg-sage-900/5 text-sage-700 ring-1 ring-sage-900/8 hover:bg-sage-900/8" : "bg-sage-700 text-white hover:bg-sage-800",
          )}
        >
          {actionLabel}
        </button>
      </div>
    ) : null}
  </div>
);

const BottomSheet = ({
  open,
  title,
  subtitle,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-ink/18 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[32px] bg-[#fbf9f4]/96 px-5 pb-8 pt-4 shadow-[0_-18px_60px_rgba(36,50,40,0.18)] ring-1 ring-sage-900/8 backdrop-blur-2xl">
        <div className="mx-auto h-1.5 w-14 rounded-full bg-sage-200" />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">PaceCrew</p>
            <h3 className="mt-1 text-[1.45rem] font-semibold tracking-[-0.03em] text-ink">{title}</h3>
            {subtitle ? <p className="mt-2 text-sm leading-6 text-sage-600">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/80 p-2 text-sage-700 ring-1 ring-sage-900/8"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};

export const PaceCrewPage = () => {
  const {
    currentUser,
    routes,
    state,
    createMission,
    createPaceCrew,
    dissolvePaceCrew,
    joinPaceCrew,
    leavePaceCrew,
    acceptMission
  } = useAppState();
  const [activeTab, setActiveTab] = useState<PaceCrewTab>("discover");
  const [searchValue, setSearchValue] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewDescription, setNewCrewDescription] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDescription, setMissionDescription] = useState("");
  const [missionDistance, setMissionDistance] = useState("3");
  const [missionDeposit, setMissionDeposit] = useState("15");
  const [missionReward, setMissionReward] = useState("45");
  const [missionDeadline, setMissionDeadline] = useState("");
  const [missionDestinationId, setMissionDestinationId] = useState("");

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const organizedCrew = state.userPaceCrewState.organizedCrewId
    ? state.paceCrews.find((crew) => crew.id === state.userPaceCrewState.organizedCrewId) ?? null
    : null;

  const selectedCrew = selectedCrewId
    ? state.paceCrews.find((crew) => crew.id === selectedCrewId) ?? null
    : null;

  const joinedCrews = useMemo(
    () =>
      state.paceCrews.filter(
        (crew) =>
          state.userPaceCrewState.memberships.some((membership) => membership.crewId === crew.id) &&
          crew.id !== state.userPaceCrewState.organizedCrewId,
      ),
    [state.paceCrews, state.userPaceCrewState.memberships, state.userPaceCrewState.organizedCrewId],
  );

  const discoverCrews = useMemo(() => {
    const availableCrews = getAvailableCrewsToJoin(state);
    const normalizedSearch = searchValue.trim().toLowerCase();

    return availableCrews
      .filter((crew) =>
        !normalizedSearch
          || crew.name.toLowerCase().includes(normalizedSearch)
          || crew.description.toLowerCase().includes(normalizedSearch),
      )
      .sort((left, right) => {
        const leftScore =
          left.memberIds.length + state.paceCrewMissions.filter((mission) => mission.crewId === left.id && mission.status === "open").length * 2;
        const rightScore =
          right.memberIds.length + state.paceCrewMissions.filter((mission) => mission.crewId === right.id && mission.status === "open").length * 2;
        return rightScore - leftScore;
      });
  }, [searchValue, state]);

  const recommendedCrews = discoverCrews.slice(0, 2);
  const exploreCrews = discoverCrews.slice(2);
  const myCrewMissions = organizedCrew
    ? state.paceCrewMissions.filter((mission) => mission.crewId === organizedCrew.id)
    : [];
  const myCrewRewards = getRewardRoutesForCrew(organizedCrew, routes);
  const myCrewMembers = organizedCrew ? getCrewMemberProfiles(organizedCrew, state) : [];

  const joinedMissionEntries = useMemo(
    () =>
      joinedCrews.flatMap((crew) =>
        state.paceCrewMissions
          .filter((mission) => mission.crewId === crew.id)
          .map((mission) => ({
            crew,
            mission,
            missionState: getAcceptedMissionState(state, mission.id)
          })),
      ),
    [joinedCrews, state],
  );

  const acceptedJoinedMissions = joinedMissionEntries.filter((entry) => entry.missionState?.status === "accepted");

  const showToast = (message: string) => setToast(message);

  const handleJoin = (crewId: string) => {
    const result = joinPaceCrew(crewId);
    showToast(result.message);
  };

  const handleLeave = (crewId: string) => {
    const result = leavePaceCrew(crewId);
    showToast(result.message);
  };

  const handleAcceptMission = (missionId: string) => {
    const result = acceptMission(missionId);
    showToast(result.message);
  };

  const handleCreateCrew = () => {
    const result = createPaceCrew({
      name: newCrewName.trim(),
      description: newCrewDescription.trim()
    });

    showToast(result.message);

    if (result.success) {
      setNewCrewName("");
      setNewCrewDescription("");
      setSheetMode(null);
      setActiveTab("my-crew");
    }
  };

  const handleCreateMission = () => {
    if (!organizedCrew) {
      return;
    }

    const result = createMission(organizedCrew.id, {
      title: missionTitle.trim(),
      description: missionDescription.trim(),
      targetDistanceKm: Number(missionDistance),
      depositStamps: Number(missionDeposit),
      rewardStamps: Number(missionReward),
      deadline: new Date(missionDeadline || Date.now()).toISOString(),
      destinationRewardId: missionDestinationId || undefined
    });

    showToast(result.message);

    if (result.success) {
      setMissionTitle("");
      setMissionDescription("");
      setMissionDistance("3");
      setMissionDeposit("15");
      setMissionReward("45");
      setMissionDeadline("");
      setMissionDestinationId("");
      setSheetMode(null);
    }
  };

  const handleDissolveCrew = () => {
    if (!organizedCrew) {
      return;
    }

    const result = dissolvePaceCrew(organizedCrew.id);
    showToast(result.message);

    if (result.success) {
      setSheetMode(null);
      setActiveTab("my-crew");
    }
  };

  const renderDiscoverTab = () => (
    <div className="space-y-6">
      <Surface className="bg-[linear-gradient(140deg,rgba(255,255,255,0.76),rgba(240,245,238,0.92))]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Discover</p>
        <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink">Find a PaceCrew that matches your rhythm.</h2>
        <label className="mt-5 flex items-center gap-3 rounded-full bg-white/78 px-4 py-3 ring-1 ring-sage-900/8">
          <Search className="h-4 w-4 text-sage-500" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search crews"
            className="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-sage-400"
          />
        </label>
      </Surface>

      <Section title="Recommended for you" eyebrow="Curated">
        <Surface>
          {recommendedCrews.length > 0 ? (
            recommendedCrews.map((crew) => (
              <CrewListItem
                key={crew.id}
                crew={crew}
                organizerName={getUserProfile(crew.organizerId).name}
                missionCount={state.paceCrewMissions.filter((mission) => mission.crewId === crew.id && mission.status === "open").length}
                rewardCount={getRewardRoutesForCrew(crew, routes).length}
                actionLabel="Join"
                onAction={() => handleJoin(crew.id)}
                onPreview={() => setSelectedCrewId(crew.id)}
              />
            ))
          ) : (
            <p className="text-sm leading-6 text-sage-600">You’ve already joined every available PaceCrew.</p>
          )}
        </Surface>
      </Section>

      <Section title="Explore crews" eyebrow="Browse">
        <Surface>
          {exploreCrews.length > 0 ? (
            exploreCrews.map((crew) => (
              <CrewListItem
                key={crew.id}
                crew={crew}
                organizerName={getUserProfile(crew.organizerId).name}
                missionCount={state.paceCrewMissions.filter((mission) => mission.crewId === crew.id && mission.status === "open").length}
                rewardCount={getRewardRoutesForCrew(crew, routes).length}
                actionLabel="Join"
                onAction={() => handleJoin(crew.id)}
                onPreview={() => setSelectedCrewId(crew.id)}
              />
            ))
          ) : (
            <p className="text-sm leading-6 text-sage-600">No additional crews match your search right now.</p>
          )}
        </Surface>
      </Section>
    </div>
  );

  const renderMyCrewTab = () => (
    <div className="space-y-6">
      {!organizedCrew ? (
        <Surface className="flex min-h-[62vh] flex-col justify-between bg-[linear-gradient(160deg,rgba(255,255,255,0.82),rgba(232,241,232,0.96))] px-6 py-7">
          <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">My Crew</p>

          <div className="space-y-3 py-6">
            <p className="text-[0.95rem] font-medium uppercase tracking-[0.34em] text-sage-500">
              CREATE ONE
            </p>
            <h2 className="text-[3.9rem] font-semibold uppercase leading-[0.88] tracking-[-0.08em] text-ink">
              PACECREW
            </h2>
            <p className="max-w-[12ch] text-[1.5rem] font-medium leading-[1.02] tracking-[-0.04em] text-sage-700">
              you&apos;ll organize
            </p>
          </div>

          <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSheetMode("create-crew")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-900"
          >
            <Plus className="h-4 w-4" />
            Create PaceCrew
          </button>
          </div>
        </Surface>
      ) : (
        <>
          <Surface className="space-y-5 bg-[linear-gradient(150deg,rgba(255,255,255,0.78),rgba(234,242,233,0.94))]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Organizer View</p>
                <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink">{organizedCrew.name}</h2>
                <p className="mt-3 text-sm leading-6 text-sage-600">{organizedCrew.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => setSheetMode("create-mission")}
                  className="rounded-full bg-white/80 px-4 py-2.5 text-sm font-semibold text-sage-700 ring-1 ring-sage-900/8 transition hover:bg-white"
                >
                  New mission
                </button>
                <button
                  type="button"
                  onClick={handleDissolveCrew}
                  className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100"
                >
                  Dissolve
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[22px] bg-white/75 px-3 py-4 ring-1 ring-sage-900/8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">Members</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{organizedCrew.memberIds.length}</p>
              </div>
              <div className="rounded-[22px] bg-white/75 px-3 py-4 ring-1 ring-sage-900/8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">Missions</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{myCrewMissions.length}</p>
              </div>
              <div className="rounded-[22px] bg-white/75 px-3 py-4 ring-1 ring-sage-900/8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">Rewards</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{myCrewRewards.length}</p>
              </div>
            </div>
          </Surface>

          <Section title="Member preview" eyebrow="People">
            <Surface className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {myCrewMembers.map((member) => (
                  <div key={member.user.id} className="min-w-[92px] flex-1 rounded-[22px] bg-sage-50/90 px-3 py-4 ring-1 ring-sage-900/6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-200 text-sm font-semibold text-sage-800">
                      {member.user.name.slice(0, 1)}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-ink">{member.user.name}</p>
                    <p className="mt-1 text-xs text-sage-500">{member.user.id === organizedCrew.organizerId ? "Organizer" : "Member"}</p>
                  </div>
                ))}
              </div>
            </Surface>
          </Section>

          <Section
            title="Active missions"
            eyebrow="Progress"
            action={
              <button
                type="button"
                onClick={() => setSheetMode("create-mission")}
                className="text-sm font-medium text-sage-700"
              >
                Create
              </button>
            }
          >
            <Surface>
              {myCrewMissions.length > 0 ? (
                myCrewMissions.map((mission) => (
                  <div key={mission.id} className="border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-ink">{mission.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-sage-600">{mission.description}</p>
                      </div>
                      <span className="rounded-full bg-sage-100/85 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-sage-700">
                        {mission.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-sage-600">
                      <span>{mission.targetDistanceKm} km target</span>
                      <span>{mission.rewardStamps} Stamps reward</span>
                      <span>Due {formatDate(mission.deadline)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-sage-600">No missions yet. Publish the first one from the organizer sheet.</p>
              )}
            </Surface>
          </Section>

          <Section title="Crew-only rewards" eyebrow="Paceport">
            <Surface>
              {myCrewRewards.length > 0 ? (
                myCrewRewards.map((route) => (
                  <div key={route.id} className="border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-ink">{route.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-sage-600">{route.description}</p>
                      </div>
                      <span className="rounded-full bg-[#eef3ea] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-sage-700">
                        Paceport
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-sage-600">No exclusive destinations yet. Mission rewards will appear here as your crew grows.</p>
              )}
            </Surface>
          </Section>
        </>
      )}
    </div>
  );

  const renderJoinedTab = () => (
    <div className="space-y-6">
      <Surface className="bg-[linear-gradient(145deg,rgba(255,255,255,0.76),rgba(239,244,238,0.93))]">
        <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Joined</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-sage-600">
          <span className="rounded-full bg-white/78 px-3 py-2 ring-1 ring-sage-900/8">{joinedCrews.length} crews joined</span>
          <span className="rounded-full bg-white/78 px-3 py-2 ring-1 ring-sage-900/8">{acceptedJoinedMissions.length} active missions</span>
          <span className="rounded-full bg-white/78 px-3 py-2 ring-1 ring-sage-900/8">{state.currentStamps} Stamps available</span>
        </div>
      </Surface>

      <Section title="Active accepted missions" eyebrow="In Progress">
        <Surface>
          {acceptedJoinedMissions.length > 0 ? (
            acceptedJoinedMissions.map(({ crew, mission, missionState }) => {
              const progress = getMissionProgress(mission, missionState);

              return (
                <div key={mission.id} className="border-t border-sage-900/8 py-4 first:border-t-0 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-sage-500">{crew.name}</p>
                      <h3 className="mt-1 text-base font-semibold text-ink">{mission.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-sage-600">{mission.description}</p>
                    </div>
                    <Link to="/run/setup" className="rounded-full bg-sage-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sage-800">
                      Run
                    </Link>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 rounded-full bg-sage-100">
                      <div className="h-full rounded-full bg-sage-600 transition-all" style={{ width: `${progress.progressPercent}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[13px] text-sage-600">
                      <span>{progress.completedDistanceKm.toFixed(1)} km logged</span>
                      <span>{progress.remainingDistanceKm.toFixed(1)} km left</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm leading-6 text-sage-600">No accepted crew missions yet. Join one from Discover or accept a mission from a joined crew preview.</p>
          )}
        </Surface>
      </Section>

      <Section title="Joined PaceCrews" eyebrow="Memberships">
        <Surface>
          {joinedCrews.length > 0 ? (
            joinedCrews.map((crew) => (
              <CrewListItem
                key={crew.id}
                crew={crew}
                organizerName={getUserProfile(crew.organizerId).name}
                missionCount={state.paceCrewMissions.filter((mission) => mission.crewId === crew.id && mission.status === "open").length}
                rewardCount={getRewardRoutesForCrew(crew, routes).length}
                actionLabel="Leave"
                onAction={() => handleLeave(crew.id)}
                onPreview={() => setSelectedCrewId(crew.id)}
                muted
              />
            ))
          ) : (
            <p className="text-sm leading-6 text-sage-600">You have not joined any additional PaceCrews yet.</p>
          )}
        </Surface>
      </Section>
    </div>
  );

  const selectedCrewMissions = selectedCrew
    ? state.paceCrewMissions.filter((mission) => mission.crewId === selectedCrew.id)
    : [];
  const selectedCrewRewards = getRewardRoutesForCrew(selectedCrew, routes);
  const selectedCrewMembers = selectedCrew ? getCrewMemberProfiles(selectedCrew, state) : [];
  const selectedCrewIsMember = selectedCrew ? isCrewMember(state, selectedCrew.id) : false;
  const selectedCrewIsOrganizer = selectedCrew ? selectedCrew.organizerId === currentUser.id : false;

  return (
    <div className="pb-32">
      {toast ? (
        <div className="sticky top-2 z-30 mb-4 rounded-[22px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-[0_14px_36px_rgba(40,62,50,0.18)]">
          {toast}
        </div>
      ) : null}

      <section className="space-y-3 pt-2">
        <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">PACECREW</p>
        <h1 className="text-[2rem] font-semibold tracking-[-0.06em] text-ink">
          Run together, unlock together
        </h1>
      </section>

      <div className="mt-8">
        {activeTab === "discover" ? renderDiscoverTab() : null}
        {activeTab === "my-crew" ? renderMyCrewTab() : null}
        {activeTab === "joined" ? renderJoinedTab() : null}
      </div>

      <div className="fixed bottom-5 left-1/2 z-30 w-[calc(100%-2rem)] max-w-[390px] -translate-x-1/2">
        <div className="grid grid-cols-3 rounded-full bg-[#fbf9f4]/92 p-1.5 shadow-[0_24px_60px_rgba(45,57,47,0.18)] ring-1 ring-white/85 backdrop-blur-2xl">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-4 py-3 text-sm transition",
                  isActive ? "bg-sage-700 text-white shadow-[0_10px_24px_rgba(58,78,67,0.22)]" : "text-sage-600 hover:text-ink",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <BottomSheet
        open={Boolean(selectedCrew)}
        title={selectedCrew?.name ?? ""}
        subtitle={selectedCrew?.description}
        onClose={() => setSelectedCrewId(null)}
      >
        {selectedCrew ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2 text-sm text-sage-600">
              <span className="rounded-full bg-white/80 px-3 py-2 ring-1 ring-sage-900/8">{selectedCrew.memberIds.length} members</span>
              <span className="rounded-full bg-white/80 px-3 py-2 ring-1 ring-sage-900/8">{selectedCrewMissions.length} missions</span>
              <span className="rounded-full bg-white/80 px-3 py-2 ring-1 ring-sage-900/8">{selectedCrewRewards.length} rewards</span>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Members</p>
              <div className="flex flex-wrap gap-2">
                {selectedCrewMembers.map((member) => (
                  <div key={member.user.id} className="rounded-full bg-white/80 px-3 py-2 text-sm text-sage-700 ring-1 ring-sage-900/8">
                    {member.user.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Open missions</p>
              <div className="space-y-3">
                {selectedCrewMissions.length > 0 ? (
                  selectedCrewMissions.map((mission: PaceCrewMission) => {
                    const missionState = getAcceptedMissionState(state, mission.id);
                    const canAccept =
                      !missionState && selectedCrewIsMember && state.currentStamps >= mission.depositStamps && mission.status === "open";

                    return (
                      <div key={mission.id} className="rounded-[24px] bg-white/72 p-4 ring-1 ring-sage-900/8">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-base font-semibold text-ink">{mission.title}</h4>
                            <p className="mt-2 text-sm leading-6 text-sage-600">{mission.description}</p>
                          </div>
                          <span className="rounded-full bg-sage-100 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-sage-700">
                            {mission.targetDistanceKm} km
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-sage-600">
                          <span>{mission.depositStamps} Stamps deposit</span>
                          <span>{mission.rewardStamps} reward</span>
                          <span>Due {formatDate(mission.deadline)}</span>
                        </div>
                        {missionState ? (
                          <p className="mt-3 text-sm font-medium text-sage-700">
                            Accepted: {missionState.completedDistanceKm.toFixed(1)} / {mission.targetDistanceKm} km
                          </p>
                        ) : canAccept ? (
                          <button
                            type="button"
                            onClick={() => handleAcceptMission(mission.id)}
                            className="mt-4 rounded-full bg-sage-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sage-800"
                          >
                            Accept mission
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm leading-6 text-sage-600">No missions published yet.</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!selectedCrewIsMember ? (
                <button
                  type="button"
                  onClick={() => handleJoin(selectedCrew.id)}
                  className="inline-flex items-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-900"
                >
                  Join PaceCrew
                </button>
              ) : !selectedCrewIsOrganizer ? (
                <button
                  type="button"
                  onClick={() => handleLeave(selectedCrew.id)}
                  className="inline-flex items-center rounded-full bg-sage-900/5 px-5 py-3 text-sm font-semibold text-sage-700 ring-1 ring-sage-900/8 transition hover:bg-sage-900/8"
                >
                  Leave
                </button>
              ) : null}

              <Link
                to={`/pacecrew/${selectedCrew.id}`}
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-sage-700"
              >
                Full details
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet
        open={sheetMode === "create-crew"}
        title="Create a PaceCrew"
        subtitle="Because you can organize only one PaceCrew, this should feel like a crew home rather than a disposable group."
        onClose={() => setSheetMode(null)}
      >
        <div className="space-y-3">
          <input
            value={newCrewName}
            onChange={(event) => setNewCrewName(event.target.value)}
            placeholder="PaceCrew name"
            className="w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 outline-none placeholder:text-sage-400 focus:ring-2 focus:ring-sage-300"
          />
          <textarea
            value={newCrewDescription}
            onChange={(event) => setNewCrewDescription(event.target.value)}
            placeholder="Describe the pace, tone, or type of runners this crew welcomes."
            className="min-h-[120px] w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 outline-none placeholder:text-sage-400 focus:ring-2 focus:ring-sage-300"
          />
          <button
            type="button"
            onClick={handleCreateCrew}
            disabled={!newCrewName.trim() || !newCrewDescription.trim()}
            className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create PaceCrew
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={sheetMode === "create-mission"}
        title="Publish a mission"
        subtitle="Keep the organizer flow light: missions start here, then appear directly in your crew home."
        onClose={() => setSheetMode(null)}
      >
        <div className="space-y-3">
          <input
            value={missionTitle}
            onChange={(event) => setMissionTitle(event.target.value)}
            placeholder="Mission title"
            className="w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 outline-none placeholder:text-sage-400 focus:ring-2 focus:ring-sage-300"
          />
          <textarea
            value={missionDescription}
            onChange={(event) => setMissionDescription(event.target.value)}
            placeholder="Short mission description"
            className="min-h-[110px] w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 outline-none placeholder:text-sage-400 focus:ring-2 focus:ring-sage-300"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={missionDistance}
              onChange={(event) => setMissionDistance(event.target.value)}
              type="number"
              min="0.5"
              step="0.1"
              placeholder="Target km"
              className="w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 outline-none focus:ring-2 focus:ring-sage-300"
            />
            <input
              value={missionDeadline}
              onChange={(event) => setMissionDeadline(event.target.value)}
              type="date"
              className="w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 outline-none focus:ring-2 focus:ring-sage-300"
            />
            <input
              value={missionDeposit}
              onChange={(event) => setMissionDeposit(event.target.value)}
              type="number"
              min="0"
              placeholder="Deposit"
              className="w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 outline-none focus:ring-2 focus:ring-sage-300"
            />
            <input
              value={missionReward}
              onChange={(event) => setMissionReward(event.target.value)}
              type="number"
              min="0"
              placeholder="Reward"
              className="w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>
          <select
            value={missionDestinationId}
            onChange={(event) => setMissionDestinationId(event.target.value)}
            className="w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 outline-none focus:ring-2 focus:ring-sage-300"
          >
            <option value="">No destination reward</option>
            {myCrewRewards.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCreateMission}
            disabled={!organizedCrew || !missionTitle.trim() || !missionDescription.trim()}
            className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Publish mission
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
