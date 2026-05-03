interface DistanceSliderProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  step?: number;
  label?: string;
}

export const DistanceSlider = ({
  value,
  onChange,
  max,
  min = 0,
  step = 0.1,
  label = "Run Distance",
}: DistanceSliderProps) => (
  <div className="mt-8">
    <div className="flex items-end justify-between gap-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-sage-500">
        {label}
      </p>
      <p className="text-[1.9rem] font-semibold tracking-[-0.04em] text-ink">
        {value.toFixed(1)} km
      </p>
    </div>

    <div className="mt-5">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="ios-slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sage-200/90"
      />
      <div className="mt-3 flex items-center justify-between text-xs text-sage-400">
        <span>{min} km</span>
        <span>{max} km</span>
      </div>
    </div>
  </div>
);
