import { Check, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";

interface MyScapeToolbarProps {
  canEditSelection: boolean;
  onScaleDown: () => void;
  onScaleUp: () => void;
  onRemove: () => void;
  onSave: () => void;
}

export const MyScapeToolbar = ({
  canEditSelection,
  onScaleDown,
  onScaleUp,
  onRemove,
  onSave,
}: MyScapeToolbarProps) => (
  <div className="flex items-center justify-between gap-3 rounded-[28px] bg-white/70 px-4 py-3 shadow-[0_22px_44px_rgba(37,55,43,0.09)] ring-1 ring-white/80 backdrop-blur-xl">
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onScaleDown}
        disabled={!canEditSelection}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-50 text-sage-700 ring-1 ring-sage-900/8 transition enabled:hover:bg-sage-100 disabled:opacity-35"
        aria-label="Scale down landmark"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onScaleUp}
        disabled={!canEditSelection}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-50 text-sage-700 ring-1 ring-sage-900/8 transition enabled:hover:bg-sage-100 disabled:opacity-35"
        aria-label="Scale up landmark"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={!canEditSelection}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6efea] text-[#8b5f4a] ring-1 ring-[#d9c1b5] transition enabled:hover:bg-[#f1e6df] disabled:opacity-35"
        aria-label="Remove landmark"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>

    <Button type="button" className="gap-2 px-4 py-2.5" onClick={onSave}>
      <Check className="h-4 w-4" />
      Save Layout
    </Button>
  </div>
);
