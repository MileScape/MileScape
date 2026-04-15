import { Coins } from "lucide-react";
import { useAppState } from "../../hooks/useAppState";

interface StampBalanceCardProps {
  currentStamps: number;
  totalStampsEarned: number;
}

export const StampBalanceCard = ({
  currentStamps,
  totalStampsEarned
}: StampBalanceCardProps) => {
  const { t } = useAppState();

  return (
  <section className="rounded-[32px] bg-white p-5 shadow-card ring-1 ring-sage-100">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-sage-500">{t("shop.stampBalance")}</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{currentStamps}</p>
        <p className="mt-2 text-sm text-sage-600">{t("shop.earned", { count: totalStampsEarned })}</p>
      </div>
      <div className="rounded-full bg-sage-50 p-3 text-sage-700">
        <Coins className="h-5 w-5" />
      </div>
    </div>
  </section>
  );
};
