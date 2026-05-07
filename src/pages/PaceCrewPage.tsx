import { FileText, Lock, Mic, NotebookTabs, Search, Sparkles, Users, X, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RunPosterCard } from "../components/run/RunPosterCard";
import { useAppState } from "../hooks/useAppState";
import { cn } from "../utils/cn";
import { formatCountryName } from "../utils/location";
import { isRouteOwnedInPaceport } from "../utils/paceCrew";
import { formatDistance } from "../utils/progress";

type PaceCrewTab = "summary" | "crew";

const tabs: Array<{ id: PaceCrewTab; label: string; icon: LucideIcon }> = [
  { id: "summary", label: "Crew", icon: Users },
  { id: "crew", label: "Fieldbook", icon: NotebookTabs }
];

const postcardAngles = ["-rotate-[4deg]", "rotate-[2.5deg]", "-rotate-[1.5deg]", "rotate-[4deg]"];
const postcardOffsets = ["md:mt-4", "md:mt-14", "md:-mt-2", "md:mt-10"];
const rewardFrameAngles = ["-rotate-[5deg]", "rotate-[4deg]", "-rotate-[2deg]"];

const heroCopy: Record<PaceCrewTab, { kicker: string; title: string; description: string }> = {
  summary: {
    kicker: "Crew Directory",
    title: "PaceCrew",
    description:
      "Join a PaceCrew and add your runs from anywhere.Every member’s distance helps unlock shared routes, missions, and crew rewards.",
  },
  crew: {
    kicker: "Crew Running Log",
    title: "PaceCrew Fieldbook",
    description:
      "Crew-only routes are tucked away like rare postcards.Complete shared PaceCrew missions or join a crew to open them.",
  },
};

