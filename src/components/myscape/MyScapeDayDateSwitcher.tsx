import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MyScapeDayDateSwitcherProps {
  canGoNext: boolean;
  dateLabel: string;
  direction?: -1 | 0 | 1;
  emptyLabel?: string | null;
  onNext: () => void;
  onPrevious: () => void;
  subtitle: string;
}

export const MyScapeDayDateSwitcher = ({
  canGoNext,
  dateLabel,
  direction = 0,
  emptyLabel = null,
  onNext,
  onPrevious,
  subtitle,
}: MyScapeDayDateSwitcherProps) => (
  <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top,0px)+88px)] z-30 px-4">
    <div className="mx-auto flex max-w-[420px] flex-col items-center gap-2">
      <div className="grid w-full grid-cols-[52px_minmax(0,1fr)_52px] items-center">
        <button
          type="button"
          onClick={onPrevious}
          className="pointer-events-auto inline-flex h-11 w-[52px] items-center justify-center px-2 text-[#5f7168] opacity-75 transition hover:scale-[1.05] hover:text-[#314238] hover:opacity-100"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={dateLabel}
            initial={{
              opacity: 0,
              x: direction === 0 ? 0 : direction > 0 ? 8 : -8,
              y: 3,
            }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{
              opacity: 0,
              x: direction === 0 ? 0 : direction > 0 ? -8 : 8,
              y: -1,
            }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <p className="font-destination-display text-[1.6rem] font-bold uppercase tracking-[0.08em] text-[#2c3a33] sm:text-[1.08rem]">
              {dateLabel}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7c8b83]">{subtitle}</p>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={`pointer-events-auto inline-flex h-11 w-[52px] items-center justify-center px-2 text-[#5f7168] transition ${
            canGoNext ? "opacity-75 hover:scale-[1.05] hover:text-[#314238] hover:opacity-100" : "opacity-30"
          }`}
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {emptyLabel ? (
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a978e]">{emptyLabel}</p>
      ) : null}
    </div>
  </div>
);
