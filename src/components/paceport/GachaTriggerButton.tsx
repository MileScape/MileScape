import { useState } from "react";
import { Sparkles } from "lucide-react";
import { RouteGachaModal } from "./RouteGachaModal";

interface GachaTriggerButtonProps {
  currentUnlockedMaps: string[];
  onMapUnlocked: (mapId: string) => void;
  onBlueprintsGained: (amount: number) => void;
  costStamps?: number;
  canDraw?: boolean;
}

export const GachaTriggerButton = ({
  currentUnlockedMaps,
  onMapUnlocked,
  onBlueprintsGained,
  costStamps = 50,
  canDraw = true
}: GachaTriggerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative isolate inline-flex min-h-[3.2rem] items-center justify-center gap-2 overflow-hidden rounded-full border border-amber-200/30 bg-slate-950/94 px-4 py-3 text-left text-white shadow-[0_16px_34px_rgba(15,23,42,0.34)] transition duration-200 hover:-translate-y-0.5 hover:border-sky-300/50 hover:shadow-[0_20px_44px_rgba(56,189,248,0.2)] focus:outline-none focus:ring-4 focus:ring-sky-300/40"
        aria-label={`Open Paceport draw modal${canDraw ? "" : ", more stamps needed to draw"}`}
      >
        <span className="absolute inset-0 bg-[linear-gradient(120deg,rgba(251,191,36,0.18),rgba(56,189,248,0.12),rgba(15,23,42,0.05))]" />
        <span className="absolute -right-6 top-0 h-14 w-14 rounded-full bg-amber-300/20 blur-2xl" />
        <span className="absolute -left-4 bottom-0 h-12 w-12 rounded-full bg-sky-300/20 blur-2xl" />
        <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
          <Sparkles className="h-4 w-4 text-amber-200" />
        </span>
        <span className="relative flex flex-col">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-sky-200/80">Draw</span>
          <span className="text-sm font-semibold leading-tight">Route Map</span>
        </span>
        <span className="relative rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-100 ring-1 ring-white/10">
          {costStamps}
        </span>
      </button>

      <RouteGachaModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentUnlockedMaps={currentUnlockedMaps}
        onMapUnlocked={onMapUnlocked}
        onBlueprintsGained={onBlueprintsGained}
        canDraw={canDraw}
        costStamps={costStamps}
      />
    </>
  );
};
