interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export const StatCard = ({ label, value, hint }: StatCardProps) => (
  <div className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-sage-100">
    <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{label}</p>
    <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
  </div>
);
