import {
  ArrowLeft,
  CheckCircle2,
  Flag,
  MapPinned,
  Plus,
  Send,
  Settings2,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RunPosterCard } from "../components/run/RunPosterCard";
import { useAppState } from "../hooks/useAppState";
import { cn } from "../utils/cn";
import { formatDistance } from "../utils/progress";

export const PaceCrewManagePage = () => {
  const {
    routes,
    state,
    createPaceCrew,
    createMission,
    dissolvePaceCrew,
    publishPaceCrewMap,
    updateMission,
    users,
  } = useAppState();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [crewName, setCrewName] = useState("");
  const [crewDescription, setCrewDescription] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDescription, setMissionDescription] = useState("");
  const [missionDistance, setMissionDistance] = useState(5);
  const [missionDeposit, setMissionDeposit] = useState(10);
  const [missionReward, setMissionReward] = useState(40);
  const [selectedRewardRouteId, setSelectedRewardRouteId] = useState("");

  const organizedCrew = state.userPaceCrewState.organizedCrewId
    ? state.paceCrews.find((crew) => crew.id === state.userPaceCrewState.organizedCrewId) ?? null
    : null;
  const crewMissions = organizedCrew
    ? state.paceCrewMissions.filter((mission) => mission.crewId === organizedCrew.id)
    : [];
  const activeMissions = crewMissions.filter((mission) => mission.status === "open");
  const crewMembers = organizedCrew
    ? organizedCrew.memberIds.map((memberId) => users.find((user) => user.id === memberId) ?? { id: memberId, name: "Member" })
    : [];
  const crewRoutes = organizedCrew
    ? organizedCrew.exclusiveDestinationIds
        .map((routeId) => routes.find((route) => route.id === routeId))
        .filter((route): route is (typeof routes)[number] => Boolean(route))
    : [];

  const publishableRoutes = useMemo(
    () =>
      routes.filter(
        (route) =>
          (route.sourceType === "pacecrew" || route.crewOnly) &&
          !organizedCrew?.exclusiveDestinationIds.includes(route.id),
      ),
    [organizedCrew?.exclusiveDestinationIds, routes],
  );
  const crewPoolRoutes = useMemo(
    () => routes.filter((route) => route.sourceType === "pacecrew" || route.crewOnly),
    [routes],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const handleCreateCrew = () => {
    const result = createPaceCrew({
      name: crewName.trim() || "Pace Atelier",
      description: crewDescription.trim() || "A private crew for shared maps, field missions, and route progress.",
    });

    showToast(result.message);
    if (result.success) {
      setCrewName("");
      setCrewDescription("");
    }
  };

  const handlePublishMission = () => {
    if (!organizedCrew) {
      return;
    }

    const result = createMission(organizedCrew.id, {
      title: missionTitle.trim() || "Field Run",
      description: missionDescription.trim() || "Complete a shared run and move the crew log forward.",
      targetDistanceKm: missionDistance,
      depositStamps: missionDeposit,
      rewardStamps: missionReward,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      destinationRewardId: selectedRewardRouteId || undefined,
    });

    showToast(result.message);
    if (result.success) {
      setMissionTitle("");
      setMissionDescription("");
      setMissionDistance(5);
      setMissionDeposit(10);
      setMissionReward(40);
      setSelectedRewardRouteId("");
    }
  };

  const handleDissolveCrew = () => {
    if (!organizedCrew) {
      return;
    }

    const result = dissolvePaceCrew(organizedCrew.id);
    showToast(result.message);
    if (result.success) {
      window.setTimeout(() => navigate("/pacecrew"), 220);
    }
  };

  return (
    <div className="relative -mx-4 -mt-1 min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f5f3ee] pb-14 text-ink">
      <div className="pointer-events-none absolute inset-0 opacity-[0.32] [background-image:radial-gradient(circle_at_center,rgba(129,102,70,0.4)_0_1.2px,transparent_1.35px)] [background-size:15px_15px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(circle_at_center,rgba(216,154,88,0.34)_0_1px,transparent_1.2px)] [background-position:7px_7px] [background-size:15px_15px]" />
      <div className="pointer-events-none absolute left-8 top-0 h-full w-px bg-[#d7b48a]/36" />
      <div className="pointer-events-none absolute left-11 top-0 h-full w-px bg-white/70" />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pt-7">
        <Link
          to="/pacecrew"
          state={{ tab: "summary" }}
          className="inline-flex items-center gap-2 rounded-full bg-white/48 px-3 py-2 text-xs font-semibold text-sage-700 ring-1 ring-white/60 backdrop-blur-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Crew
        </Link>

        <section className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex rotate-[-1deg] items-center gap-2 bg-[#fff9ed] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d674d] shadow-sm ring-1 ring-[#b99361]/20">
              <Settings2 className="h-3.5 w-3.5" />
              Crew Management
            </p>
            <h1 className="mt-5 text-[clamp(2.35rem,10vw,5.2rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-ink">
              {organizedCrew ? "Manage My Crew" : "Create Crew"}
            </h1>
          </div>
          <p className="max-w-[35ch] font-mono text-[13px] leading-6 text-[#6c624f] [font-family:'Courier_New','Courier_Prime','American_Typewriter','Special_Elite',monospace]">
            Publish maps, tune route length, and keep crew tasks moving from one fieldbook desk.
          </p>
        </section>

        {toast ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-sage-50 px-3 py-1.5 text-xs font-semibold text-sage-800 ring-1 ring-sage-200">
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </div>
        ) : null}

        {!organizedCrew ? (
          <section className="mt-8 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="bg-[#fff9ed]/84 p-6 shadow-[0_22px_60px_rgba(58,48,33,0.10)] ring-1 ring-[#b99361]/22">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7154]">
                Build your own
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink">Open a private crew desk</h2>
              <p className="mt-3 text-sm leading-6 text-sage-700">
                Your crew begins as a clean logbook: members, maps, and missions can be managed after creation.
              </p>
            </div>
            <div className="space-y-3 bg-white/58 p-5 shadow-[0_18px_46px_rgba(58,48,33,0.08)] ring-1 ring-[#b99361]/18">
              <input
                value={crewName}
                onChange={(event) => setCrewName(event.target.value)}
                placeholder="Crew name"
                className="w-full border-0 bg-[#fff9ed]/78 px-4 py-3 text-sm font-semibold text-ink ring-1 ring-[#b99361]/18 outline-none focus:ring-2 focus:ring-sage-400/45"
              />
              <textarea
                value={crewDescription}
                onChange={(event) => setCrewDescription(event.target.value)}
                placeholder="Crew note"
                className="min-h-[110px] w-full border-0 bg-[#fff9ed]/78 px-4 py-3 text-sm text-ink ring-1 ring-[#b99361]/18 outline-none focus:ring-2 focus:ring-sage-400/45"
              />
              <button
                type="button"
                onClick={handleCreateCrew}
                className="inline-flex w-full items-center justify-center gap-2 bg-sage-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(62,89,70,0.22)] transition hover:bg-sage-800"
              >
                <Plus className="h-4 w-4" />
                Create Crew
              </button>
            </div>
          </section>
        ) : (
          <div className="mt-8 space-y-8">
            <section className="grid gap-4 md:grid-cols-3">
              <div className="bg-white/62 p-5 shadow-sm ring-1 ring-[#b99361]/16">
                <Users className="h-5 w-5 text-sage-700" />
                <p className="mt-3 text-2xl font-semibold text-ink">{crewMembers.length}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-sage-600">Members</p>
              </div>
              <div className="bg-white/62 p-5 shadow-sm ring-1 ring-[#b99361]/16">
                <Flag className="h-5 w-5 text-sage-700" />
                <p className="mt-3 text-2xl font-semibold text-ink">{activeMissions.length}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-sage-600">Active tasks</p>
              </div>
              <div className="bg-white/62 p-5 shadow-sm ring-1 ring-[#b99361]/16">
                <MapPinned className="h-5 w-5 text-sage-700" />
                <p className="mt-3 text-2xl font-semibold text-ink">{crewRoutes.length}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-sage-600">Published maps</p>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
              <div className="bg-[#fff9ed]/84 p-5 shadow-[0_22px_60px_rgba(58,48,33,0.10)] ring-1 ring-[#b99361]/22">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-sage-700" />
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">Publish Task</h2>
                </div>
                <div className="mt-4 space-y-3">
                  <input value={missionTitle} onChange={(event) => setMissionTitle(event.target.value)} placeholder="Task title" className="w-full border-0 bg-white/74 px-4 py-3 text-sm font-semibold text-ink ring-1 ring-[#b99361]/18 outline-none focus:ring-2 focus:ring-sage-400/45" />
                  <textarea value={missionDescription} onChange={(event) => setMissionDescription(event.target.value)} placeholder="Task note" className="min-h-[86px] w-full border-0 bg-white/74 px-4 py-3 text-sm text-ink ring-1 ring-[#b99361]/18 outline-none focus:ring-2 focus:ring-sage-400/45" />
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Route length", value: missionDistance, setValue: setMissionDistance, min: 1, max: 80, suffix: "km" },
                      { label: "Deposit", value: missionDeposit, setValue: setMissionDeposit, min: 0, max: 120, suffix: "stamps" },
                      { label: "Reward", value: missionReward, setValue: setMissionReward, min: 0, max: 200, suffix: "stamps" },
                    ].map((control) => (
                      <label key={control.label} className="block bg-white/62 p-3 ring-1 ring-[#b99361]/16">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-600">{control.label}</span>
                        <span className="mt-2 block text-xl font-semibold text-ink">
                          {control.value} <span className="text-xs font-medium text-sage-600">{control.suffix}</span>
                        </span>
                        <input
                          value={control.value}
                          onChange={(event) => control.setValue(Number(event.target.value))}
                          type="range"
                          min={control.min}
                          max={control.max}
                          step={control.label === "Route length" ? 0.5 : 1}
                          className="mt-3 w-full accent-sage-700"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-sage-600">
                    Optional map reward
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {crewPoolRoutes.slice(0, 4).map((route) => (
                      <button
                        key={route.id}
                        type="button"
                        onClick={() => setSelectedRewardRouteId((current) => (current === route.id ? "" : route.id))}
                        className={cn(
                          "flex items-center gap-3 bg-white/62 p-2 text-left ring-1 ring-[#b99361]/16 transition hover:-translate-y-0.5",
                          selectedRewardRouteId === route.id && "bg-sage-50 ring-2 ring-sage-500/34",
                        )}
                      >
                        <img src={route.coverImage} alt="" className="h-14 w-11 object-cover" loading="lazy" />
                        <span>
                          <span className="block text-sm font-semibold text-ink">{route.name}</span>
                          <span className="text-xs text-sage-600">{formatDistance(route.totalDistanceKm)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={handlePublishMission} className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-sage-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(62,89,70,0.22)] transition hover:bg-sage-800">
                  <Send className="h-4 w-4" />
                  Publish Task
                </button>
              </div>

              <div className="space-y-5">
                <section className="bg-white/64 p-5 shadow-[0_18px_46px_rgba(58,48,33,0.08)] ring-1 ring-[#b99361]/18">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">{organizedCrew.name}</h2>
                      <p className="mt-1 text-sm leading-6 text-sage-700">{organizedCrew.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDissolveCrew}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f4ebe0] text-[#8a4c38] ring-1 ring-[#c28d70]/28 transition hover:bg-[#f0ded2]"
                      aria-label="Dissolve crew"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {crewMembers.map((member) => (
                      <span key={member.id} className="rounded-full bg-sage-900/6 px-3 py-1.5 text-xs font-semibold text-sage-700">
                        {member.name}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="bg-white/64 p-5 shadow-[0_18px_46px_rgba(58,48,33,0.08)] ring-1 ring-[#b99361]/18">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-sage-700" />
                    <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">Active Tasks</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {crewMissions.length === 0 ? (
                      <p className="bg-[#fff9ed]/78 p-4 text-sm text-sage-700 ring-1 ring-[#b99361]/16">
                        No tasks yet. Publish one to start collecting crew miles.
                      </p>
                    ) : (
                      crewMissions.map((mission) => (
                        <div key={mission.id} className="bg-[#fff9ed]/78 p-4 ring-1 ring-[#b99361]/16">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-ink">{mission.title}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-sage-600">{mission.status}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const result = updateMission(mission.id, {
                                  status: mission.status === "open" ? "closed" : "open",
                                });
                                showToast(result.message);
                              }}
                              className="rounded-full bg-sage-50 px-3 py-1.5 text-xs font-semibold text-sage-800 ring-1 ring-sage-200"
                            >
                              {mission.status === "open" ? "Close" : "Reopen"}
                            </button>
                          </div>
                          <label className="mt-4 block">
                            <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-sage-600">
                              Route length
                              <span className="text-sm normal-case tracking-normal text-ink">{formatDistance(mission.targetDistanceKm)}</span>
                            </span>
                            <input
                              value={mission.targetDistanceKm}
                              onChange={(event) => updateMission(mission.id, { targetDistanceKm: Number(event.target.value) })}
                              type="range"
                              min="0.5"
                              max="80"
                              step="0.5"
                              className="mt-3 w-full accent-sage-700"
                            />
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-sage-700" />
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Publish Map</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {publishableRoutes.slice(0, 8).map((route, index) => (
                  <article key={route.id} className={cn("relative", index % 2 === 0 ? "-rotate-[0.8deg]" : "rotate-[0.9deg]")}>
                    <RunPosterCard
                      imageUrl={route.coverImage}
                      title={route.name}
                      subtitle={`${route.city} · ${formatDistance(route.totalDistanceKm)}`}
                      topLabel="Map Draft"
                      dateLabel="Ready"
                    />
                    <button
                      type="button"
                      onClick={() => showToast(publishPaceCrewMap(organizedCrew.id, route.id).message)}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-sage-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(62,89,70,0.22)] transition hover:bg-sage-800"
                    >
                      <Plus className="h-4 w-4" />
                      Publish Map
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
