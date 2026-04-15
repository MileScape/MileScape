interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export const SectionHeader = ({
  eyebrow,
  title,
  description: _description
}: SectionHeaderProps) => (
  <div className="space-y-2">
    {eyebrow ? (
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage-500">
        {eyebrow}
      </p>
    ) : null}
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
    </div>
  </div>
);