export const PaceCrewPage = () => {
  const { routes, state } = useAppState();
  const [activeTab, setActiveTab] = useState<PaceCrewTab>("crew");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [flippedRouteIds, setFlippedRouteIds] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const ActiveIcon = tabs.find((tab) => tab.id === activeTab)?.icon ?? FileText;
  const activeHeroCopy = heroCopy[activeTab];

  const crewRouteEntries = useMemo(() => {
    const crewDestinationIds = new Set(
      state.paceCrewMissions
        .map((mission) => mission.destinationRewardId)
        .filter((routeId): routeId is string => Boolean(routeId)),
    );

    return routes
      .filter((route) => route.sourceType === "pacecrew" || route.crewOnly || crewDestinationIds.has(route.id))
      .map((route, index) => {
        const mission = state.paceCrewMissions.find((entry) => entry.destinationRewardId === route.id);
        const crew =
          (mission ? state.paceCrews.find((entry) => entry.id === mission.crewId) : null) ??
          state.paceCrews[index % Math.max(1, state.paceCrews.length)];
        const unlocked = isRouteOwnedInPaceport(route.id, state);

        return {
          route,
          mission,
          crew,
          unlocked,
        };
      });
  }, [routes, state]);

  const visibleCrewRouteEntries = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    return crewRouteEntries.filter(({ route, crew, mission }) => {
      const matchesSearch =
        !normalizedQuery ||
        [route.name, route.city, route.country, crew?.name, mission?.title]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));

      return matchesSearch;
    });
  }, [crewRouteEntries, searchValue]);

  useEffect(() => {
    if (!searchExpanded) {
      return;
    }

    searchInputRef.current?.focus();
  }, [searchExpanded]);

  const toggleFlipped = (routeId: string) => {
    setFlippedRouteIds((current) =>
      current.includes(routeId) ? current.filter((entry) => entry !== routeId) : [...current, routeId],
    );
  };

  return (
    <div className="relative -mx-4 -mt-1 min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f5f3ee] pb-28 text-ink">
      <div className="pointer-events-none absolute inset-0 opacity-[0.32] [background-image:radial-gradient(circle_at_center,rgba(129,102,70,0.4)_0_1.2px,transparent_1.35px)] [background-size:15px_15px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(circle_at_center,rgba(216,154,88,0.34)_0_1px,transparent_1.2px)] [background-position:7px_7px] [background-size:15px_15px]" />
      <div className="pointer-events-none absolute left-8 top-0 h-full w-px bg-[#d7b48a]/36" />
      <div className="pointer-events-none absolute left-11 top-0 h-full w-px bg-white/70" />

      <main className="relative z-10 px-5 pt-7">
        <section className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex rotate-[-1deg] items-center gap-2 bg-[#fff9ed] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d674d] shadow-sm ring-1 ring-[#b99361]/20">
                <Sparkles className="h-3.5 w-3.5" />
                {activeHeroCopy.kicker}
              </p>
              <h1 className="mt-5 whitespace-nowrap text-[clamp(2.15rem,9vw,4.8rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-ink">
                {activeHeroCopy.title}
              </h1>
            </div>
            <p className="max-w-[34ch] font-mono text-[13px] leading-6 text-[#6c624f] [font-family:'Courier_New','Courier_Prime','American_Typewriter','Special_Elite',monospace]">
              {activeHeroCopy.description}
            </p>
          </div>
        </section>

        {activeTab === "summary" ? (
          <section className="mx-auto mt-9 grid max-w-5xl gap-4 md:grid-cols-3">
            {state.paceCrews.map((crew, index) => {
              const openMissionCount = state.paceCrewMissions.filter(
                (mission) => mission.crewId === crew.id && mission.status === "open",
              ).length;

              return (
                <Link
                  key={crew.id}
                  to={`/pacecrew/${crew.id}`}
                  className={cn(
                    "block rotate-[0.4deg] bg-white/74 p-5 shadow-[0_18px_46px_rgba(58,48,33,0.09)] ring-1 backdrop-blur transition hover:-translate-y-1",
                    index % 2 === 0 ? "-rotate-[1.2deg]" : "rotate-[1.4deg]",
                  )}
                >
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7154]">
                    Crew Note 0{index + 1}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">{crew.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-sage-700">{crew.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-[12px] font-medium text-sage-700">
                    <span className="rounded-full bg-sage-900/6 px-3 py-1.5">{crew.memberIds.length} members</span>
                    <span className="rounded-full bg-sage-900/6 px-3 py-1.5">{openMissionCount} missions</span>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <section className="mx-auto mt-9 grid max-w-5xl grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCrewRouteEntries.map(({ route, mission, crew, unlocked }, index) => {
              const isFlipped = flippedRouteIds.includes(route.id);
              const rewardItems = [
                ...route.landmarks.slice(-1).map((landmark) => ({
                  id: landmark.id,
                  name: landmark.name,
                  image: landmark.image,
                  label: "Landmark",
                })),
                ...(route.decorations ?? []).slice(0, 2).map((decoration) => ({
                  id: decoration.id,
                  name: decoration.name,
                  image: decoration.image,
                  label: decoration.rarity,
                })),
              ];

              return (
                <article
                  key={route.id}
                  className={cn("group relative mx-auto w-full max-w-[320px]", postcardOffsets[index % postcardOffsets.length])}
                >
                  <div className="pointer-events-none absolute left-1/2 top-[-14px] z-20 h-7 w-24 -translate-x-1/2 rotate-[-4deg] bg-[#e6d5ad]/70 shadow-sm mix-blend-multiply" />
                  <button
                    type="button"
                    onClick={() => toggleFlipped(route.id)}
                    className={cn(
                      "relative block w-full text-left transition duration-500 [perspective:1400px] hover:-translate-y-1",
                      postcardAngles[index % postcardAngles.length],
                    )}
                    aria-pressed={isFlipped}
                    aria-label={`Flip ${route.name} postcard`}
                  >
                    <div
                      className={cn("relative transition duration-700 [transform-style:preserve-3d]", isFlipped && "[transform:rotateY(180deg)]")}
                    >
                      <div className="relative [backface-visibility:hidden]">
                        <div className={cn(!unlocked && "grayscale opacity-55")}>
                          <RunPosterCard
                            imageUrl={route.coverImage}
                            title={route.name}
                            subtitle={`${route.city} · ${formatCountryName(route.country)}`}
                            topLabel={crew?.name ?? "PaceCrew"}
                            dateLabel={unlocked ? "Unlocked" : "Locked"}
                          />
                        </div>
                        {!unlocked ? (
                          <div className="absolute inset-0 grid place-items-center bg-[#1f2421]/18">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/84 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f554f] shadow-sm">
                              <Lock className="h-3.5 w-3.5" />
                              Locked
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <div className="absolute inset-0 flex aspect-[4/5] flex-col justify-between overflow-hidden border border-[#816646]/30 bg-[#f7f1df] p-5 shadow-[0_20px_56px_rgba(76,88,110,0.10)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <div className="pointer-events-none absolute inset-0 opacity-[0.32] [background-image:radial-gradient(circle_at_center,rgba(129,102,70,0.42)_0_1.15px,transparent_1.3px)] [background-size:15px_15px]" />
                        <div className="pointer-events-none absolute inset-[10px] border border-[#816646]/24" />
                        <div className="relative">
                          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#53685f]/78">
                            Crew Route
                          </p>
                          <h3 className="mt-3 max-w-[12ch] font-mono text-[1.55rem] font-semibold uppercase leading-[0.98] text-[#263229]/90">
                            {route.city}
                          </h3>
                        </div>

                        <div className="relative space-y-4">
                          <div className="border-y border-dashed border-[#816646]/34 py-3">
                            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#816646]/72">
                              Total Route
                            </p>
                            <p className="mt-2 font-mono text-[1.9rem] font-semibold leading-none text-[#263229]/90">
                              {formatDistance(route.totalDistanceKm)}
                            </p>
                          </div>

                          <div>
                            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#816646]/72">
                              Crew
                            </p>
                            <p className="mt-2 font-mono text-[1rem] font-semibold uppercase leading-snug text-[#263229]/86">
                              {crew?.name ?? "PaceCrew Archive"}
                            </p>
                            {mission ? (
                              <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[#53685f]/72">
                                From {mission.title}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#816646]/72">
                              Rewards
                            </p>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {rewardItems.map((reward, rewardIndex) => (
                                <div
                                  key={reward.id}
                                  className={cn(
                                    "relative aspect-square bg-white/72 p-1.5 shadow-sm ring-1 ring-[#816646]/16",
                                    rewardFrameAngles[rewardIndex % rewardFrameAngles.length],
                                    !unlocked && "grayscale",
                                  )}
                                >
                                  {reward.image ? (
                                    <img src={reward.image} alt="" className="h-full w-full object-contain" loading="lazy" />
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <nav className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-[390px] -translate-x-1/2 items-end justify-center gap-3">
        <div
          className={cn(
            "h-[66px] shrink-0 overflow-hidden rounded-full border border-white/55 bg-white/24 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_22px_54px_rgba(36,50,40,0.18)] backdrop-blur-2xl transition-all duration-500 ease-out",
            searchExpanded ? "w-[66px]" : "w-[232px]",
          )}
        >
          <div
            className={cn(
              "grid h-full transition-all duration-500 ease-out",
              searchExpanded ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            {searchExpanded ? (
              <button
                type="button"
                onClick={() => setSearchExpanded(false)}
                className="grid h-full w-full place-items-center rounded-full text-sage-700"
                aria-label="Collapse search"
              >
                <ActiveIcon className="h-7 w-7" strokeWidth={2.8} />
              </button>
            ) : (
              tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative inline-flex min-w-0 flex-col items-center justify-center gap-1 rounded-full text-[12px] font-semibold transition duration-300",
                      isActive
                        ? "bg-sage-50/62 text-sage-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_12px_28px_rgba(36,50,40,0.16)]"
                        : "text-sage-700/72 hover:bg-white/22",
                    )}
                    aria-pressed={isActive}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.8} />
                    <span className="leading-none">{tab.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div
          className={cn(
            "h-[66px] shrink-0 rounded-full border border-white/55 bg-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_22px_54px_rgba(36,50,40,0.18)] backdrop-blur-2xl transition-all duration-500 ease-out",
            searchExpanded ? "w-[calc(100%-78px)] max-w-[306px] px-4" : "w-[66px] px-0",
          )}
        >
          {searchExpanded ? (
            <label className="flex h-full items-center gap-3">
              <Search className="h-6 w-6 shrink-0 text-ink" strokeWidth={2.7} />
              <input
                ref={searchInputRef}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search"
                className="min-w-0 flex-1 border-0 bg-transparent text-[19px] font-semibold text-ink outline-none placeholder:text-sage-700/54"
              />
              {searchValue ? (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sage-700/70 transition hover:bg-white/28"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" strokeWidth={2.6} />
                </button>
              ) : (
                <Mic className="h-6 w-6 shrink-0 text-ink" strokeWidth={2.7} />
              )}
            </label>
          ) : (
            <button
              type="button"
              onClick={() => setSearchExpanded(true)}
              aria-label="Search"
              className="grid h-full w-full place-items-center rounded-full text-ink transition hover:bg-white/22"
            >
              <Search className="h-8 w-8" strokeWidth={2.7} />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};
