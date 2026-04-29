import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ItemMemoryCardProps {
  detail?: string | null;
  itemType: string;
  open: boolean;
  sourceLabel: string;
  subtitle?: string | null;
  title: string;
  unlockDateLabel?: string | null;
  onClose: () => void;
}

export const ItemMemoryCard = ({
  detail,
  itemType,
  open,
  sourceLabel,
  subtitle,
  title,
  unlockDateLabel,
  onClose,
}: ItemMemoryCardProps) => (
  <AnimatePresence>
    {open ? (
      <>
        <motion.button
          key="overlay"
          type="button"
          aria-label="Dismiss item memory"
          className="absolute inset-0 z-30 bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-[calc(env(safe-area-inset-top,0px)+108px)] z-40 w-[min(92vw,320px)] -translate-x-1/2 rounded-[30px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(247,243,237,0.58))] p-5 text-left shadow-[0_24px_48px_rgba(45,62,53,0.14)] backdrop-blur-2xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#7b8c82]">{itemType}</p>
              <h3 className="mt-2 font-destination-display text-[1.9rem] leading-[0.92] tracking-[-0.02em] text-[#26342c]">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/56 text-[#53655b] transition hover:bg-white/72"
              aria-label="Close item memory"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 space-y-3 text-sm text-[#4d5d54]">
            <p>{sourceLabel}</p>
            {unlockDateLabel ? <p>{unlockDateLabel}</p> : null}
            {detail ? <p>{detail}</p> : null}
            {subtitle ? <p className="text-[#718278]">{subtitle}</p> : null}
          </div>
        </motion.div>
      </>
    ) : null}
  </AnimatePresence>
);
