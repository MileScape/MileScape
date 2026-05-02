import { ArrowLeft, Grid3X3 } from "lucide-react";

interface MyScapeHeaderControlsProps {
  arrangeActive: boolean;
  arrangeDisabled?: boolean;
  hasNewItems?: boolean;
  onBack: () => void;
  onToggleArrange: () => void;
}

const glassButtonClassName =
  "pointer-events-auto inline-flex items-center justify-center rounded-full border border-white/65 bg-white/58 text-[#314238] shadow-[0_18px_32px_rgba(49,66,56,0.12)] backdrop-blur-2xl";

export const MyScapeHeaderControls = ({
  arrangeActive,
  arrangeDisabled = false,
  hasNewItems = false,
  onBack,
  onToggleArrange,
}: MyScapeHeaderControlsProps) => (
  <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+16px)]">
    <div className="relative flex items-start justify-between gap-3">
      <button type="button" onClick={onBack} className={`${glassButtonClassName} h-12 w-12`} aria-label="Go back">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-[#56685f]/88">MILESCAPE</p>
      </div>

      <div className="relative pointer-events-auto">
        <button
          type="button"
          onClick={onToggleArrange}
          aria-disabled={arrangeDisabled}
          className={`${glassButtonClassName} min-w-[116px] gap-2 px-4 py-3 text-sm font-medium ${
            arrangeActive ? "bg-[#3f5548]/86 text-white border-white/20" : arrangeDisabled ? "opacity-55" : ""
          }`}
        >
          <Grid3X3 className="h-4 w-4" />
          {arrangeActive ? "Done" : "Arrange"}
        </button>
        {!arrangeActive && hasNewItems ? <span className="myscape-new-dot absolute right-2 top-2" /> : null}
      </div>
    </div>
  </div>
);
