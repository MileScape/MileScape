import { AnimatePresence, motion } from "framer-motion";

interface NewUnlockToastProps {
  message: string | null;
}

export const NewUnlockToast = ({ message }: NewUnlockToastProps) => (
  <AnimatePresence>
    {message ? (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute right-4 top-[calc(env(safe-area-inset-top,0px)+152px)] z-40"
      >
        <div className="whitespace-nowrap rounded-full border border-white/70 bg-white/60 px-4 py-2.5 text-sm text-[#405148] shadow-[0_16px_28px_rgba(45,62,53,0.12)] backdrop-blur-2xl">
          {message}
        </div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
