import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { RunHistoryItem } from "../../types";
import type { MyScapeUnlockEvent } from "../../utils/myScape";

interface CalendarDayCell {
  date: Date | null;
  dateKey: string | null;
  dayNumber: number | null;
  distanceKm: number;
  runCount: number;
  unlockCount: number;
}

interface MyScapeCalendarViewProps {
  monthDate: Date;
  todayDate: Date;
  runHistory: RunHistoryItem[];
  unlockTimeline: MyScapeUnlockEvent[];
  selectedDateKey: string;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onSelectDate: (date: Date) => void;
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameMonth = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

const buildMonthCells = (
  monthDate: Date,
  runHistory: RunHistoryItem[],
  unlockTimeline: MyScapeUnlockEvent[],
): CalendarDayCell[] => {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const leadingBlankCount = monthStart.getDay();
  const cells: CalendarDayCell[] = Array.from({ length: leadingBlankCount }, () => ({
    date: null,
    dateKey: null,
    dayNumber: null,
    distanceKm: 0,
    runCount: 0,
    unlockCount: 0,
  }));

  const runsByDate = runHistory.reduce<Record<string, { distanceKm: number; runCount: number }>>((accumulator, run) => {
    const key = getDateKey(new Date(run.completedAt));
    const current = accumulator[key] ?? { distanceKm: 0, runCount: 0 };
    accumulator[key] = {
      distanceKm: current.distanceKm + run.distanceKm,
      runCount: current.runCount + 1,
    };
    return accumulator;
  }, {});
  const unlocksByDate = unlockTimeline.reduce<Record<string, number>>((accumulator, unlock) => {
    const key = getDateKey(new Date(unlock.unlockedAt));
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const dateKey = getDateKey(date);
    const runSummary = runsByDate[dateKey] ?? { distanceKm: 0, runCount: 0 };

    cells.push({
      date,
      dateKey,
      dayNumber: day,
      distanceKm: runSummary.distanceKm,
      runCount: runSummary.runCount,
      unlockCount: unlocksByDate[dateKey] ?? 0,
    });
  }

  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({
      date: null,
      dateKey: null,
      dayNumber: null,
      distanceKm: 0,
      runCount: 0,
      unlockCount: 0,
    });
  }

  return cells;
};

const formatMonthLabel = (value: Date) =>
  value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

const MiniLawn = ({ runCount, unlockCount }: { runCount: number; unlockCount: number }) => (
  <div className="relative h-full w-full">
    <svg viewBox="0 0 86 74" className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_10px_10px_rgba(75,93,74,0.13)]">
      <defs>
        <linearGradient id="calendar-lawn-top" x1="16" y1="6" x2="70" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#edf7e7" />
          <stop offset="0.5" stopColor="#cfe4c6" />
          <stop offset="1" stopColor="#a8c599" />
        </linearGradient>
        <linearGradient id="calendar-lawn-left" x1="15" y1="39" x2="43" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8fa17e" />
          <stop offset="1" stopColor="#708469" />
        </linearGradient>
        <linearGradient id="calendar-lawn-right" x1="43" y1="51" x2="76" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7f9676" />
          <stop offset="1" stopColor="#63795f" />
        </linearGradient>
      </defs>
      <path d="M43 7 78 27 43 49 8 27Z" fill="url(#calendar-lawn-top)" />
      <path d="M8 27 43 49 43 67 8 45Z" fill="url(#calendar-lawn-left)" />
      <path d="M78 27 43 49 43 67 78 45Z" fill="url(#calendar-lawn-right)" />
      <path d="M18 27 43 13 68 27 43 42Z" fill="rgba(255,255,255,0.13)" />
      <path d="M20 31 43 45 66 31" fill="none" stroke="rgba(75,104,76,0.14)" strokeWidth="1.4" />
      {unlockCount > 0 ? (
        <>
          <circle cx="43" cy="25" r="5.8" fill="#fff8d6" opacity="0.82" />
          <path d="M43 16.5 45 22.5 51.2 22.5 46.2 26.1 48.1 32 43 28.4 37.9 32 39.8 26.1 34.8 22.5 41 22.5Z" fill="#d49d55" />
        </>
      ) : null}
      {runCount > 1 ? <circle cx="31" cy="31" r="3.2" fill="rgba(92,123,84,0.38)" /> : null}
      {runCount > 2 ? <circle cx="55" cy="30" r="3.2" fill="rgba(92,123,84,0.32)" /> : null}
    </svg>
  </div>
);

