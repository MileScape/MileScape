import { useState } from "react";
import { Sparkles } from "lucide-react";
import { RouteGachaModal } from "./RouteGachaModal";

interface GachaTriggerButtonProps {
  currentUnlockedMaps: string[];
  currentDecorIds?: string[];
  blueprints?: number;
  unlockedAtmosphereIds?: string[];
  activeAtmosphereIds?: string[];
  onMapUnlocked: (mapId: string) => void;
  onDecorUnlocked?: (decorId: string, duplicateBlueprints: number) => void;
  onBlueprintsGained: (amount: number) => void;
  onRedeemAtmosphere?: (atmosphereId: string, costBlueprints: number) => void;
  onSetAtmosphereActive?: (atmosphereId: string, active: boolean) => void;
  costStamps?: number;
  canDraw?: boolean;
}

export const GachaTriggerButton = ({
  currentUnlockedMaps,
  currentDecorIds = [],
  blueprints = 0,
  unlockedAtmosphereIds = [],
  activeAtmosphereIds = [],
  onMapUnlocked,
  onDecorUnlocked,
  onBlueprintsGained,
  onRedeemAtmosphere,
  onSetAtmosphereActive,
  costStamps = 50,
  canDraw = true
}: GachaTriggerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative isolate inline-flex min-h-[3rem] items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-950/94 px-3.5 py-2.5 text-left text-white shadow-[0_14px_30px_rgba(24,43,29,0.16)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(24,43,29,0.18)] focus:outline-none"
        aria-label={`Open Paceport draw modal${canDraw ? "" : ", more stamps needed to draw"}`}
      >
        <span className="absolute inset-0 bg-[linear-gradient(120deg,rgba(251,191,36,0.18),rgba(56,189,248,0.12),rgba(15,23,42,0.05))]" />
        <span className="absolute -right-6 top-0 h-14 w-14 rounded-full bg-amber-300/20 blur-2xl" />
        <span className="absolute -left-4 bottom-0 h-12 w-12 rounded-full bg-sky-300/20 blur-2xl" />
        <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
          <Sparkles className="h-4 w-4 text-amber-200" />
        </span>
        <span className="relative flex flex-col">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-sky-200/80">Draw</span>
          <span className="text-sm font-semibold leading-tight">Map + Decor</span>
        </span>
        <span className="relative rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-medium text-white">
          {costStamps}
        </span>
      </button>

      <RouteGachaModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentUnlockedMaps={currentUnlockedMaps}
        currentDecorIds={currentDecorIds}
        blueprints={blueprints}
        unlockedAtmosphereIds={unlockedAtmosphereIds}
        activeAtmosphereIds={activeAtmosphereIds}
        onMapUnlocked={onMapUnlocked}
        onDecorUnlocked={onDecorUnlocked}
        onBlueprintsGained={onBlueprintsGained}
        onRedeemAtmosphere={onRedeemAtmosphere}
        onSetAtmosphereActive={onSetAtmosphereActive}
        canDraw={canDraw}
        costStamps={costStamps}
      />
    </>
  );
};
