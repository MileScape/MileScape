import { LockKeyhole, Stamp, X } from "lucide-react";
import type { PaceCrewMission } from "../../types";
import { buttonStyles } from "../ui/Button";

interface MissionDepositDialogProps {
  mission: PaceCrewMission;
  currentStamps: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const MissionDepositDialog = ({
  mission,
  currentStamps,
  onCancel,
  onConfirm
}: MissionDepositDialogProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/34 px-4 backdrop-blur-sm">
    <div className="w-full max-w-[420px] rounded-[32px] bg-[#fbf9f4] p-5 shadow-[0_30px_80px_rgba(33,44,36,0.28)] ring-1 ring-white/80">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-sage-100 text-sage-700">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-sage-600 ring-1 ring-sage-900/8 transition hover:bg-white"
          aria-label="Close deposit confirmation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage-500">Mission Deposit</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">Accept {mission.title}?</h2>
        <p className="mt-3 text-sm leading-6 text-sage-700">
          {mission.depositStamps} Stamps will be held as a deposit. Complete the mission before the deadline to get the deposit back plus {mission.rewardStamps} reward Stamps. If it expires unfinished, the deposit is forfeited.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[22px] bg-white/82 p-4 ring-1 ring-sage-900/8">
          <p className="text-xs uppercase tracking-[0.16em] text-sage-500">Deposit</p>
          <p className="mt-2 inline-flex items-center gap-2 font-semibold text-ink">
            <Stamp className="h-4 w-4 text-sage-600" />
            {mission.depositStamps}
          </p>
        </div>
        <div className="rounded-[22px] bg-white/82 p-4 ring-1 ring-sage-900/8">
          <p className="text-xs uppercase tracking-[0.16em] text-sage-500">Balance</p>
          <p className="mt-2 font-semibold text-ink">{currentStamps} Stamps</p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onCancel} className={buttonStyles({ variant: "secondary", fullWidth: true })}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={buttonStyles({ fullWidth: true, className: "bg-ink hover:bg-sage-900" })}>
          Confirm
        </button>
      </div>
    </div>
  </div>
);
