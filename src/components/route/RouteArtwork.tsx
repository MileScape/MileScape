import { ImageIcon } from "lucide-react";
import { cn } from "../../utils/cn";

interface RouteArtworkProps {
  routeId: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  className?: string;
}

const palettes: Record<
  string,
  {
    frame: string;
    glow: string;
    tint: string;
  }
> = {
  "west-lake-loop": {
    frame: "from-sage-200 via-sage-100 to-sky-100",
    glow: "from-sage-100/80 to-sky-100/20",
    tint: "from-sage-50 to-sky-50"
  },
  "central-park-loop": {
    frame: "from-blue-200 via-indigo-100 to-blue-300",
    glow: "from-blue-100/80 to-amber-50/10",
    tint: "from-blue-50 to-indigo-50"
  },
  "tokyo-city-route": {
    frame: "from-rose-200 via-violet-100 to-sky-200",
    glow: "from-rose-100/80 to-sky-100/20",
    tint: "from-rose-50 to-sky-50"
  }
};

const sizeStyles = {
  sm: {
    wrapper: "h-24 w-36",
    label: "text-[10px]",
    icon: "h-4 w-4"
  },
  md: {
    wrapper: "h-32 w-48",
    label: "text-xs",
    icon: "h-5 w-5"
  },
  lg: {
    wrapper: "h-52 w-full",
    label: "text-sm",
    icon: "h-6 w-6"
  }
};

export const RouteArtwork = ({
  routeId,
  label,
  size = "lg",
  active = false,
  className
}: RouteArtworkProps) => {
  const palette = palettes[routeId] ?? palettes["central-park-loop"];
  const sizeStyle = sizeStyles[size];

  return (
    <div className={cn("relative", sizeStyle.wrapper, className)}>
      <div
        className={cn(
          "absolute inset-0 rounded-[32px] bg-gradient-to-br blur-2xl",
          palette.glow,
          active ? "opacity-100" : "opacity-70",
        )}
      />
      <div className="absolute inset-0 rounded-[32px] border border-white/80 bg-white/75 shadow-card backdrop-blur" />
      <div className={cn("absolute inset-0 rounded-[32px] bg-gradient-to-r opacity-80", palette.frame)} />
      <div className={cn("absolute inset-[1px] rounded-[31px] bg-gradient-to-br", palette.tint)} />
      <div className="absolute inset-y-0 left-0 w-16 rounded-l-[31px] bg-gradient-to-r from-white/90 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-16 rounded-r-[31px] bg-gradient-to-l from-white/90 to-transparent" />
      <div className="absolute inset-4 rounded-[24px] border border-dashed border-sage-200/90 bg-white/45" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sage-400">
        <ImageIcon className={sizeStyle.icon} />
        <span className={cn("font-medium", sizeStyle.label)}>Artwork placeholder</span>
      </div>

      {label ? (
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <span
            className={cn(
              "rounded-full bg-white/85 px-4 py-2 font-medium text-ink shadow-sm backdrop-blur",
              sizeStyle.label,
            )}
          >
            {label}
          </span>
        </div>
      ) : null}
    </div>
  );
};