export const MyScapeCalendarView = ({
  monthDate,
  todayDate,
  runHistory,
  unlockTimeline,
  selectedDateKey,
  onNextMonth,
  onPreviousMonth,
  onSelectDate,
}: MyScapeCalendarViewProps) => {
  const cells = buildMonthCells(monthDate, runHistory, unlockTimeline);
  const canGoNext = !isSameMonth(monthDate, todayDate);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-[calc(env(safe-area-inset-top,0px)+5.25rem)] pb-[calc(env(safe-area-inset-bottom,0px)+7.75rem)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8f5ee_0%,#f3f2eb_42%,#edf2e8_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(116%_76%_at_50%_0%,rgba(255,255,255,0.76)_0%,rgba(255,255,255,0.2)_48%,rgba(255,255,255,0)_74%)]" />

      <motion.div
        className="relative z-10 w-full max-w-[520px]"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/62 text-[#56685f] shadow-[0_12px_24px_rgba(45,62,53,0.1)] ring-1 ring-white/80"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-[190px] text-center">
            <p className="font-destination-display text-[2rem] leading-none text-[#59685f]">{formatMonthLabel(monthDate)}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a968e]">Mark the Lawn</p>
          </div>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={!canGoNext}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/62 text-[#56685f] shadow-[0_12px_24px_rgba(45,62,53,0.1)] ring-1 ring-white/80 disabled:opacity-35"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-[34px] bg-white/72 px-4 py-6 shadow-[0_28px_70px_rgba(45,62,53,0.14)] ring-1 ring-white/86 backdrop-blur-xl sm:px-6">
          <div className="grid grid-cols-7 gap-2 pb-3 text-center font-destination-display text-[1rem] text-[#7c837d] sm:gap-3 sm:text-[1.15rem]">
            {weekdayLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {cells.map((cell, index) => {
              const isSelected = cell.dateKey === selectedDateKey;
              const isFuture = cell.date ? cell.date.getTime() > todayDate.getTime() : false;
              const hasLawn = cell.runCount > 0 || cell.unlockCount > 0;

              return (
                <button
                  key={cell.dateKey ?? `blank-${index}`}
                  type="button"
                  disabled={!cell.date || isFuture}
                  onClick={() => {
                    if (cell.date) {
                      onSelectDate(cell.date);
                    }
                  }}
                  className={`relative aspect-[0.86] min-h-[58px] rounded-[18px] transition sm:min-h-[70px] ${
                    isSelected
                      ? "bg-[#c88f45] shadow-[0_12px_24px_rgba(172,113,42,0.22)] ring-2 ring-[#c88f45]"
                      : hasLawn
                        ? "bg-[#f0f3ec] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-[#e3e8df]"
                        : cell.date
                          ? "bg-[#eeeeea] text-[#2c2f2c] ring-1 ring-white/70"
                          : "bg-transparent"
                  } ${isFuture ? "opacity-35" : ""}`}
                >
                  {cell.date ? (
                    hasLawn ? (
                      <>
                        <span className="absolute left-1/2 top-1/2 h-[74%] w-[84%] -translate-x-1/2 -translate-y-1/2">
                          <MiniLawn runCount={cell.runCount} unlockCount={cell.unlockCount} />
                        </span>
                        <span className={`absolute bottom-1.5 right-2 text-[10px] font-bold ${isSelected ? "text-white" : "text-[#5f6f63]"}`}>
                          {cell.dayNumber}
                        </span>
                      </>
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[1.1rem] font-semibold text-[#222824] sm:text-[1.25rem]">
                        {cell.dayNumber}
                      </span>
                    )
                  ) : null}

                  {cell.runCount > 1 ? (
                    <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#d2ad76] px-1 text-xs font-bold text-white shadow-[0_6px_12px_rgba(146,104,52,0.18)] ring-2 ring-white/75">
                      {cell.runCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
