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
  <section className="grid grid-cols-4 gap-2 rounded-[24px] bg-white/76 p-2 shadow-[0_16px_38px_rgba(35,52,40,0.08)] ring-1 ring-white/85 backdrop-blur-xl">
    <button type="button" onClick={onScaleDown} disabled={!canEditSelection} className="rounded-[16px] bg-sage-50 px-3 py-3 text-sm font-medium text-sage-700 disabled:opacity-40">
      Scale -
    </button>
    <button type="button" onClick={onScaleUp} disabled={!canEditSelection} className="rounded-[16px] bg-sage-50 px-3 py-3 text-sm font-medium text-sage-700 disabled:opacity-40">
      Scale +
    </button>
    <button type="button" onClick={onRemove} disabled={!canEditSelection} className="rounded-[16px] bg-sage-50 px-3 py-3 text-sm font-medium text-sage-700 disabled:opacity-40">
      Remove
    </button>
    <button type="button" onClick={onSave} className="rounded-[16px] bg-sage-700 px-3 py-3 text-sm font-medium text-white">
      Save
    </button>
  </section>
);
