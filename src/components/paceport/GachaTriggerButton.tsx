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
  disabled?: boolean;
  costStamps?: number;
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
  disabled = false,
  costStamps = 50,
}: GachaTriggerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className="group relative isolate h-[8.75rem] w-[7.25rem] overflow-visible rounded-[1.9rem] text-left text-white transition duration-300 hover:-translate-y-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Open Paceport draw modal${disabled ? ", more stamps needed to draw" : ""}`}
      >
        <span className="absolute -bottom-2 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-sage-950/18 blur-md transition group-hover:bg-sage-950/24" />
        <span className="absolute left-1/2 top-0 h-[4.85rem] w-[5.75rem] -translate-x-1/2 overflow-hidden rounded-t-[3rem] rounded-b-[1.35rem] border border-white/65 bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.95),rgba(255,255,255,0.22)_42%,rgba(120,190,183,0.34)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_28px_rgba(25,55,62,0.16)] backdrop-blur-xl">
          <span className="absolute left-3 top-5 h-4 w-4 rounded-full bg-[#ffcf5a] shadow-[18px_12px_0_#f16f5b,34px_1px_0_#7bc8b8,8px_29px_0_#ffffff,40px_31px_0_#f5a65f]" />
          <span className="absolute left-5 top-2 h-8 w-3 rotate-45 rounded-full bg-white/60 blur-[1px]" />
        </span>
        <span className="absolute bottom-0 left-1/2 flex h-[5.6rem] w-full -translate-x-1/2 flex-col items-center rounded-[1.65rem] border border-[#943f32]/20 bg-[linear-gradient(180deg,#f27561_0%,#c94c3f_58%,#96362f_100%)] px-3 pb-3 pt-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_18px_34px_rgba(91,45,36,0.2)]">
          <span className="absolute -top-3 h-5 w-16 rounded-full border border-white/50 bg-[#fff4d0] shadow-[0_6px_12px_rgba(82,49,33,0.12)]" />
          <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#753228] bg-[#ffe6a4] shadow-[inset_0_2px_0_rgba(255,255,255,0.6)] transition group-hover:rotate-45">
            <span className="h-1.5 w-4 rounded-full bg-[#753228]" />
          </span>
          <span className="absolute bottom-2 h-4 w-14 rounded-b-2xl rounded-t-md bg-[#5f2724] shadow-[inset_0_2px_4px_rgba(0,0,0,0.22)]" />
          <span className="relative flex w-full flex-col">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/16">
              <Sparkles className="h-3.5 w-3.5 text-amber-100" />
            </span>
            <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/72">Gacha</span>
            <span className="text-base font-semibold leading-none">Draw</span>
            <span className="mt-1 text-[10px] font-medium text-white/72">{costStamps} stamps</span>
          </span>
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
        canDraw={!disabled}
        costStamps={costStamps}
      />
    </>
  );
};
