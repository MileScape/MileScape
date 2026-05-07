import { memo } from "react";

interface RunPosterCardProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  dateLabel?: string;
  topLabel?: string;
}

export const RunPosterCard = memo(({
  imageUrl,
  title,
  subtitle,
  dateLabel,
  topLabel,
}: RunPosterCardProps) => {
  return (
    <section className="relative overflow-hidden border border-white/70 bg-white shadow-[0_20px_56px_rgba(76,88,110,0.10)]">

      <div className="relative aspect-[4/5]">
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.04)_0%,rgba(17,24,39,0.22)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,248,235,0.12),transparent_36%)]" />
        <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4 text-[0.7rem] font-medium uppercase tracking-[0.26em] text-white/74">
          <span>{topLabel ?? ""}</span>
          {dateLabel ? <span className="text-right">{dateLabel}</span> : null}
        </div>
        <div className="absolute inset-x-4 bottom-4 bg-black/22 px-4 py-3 text-white backdrop-blur-sm">
          <p className="text-[0.68rem] uppercase tracking-[0.26em] text-white/62">{subtitle}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{title}</p>
        </div>
      </div>
    </section>
  );
});
