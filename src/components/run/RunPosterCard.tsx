interface RunPosterCardProps {
  imageUrl: string;
  title: string;
  subtitle: string;
}

export const RunPosterCard = ({
  imageUrl,
  title,
  subtitle,
}: RunPosterCardProps) => {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(76,88,110,0.10)] backdrop-blur-[24px]">
      <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015)_28%,rgba(255,255,255,0.00)_100%)]" />
      <div className="pointer-events-none absolute inset-[1px] rounded-[29px] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.008))]" />

      <div className="relative aspect-[4/5] bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.04)_0%,rgba(17,24,39,0.22)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,248,235,0.12),transparent_36%)]" />
        <div className="absolute left-4 top-4 rounded-full bg-white/18 px-4 py-2 text-[0.76rem] font-medium tracking-[0.28em] text-[#24324a] backdrop-blur-sm">
          POSTER COVER
        </div>
        <div className="absolute inset-x-4 bottom-4 rounded-[18px] bg-black/28 px-4 py-3 text-white backdrop-blur-sm">
          <p className="text-[0.68rem] uppercase tracking-[0.26em] text-white/70">{subtitle}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{title}</p>
        </div>
      </div>
    </section>
  );
};
