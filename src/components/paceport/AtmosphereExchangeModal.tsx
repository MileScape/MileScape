import { createPortal } from "react-dom";
import { CloudSnow, Flower2, Moon, Mountain, X } from "lucide-react";
import { atmosphereRewards } from "../../data/gachaRewards";
import { Button } from "../ui/Button";

interface AtmosphereExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprints: number;
  unlockedAtmosphereIds: string[];
  activeAtmosphereIds: string[];
  onRedeem: (atmosphereId: string, costBlueprints: number) => void;
  onSetActive: (atmosphereId: string, active: boolean) => void;
}

const iconByEffect = {
  skybox: Moon,
  particle: Flower2,
  ground: Mountain
} as const;

const effectLabel = {
  skybox: "Sky",
  particle: "Effect",
  ground: "Ground"
} as const;

export const AtmosphereExchangeModal = ({
  isOpen,
  onClose,
  blueprints,
  unlockedAtmosphereIds,
  activeAtmosphereIds,
  onRedeem,
  onSetActive
}: AtmosphereExchangeModalProps) => {
  if (!isOpen) {
    return null;
  }

  const modal = (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/64 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-auto my-8 w-full max-w-[25rem] overflow-hidden rounded-[2rem] border border-white/75 bg-[#f8f6ef] text-ink shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(210,224,213,0.8),rgba(248,246,239,0))]" />
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sage-500">Blueprint Exchange</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Atmosphere</h2>
              <p className="mt-2 text-sm leading-6 text-sage-600">{blueprints} Route Blueprints available</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-sage-700 shadow-sm ring-1 ring-sage-900/8"
              aria-label="Close atmosphere exchange"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {atmosphereRewards.map((reward) => {
              const unlocked = unlockedAtmosphereIds.includes(reward.id);
              const active = activeAtmosphereIds.includes(reward.id);
              const affordable = blueprints >= reward.costBlueprints;
              const Icon = reward.id === "snowfall-effect" ? CloudSnow : iconByEffect[reward.effectType];

              return (
                <div key={reward.id} className="rounded-[1.35rem] bg-white/72 p-4 shadow-[0_14px_30px_rgba(35,52,40,0.07)] ring-1 ring-white/85">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-sage-50 text-sage-700 ring-1 ring-sage-900/6">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{reward.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-sage-500">{effectLabel[reward.effectType]}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-sage-50 px-2.5 py-1 text-xs font-semibold text-sage-700">
                          {reward.costBlueprints} BP
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-5 text-sage-600">{reward.description}</p>
                      <Button
                        type="button"
                        fullWidth
                        variant={unlocked ? "secondary" : "primary"}
                        disabled={!unlocked && !affordable}
                        onClick={() => {
                          if (unlocked) {
                            onSetActive(reward.id, !active);
                            return;
                          }

                          onRedeem(reward.id, reward.costBlueprints);
                        }}
                        className="mt-3 h-11"
                      >
                        {unlocked ? (active ? "Active" : "Enable") : affordable ? "Redeem" : "Need More Blueprints"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
