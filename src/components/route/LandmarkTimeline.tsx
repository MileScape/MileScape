import { Lock, Sparkles, Star } from "lucide-react";
import type { Landmark } from "../../types";
import { cn } from "../../utils/cn";

interface LandmarkTimelineProps {
  landmarks: Landmark[];
  unlockedIds: string[];
  getLandmarkImageSrc?: (landmark: Landmark) => string | undefined;
}

export const LandmarkTimeline = ({
  landmarks,
  unlockedIds,
  getLandmarkImageSrc
}: LandmarkTimelineProps) => (
  <div className="space-y-4">
    {landmarks.map((landmark) => {
      const unlocked = unlockedIds.includes(landmark.id);
      const imageSrc = getLandmarkImageSrc?.(landmark) ?? (landmark.image || undefined);

      return (
        <div
          key={landmark.id}
          className={cn(
            "flex gap-4 rounded-[24px] p-4 ring-1",
            unlocked
              ? "bg-white shadow-card ring-sage-100"
              : "bg-sage-50/80 ring-sage-100",
          )}
        >
          <div
            className={cn(
              "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[20px]",
              imageSrc ? "bg-white" : unlocked ? "bg-gradient-to-br from-sage-100 to-sky-100" : "bg-white",
            )}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={landmark.name}
                className={cn(
                  "h-full w-full object-contain p-2",
                  unlocked ? "opacity-100" : "opacity-45 grayscale",
                )}
              />
            ) : (
              <Star className={cn("h-8 w-8", unlocked ? "text-sage-700" : "text-sage-300")} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink">{landmark.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-sage-500">
                  {unlocked ? `${landmark.milestoneKm} km milestone` : `Unlock at ${landmark.milestoneKm} km`}
                </p>
              </div>
              {unlocked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sage-500 ring-1 ring-sage-100">
                  <Lock className="h-3.5 w-3.5" />
                  Locked
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-6 text-sage-700">{landmark.description}</p>
          </div>
        </div>
      );
    })}
  </div>
);
