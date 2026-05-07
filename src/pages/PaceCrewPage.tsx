import { FileText, Mic, Search, Users, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";

type PaceCrewTab = "summary" | "crew";

const tabs: Array<{ id: PaceCrewTab; label: string; icon: LucideIcon }> = [
  { id: "summary", label: "Abstract", icon: FileText },
  { id: "crew", label: "Crew", icon: Users }
];

export const PaceCrewPage = () => {
  const [activeTab, setActiveTab] = useState<PaceCrewTab>("summary");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const ActiveIcon = tabs.find((tab) => tab.id === activeTab)?.icon ?? FileText;

  useEffect(() => {
    if (!searchExpanded) {
      return;
    }

    searchInputRef.current?.focus();
  }, [searchExpanded]);

  return (
    <div className="relative -mx-4 -mt-1 min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f5f3ee] text-ink">
      <div className="pointer-events-none absolute inset-0 opacity-[0.32] [background-image:radial-gradient(circle_at_center,rgba(129,102,70,0.4)_0_1.2px,transparent_1.35px)] [background-size:15px_15px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(circle_at_center,rgba(216,154,88,0.34)_0_1px,transparent_1.2px)] [background-position:7px_7px] [background-size:15px_15px]" />

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
                className="grid h-full w-full place-items-center rounded-full text-[#3d95ff]"
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
                        ? "bg-white/42 text-[#3d95ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_12px_28px_rgba(36,50,40,0.16)]"
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
