import { motion } from "framer-motion";
import type { ScapeSummaryTab } from "./ScapeBottomTabs";

interface FloatingStatsTextProps {
  distanceLabel: string;
  runsLabel: string;
  unlocksLabel: string;
  tab: ScapeSummaryTab;
}

const rows = (distanceLabel: string, runsLabel: string, unlocksLabel: string) => [
  { label: "Distance", value: distanceLabel },
  { label: "Runs", value: runsLabel },
  { label: "Unlocks", value: unlocksLabel },
];

export const FloatingStatsText = ({
  distanceLabel,
  runsLabel,
  unlocksLabel,
  tab: _tab,
}: FloatingStatsTextProps) => {
  const statRows = rows(distanceLabel, runsLabel, unlocksLabel);

  return (
    <motion.div
      className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom,0px)+186px)] right-4 z-30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-[172px] space-y-3 text-left [text-shadow:0_1px_10px_rgba(255,255,255,0.5)] sm:w-[188px]">
        {statRows.map((row, index) => (
          <motion.div
            key={row.label}
            className="grid grid-cols-[1fr_auto] items-baseline gap-x-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.28 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#819187]">{row.label}</span>
          <span className="justify-self-start font-destination-display text-[1.55rem] leading-none tracking-[-0.02em] text-[#27352d] sm:text-[1.7rem]">
            {row.value}
          </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
