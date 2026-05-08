import type { CSSProperties } from "react";

interface DistanceSliderProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  step?: number;
  label?: string;
  runnerImage?: string;
}

export const DistanceSlider = ({
  value,
  onChange,
  max,
  min = 0,
  step = 0.1,
  label = "Run Distance",
  runnerImage,
}: DistanceSliderProps) => {
  const selectedPercent =
    max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const trackStyle = {
    background: `linear-gradient(90deg, #4b6153 0%, #4b6153 ${selectedPercent}%, rgba(188, 205, 192, 0.9) ${selectedPercent}%, rgba(188, 205, 192, 0.9) 100%)`,
  } satisfies CSSProperties;

  return (
    <div className="mt-5">
      <div className="flex items-end justify-between gap-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-sage-500">
          {label}
        </p>
        <p className="text-[1.9rem] font-semibold tracking-[-0.04em] text-ink">
          {value.toFixed(1)} km
        </p>
      </div>

      <div className="mt-3">
        <div className="relative pt-8">
          {runnerImage ? (
            <img
              src={runnerImage}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute top-0 h-12 w-16 -translate-x-1/2 object-contain object-bottom"
              style={{
                left: `${selectedPercent}%`,
              }}
              draggable={false}
            />
          ) : null}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className={`${runnerImage ? "journey-runner-slider" : "ios-slider"} h-1.5 w-full cursor-pointer appearance-none rounded-full`}
            style={trackStyle}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-sage-400">
          <span>{min} km</span>
          <span>{max} km</span>
        </div>
      </div>
    </div>
  );
};
