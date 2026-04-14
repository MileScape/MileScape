import { cn } from "../../utils/cn";

const options = [1, 2, 3, 5];

interface DistancePickerProps {
  selectedDistance: number;
  customDistance: string;
  onSelectDistance: (distance: number) => void;
  onCustomDistanceChange: (value: string) => void;
}

export const DistancePicker = ({
  selectedDistance,
  customDistance,
  onSelectDistance,
  onCustomDistanceChange
}: DistancePickerProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelectDistance(option)}
          className={cn(
            "rounded-[24px] border px-4 py-4 text-left transition",
            selectedDistance === option
              ? "border-sage-700 bg-sage-700 text-white shadow-card"
              : "border-sage-100 bg-white text-ink hover:border-sage-300",
          )}
        >
          <p className="text-xs uppercase tracking-[0.2em] opacity-70">Quick pick</p>
          <p className="mt-2 text-2xl font-semibold">{option} km</p>
        </button>
      ))}
    </div>

    <label className="block rounded-[24px] bg-white p-4 shadow-card ring-1 ring-sage-100">
      <span className="text-xs uppercase tracking-[0.2em] text-sage-500">Custom distance</span>
      <input
        type="number"
        min="0.5"
        step="0.5"
        value={customDistance}
        onChange={(event) => onCustomDistanceChange(event.target.value)}
        placeholder="Enter distance in km"
        className="mt-3 w-full border-none bg-transparent text-2xl font-semibold text-ink outline-none placeholder:text-sage-300"
      />
    </label>
  </div>
);
