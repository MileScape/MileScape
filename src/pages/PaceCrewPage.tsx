import { ChevronRight, Compass, Plus, Search, Sparkles, Users, X, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MissionDepositDialog } from "../components/pacecrew/MissionDepositDialog";
import { useAppState } from "../hooks/useAppState";
import type { PaceCrew, PaceCrewMission, Route } from "../types";
import {
  getAcceptedMissionState,
  getAvailableCrewsToJoin,
  getCrewMemberProfiles,
  getMissionProgress,
  isCrewMember
} from "../utils/paceCrew";
import { cn } from "../utils/cn";

type PaceCrewTab = "discover" | "my-crew" | "joined";
type SheetMode = "create-crew" | "create-mission" | null;

const tabs: Array<{ id: PaceCrewTab; label: string; icon: LucideIcon }> = [
  { id: "discover", label: "Discover", icon: Compass },
  { id: "my-crew", label: "My Crew", icon: Sparkles },
  { id: "joined", label: "Joined", icon: Users }
];

const nodePositions = [
  { x: "18%", y: "42%", size: "lg", tone: "sage" },
  { x: "67%", y: "27%", size: "md", tone: "gold" },
  { x: "72%", y: "64%", size: "sm", tone: "blush" },
  { x: "36%", y: "18%", size: "sm", tone: "sand" },
  { x: "29%", y: "70%", size: "md", tone: "sage" }
] as const;

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

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.slice(0, 1))
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getCrewSignal = ({
  crew,
  missionCount,
  isMember,
  isOrganizer
}: {
  crew: PaceCrew;
  missionCount: number;
  isMember: boolean;
  isOrganizer: boolean;
}) => {
  if (isOrganizer) {
    return "Organizing";
  }
  if (isMember) {
    return "Joined";
  }
  if (missionCount > 0) {
    return `${missionCount} missions`;
  }
  return `${crew.memberIds.length} runners`;
};

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
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-ink/18 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[84vh] max-w-md overflow-y-auto rounded-t-[30px] bg-[#fbf9f4]/96 px-5 pb-8 pt-4 shadow-[0_-18px_60px_rgba(36,50,40,0.18)] ring-1 ring-sage-900/8 backdrop-blur-2xl">
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

const CrewNode = ({
  crew,
  index,
  missionCount,
  rewardCount,
  isSelected,
  isMember,
  isOrganizer,
  onSelect
}: {
  crew: PaceCrew;
  index: number;
  missionCount: number;
  rewardCount: number;
  isSelected: boolean;
  isMember: boolean;
  isOrganizer: boolean;
  onSelect: () => void;
}) => {
  const position = nodePositions[index % nodePositions.length];
  const sizeClass =
    position.size === "lg" ? "h-[74px] w-[74px]" : position.size === "md" ? "h-[64px] w-[64px]" : "h-[54px] w-[54px]";
  const toneClass =
    position.tone === "gold"
      ? "bg-[#fff2bf] text-[#6b5a1c] ring-[#f5d980]/70"
      : position.tone === "blush"
        ? "bg-[#ffe1d8] text-[#7d4436] ring-[#f4b7a5]/60"
        : position.tone === "sand"
          ? "bg-sand text-sage-800 ring-white/80"
          : "bg-[#edf5e9] text-sage-800 ring-sage-200/80";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center"
      style={{ left: position.x, top: position.y }}
      aria-label={`Preview ${crew.name}`}
    >
      <span
        className={cn(
          "relative grid rounded-full shadow-[0_18px_38px_rgba(38,60,54,0.2)] ring-4 transition duration-300",
          sizeClass,
          toneClass,
          isSelected ? "scale-110 ring-white" : "hover:scale-105",
        )}
      >
        <span className="m-auto text-sm font-semibold tracking-[-0.02em]">{getInitials(crew.name)}</span>
        <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-[10px] font-semibold text-sage-700 ring-1 ring-sage-900/10">
          {crew.memberIds.length}
        </span>
      </span>
      <span className="max-w-[92px] rounded-full bg-white/54 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-[0_8px_20px_rgba(55,77,69,0.12)] backdrop-blur-xl">
        {crew.name}
      </span>
      <span className="sr-only">
        {missionCount} missions, {rewardCount} rewards, {getCrewSignal({ crew, missionCount, isMember, isOrganizer })}
      </span>
    </button>
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
  const [pendingMission, setPendingMission] = useState<PaceCrewMission | null>(null);

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

  const allVisibleCrews = useMemo(() => {
    const ordered = [organizedCrew, ...joinedCrews, ...discoverCrews].filter(Boolean) as PaceCrew[];
    const unique = new Map<string, PaceCrew>();
    ordered.forEach((crew) => unique.set(crew.id, crew));
    return Array.from(unique.values());
  }, [discoverCrews, joinedCrews, organizedCrew]);

  const stageCrews = activeTab === "my-crew" ? (organizedCrew ? [organizedCrew] : []) : activeTab === "joined" ? joinedCrews : allVisibleCrews;
  const selectedCrew = selectedCrewId ? state.paceCrews.find((crew) => crew.id === selectedCrewId) ?? null : null;
  const fallbackCrew = activeTab === "my-crew" ? organizedCrew : activeTab === "joined" ? joinedCrews[0] ?? null : allVisibleCrews[0] ?? null;
  const displayCrew = selectedCrew ?? fallbackCrew;

  const myCrewRewards = getRewardRoutesForCrew(organizedCrew, routes);
  const selectedCrewMissions = displayCrew
    ? state.paceCrewMissions.filter((mission) => mission.crewId === displayCrew.id)
    : [];
  const selectedCrewRewards = getRewardRoutesForCrew(displayCrew, routes);
  const selectedCrewMembers = displayCrew ? getCrewMemberProfiles(displayCrew, state) : [];
  const selectedCrewIsMember = displayCrew ? isCrewMember(state, displayCrew.id) : false;
  const selectedCrewIsOrganizer = displayCrew ? displayCrew.organizerId === currentUser.id : false;
  const openMissionCount = selectedCrewMissions.filter((mission) => mission.status === "open").length;
  const emptyTitle = activeTab === "my-crew" ? "Create your group" : activeTab === "joined" ? "No joined groups" : "Find your group";
  const bottomActionLabel = organizedCrew ? "New mission" : "Create crew";
  const bottomActionShort = organizedCrew ? "New" : "Create";

  const showToast = (message: string) => setToast(message);

  const handleJoin = (crewId: string) => {
    const result = joinPaceCrew(crewId);
    showToast(result.message);
  };

  const handleLeave = (crewId: string) => {
    const result = leavePaceCrew(crewId);
    showToast(result.message);
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

  return (
    <div className="-mx-4 -mt-1 min-h-[calc(100vh-4rem)] overflow-hidden bg-[linear-gradient(180deg,rgba(220,232,221,0.98)_0%,rgba(236,230,220,0.74)_58%,rgba(245,243,238,1)_100%)] px-4 pb-32 text-ink">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 mx-auto h-36 max-w-md bg-[linear-gradient(180deg,rgba(245,243,238,0.9)_0%,rgba(245,243,238,0.68)_42%,rgba(245,243,238,0.22)_76%,rgba(245,243,238,0)_100%)] backdrop-blur-[5px]" />

      {toast ? (
        <div className="fixed left-1/2 top-20 z-[70] w-[calc(100%-3rem)] max-w-[360px] -translate-x-1/2">
          <div className="rounded-full bg-sage-700/94 px-4 py-3 text-center text-sm font-medium text-white shadow-[0_18px_46px_rgba(40,62,50,0.24)] ring-1 ring-white/20 backdrop-blur-xl">
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

      <section className="relative -mx-4 flex min-h-[calc(100vh-11rem)] flex-col justify-center overflow-hidden px-4 pb-5 pt-10">
        <div className="absolute left-[-18%] top-[-6%] h-36 w-72 rounded-[100%] bg-white/34 blur-2xl" />
        <div className="absolute right-[-20%] bottom-[18%] h-28 w-72 rounded-[100%] bg-sage-50/54 blur-2xl" />

        <div className="relative z-10 mx-auto h-[390px] w-full max-w-[390px] overflow-hidden">
          <div className="absolute left-1/2 top-[50%] h-[238px] w-[238px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/46" />
          <div className="absolute left-1/2 top-[50%] h-[172px] w-[172px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/56" />
          <div className="absolute left-1/2 top-[50%] h-[108px] w-[108px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/68" />
          <div className="absolute left-1/2 top-[50%] grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-sage-700 text-white shadow-[0_18px_46px_rgba(64,79,71,0.26)] ring-1 ring-white/70">
            <Users className="h-7 w-7" />
          </div>

          {stageCrews.length > 0 ? (
            stageCrews.slice(0, 5).map((crew, index) => {
              const missionCount = state.paceCrewMissions.filter((mission) => mission.crewId === crew.id && mission.status === "open").length;
              const rewardCount = getRewardRoutesForCrew(crew, routes).length;
              const isMember = isCrewMember(state, crew.id);
              const isOrganizer = crew.organizerId === currentUser.id;

              return (
                <CrewNode
                  key={crew.id}
                  crew={crew}
                  index={index}
                  missionCount={missionCount}
                  rewardCount={rewardCount}
                  isSelected={displayCrew?.id === crew.id}
                  isMember={isMember}
                  isOrganizer={isOrganizer}
                  onSelect={() => setSelectedCrewId(crew.id)}
                />
              );
            })
          ) : (
            <div className="absolute inset-x-0 top-[58%] text-center">
              <button
                type="button"
                onClick={() => setSheetMode("create-crew")}
                className="rounded-full bg-white/66 px-4 py-2 text-sm font-semibold text-sage-700 shadow-[0_10px_28px_rgba(70,92,80,0.12)] ring-1 ring-white/80 backdrop-blur-xl"
              >
                Create PaceCrew
              </button>
            </div>
          )}
        </div>

        <div className="relative z-10 mx-auto -mt-1 max-w-[320px] text-center">
          <h1 className="text-[1.55rem] font-semibold tracking-[-0.045em] text-ink">
            {displayCrew?.name ?? emptyTitle}
          </h1>
          {displayCrew ? (
            <p className="mt-2 text-sm font-medium text-sage-600">
              {displayCrew.memberIds.length} members · {openMissionCount} missions
            </p>
          ) : null}
        </div>
      </section>

      <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[390px] -translate-x-1/2">
        <div className="grid grid-cols-[minmax(0,1fr)_2.65rem_2.65rem_2.65rem_3.6rem] items-center gap-1.5 rounded-[24px] bg-[#fbf9f4]/90 p-2 shadow-[0_24px_60px_rgba(45,57,47,0.18)] ring-1 ring-white/85 backdrop-blur-2xl">
          <label className="flex min-h-11 min-w-0 items-center gap-2 rounded-[18px] bg-white/74 px-3 text-sage-700 ring-1 ring-sage-900/8">
            <Search className="h-4 w-4 shrink-0 text-sage-500" />
            <input
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setActiveTab("discover");
              }}
              placeholder="Search"
              className="min-w-0 flex-1 border-0 bg-transparent text-[12px] font-semibold text-ink outline-none placeholder:text-sage-400"
            />
          </label>

          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-[18px] text-[12px] font-semibold transition",
                  isActive ? "bg-sage-700 text-white shadow-[0_10px_24px_rgba(58,78,67,0.2)]" : "text-sage-600 hover:bg-white/58",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSheetMode(organizedCrew ? "create-mission" : "create-crew")}
            aria-label={bottomActionLabel}
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded-[18px] bg-ink px-2 text-[11px] font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            {bottomActionShort}
          </button>
        </div>
      </div>

      <BottomSheet
        open={Boolean(selectedCrewId && displayCrew)}
        title={displayCrew?.name ?? ""}
        subtitle={displayCrew?.description}
        onClose={() => setSelectedCrewId(null)}
      >
        {displayCrew ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-[20px] bg-white/72 px-3 py-3 ring-1 ring-sage-900/8">
                <p className="text-[10px] uppercase tracking-[0.16em] text-sage-500">Members</p>
                <p className="mt-1 text-xl font-semibold text-ink">{displayCrew.memberIds.length}</p>
              </div>
              <div className="rounded-[20px] bg-white/72 px-3 py-3 ring-1 ring-sage-900/8">
                <p className="text-[10px] uppercase tracking-[0.16em] text-sage-500">Missions</p>
                <p className="mt-1 text-xl font-semibold text-ink">{selectedCrewMissions.length}</p>
              </div>
              <div className="rounded-[20px] bg-white/72 px-3 py-3 ring-1 ring-sage-900/8">
                <p className="text-[10px] uppercase tracking-[0.16em] text-sage-500">Rewards</p>
                <p className="mt-1 text-xl font-semibold text-ink">{selectedCrewRewards.length}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Members</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCrewMembers.map((member) => (
                  <div key={member.user.id} className="inline-flex items-center gap-2 rounded-full bg-white/74 px-3 py-2 text-sm text-sage-700 ring-1 ring-sage-900/8">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-sage-100 text-[11px] font-semibold text-sage-700">
                      {getInitials(member.user.name)}
                    </span>
                    {member.user.name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Missions</p>
              <h4 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-ink">Open and accepted</h4>

              <div className="mt-3 space-y-3">
                {selectedCrewMissions.length > 0 ? (
                  selectedCrewMissions.map((mission: PaceCrewMission) => {
                    const missionState = getAcceptedMissionState(state, mission.id);
                    const progress = getMissionProgress(mission, missionState);
                    const canAccept =
                      !missionState && selectedCrewIsMember && mission.status === "open";

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
                          <div className="mt-4">
                            <div className="h-2 rounded-full bg-sage-100">
                              <div className="h-full rounded-full bg-sage-600 transition-all" style={{ width: `${progress.progressPercent}%` }} />
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-sage-700">
                                {progress.completedDistanceKm.toFixed(1)} / {mission.targetDistanceKm} km
                              </p>
                              <Link
                                to="/run/setup"
                                className="rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sage-800"
                              >
                                Run
                              </Link>
                            </div>
                          </div>
                        ) : canAccept ? (
                          <button
                            type="button"
                            onClick={() => handleAcceptMission(mission)}
                            className="mt-4 rounded-full bg-sage-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sage-800"
                          >
                            Accept mission
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-[22px] bg-white/60 px-4 py-4 text-sm leading-6 text-sage-600 ring-1 ring-sage-900/8">
                    No missions published yet.
                  </p>
                )}
              </div>
            </div>

            {selectedCrewIsOrganizer ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Organizer</p>
                <button
                  type="button"
                  onClick={handleDissolveCrew}
                  className="mt-3 rounded-full bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 ring-1 ring-rose-100"
                >
                  Dissolve
                </button>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              {!selectedCrewIsMember ? (
                <button
                  type="button"
                  onClick={() => handleJoin(displayCrew.id)}
                  className="inline-flex items-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-900"
                >
                  Join PaceCrew
                </button>
              ) : !selectedCrewIsOrganizer ? (
                <button
                  type="button"
                  onClick={() => handleLeave(displayCrew.id)}
                  className="inline-flex items-center rounded-full bg-sage-900/5 px-5 py-3 text-sm font-semibold text-sage-700 ring-1 ring-sage-900/8 transition hover:bg-sage-900/8"
                >
                  Leave
                </button>
              ) : null}

              <Link
                to={`/pacecrew/${displayCrew.id}`}
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
        subtitle="Set up the group you will organize."
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
        subtitle="Missions appear inside your group and can be accepted by members."
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
