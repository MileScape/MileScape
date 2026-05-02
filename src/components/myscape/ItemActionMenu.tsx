import { AnimatePresence, motion } from "framer-motion";

interface ItemActionMenuProps {
  open: boolean;
  onInfo: () => void;
  onMove: () => void;
}

export const ItemActionMenu = ({ open, onInfo, onMove }: ItemActionMenuProps) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+164px)] z-30 flex justify-center px-4"
      >
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 p-2 shadow-[0_18px_36px_rgba(45,62,53,0.16)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={onMove}
            className="rounded-full px-4 py-2 text-sm font-medium text-[#36463d] transition hover:bg-white/40"
          >
            Move
          </button>
          <button
            type="button"
            onClick={onInfo}
            className="rounded-full bg-[#455b4e] px-4 py-2 text-sm font-medium text-white shadow-[0_10px_18px_rgba(45,62,53,0.18)] transition hover:bg-[#3d5246]"
          >
            Info
          </button>
        </div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
