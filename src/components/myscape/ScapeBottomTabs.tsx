type ScapeSummaryTab = "day" | "overview";

interface ScapeBottomTabsProps {
  activeTab: ScapeSummaryTab;
  onChange: (tab: ScapeSummaryTab) => void;
}

const tabs: Array<{ key: ScapeSummaryTab; label: string }> = [
  { key: "day", label: "Day" },
  { key: "overview", label: "Overview" },
];

export const ScapeBottomTabs = ({ activeTab, onChange }: ScapeBottomTabsProps) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+18px)]">
    <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/58 p-2 shadow-[0_20px_38px_rgba(45,62,53,0.14)] backdrop-blur-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
            activeTab === tab.key ? "bg-[#4b6154] text-white shadow-[0_10px_18px_rgba(45,62,53,0.18)]" : "text-[#718278]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
);

export type { ScapeSummaryTab };
