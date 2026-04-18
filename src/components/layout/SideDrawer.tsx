import { AnimatePresence, motion } from "framer-motion";
import { Activity, ChevronRight, ShoppingBag, Sparkles, UserCircle2, Users, Watch, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAppState } from "../../hooks/useAppState";
import { cn } from "../../utils/cn";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const SideDrawer = ({ open, onClose }: SideDrawerProps) => {
  const location = useLocation();
  const { t } = useAppState();
  const items = [
    { to: "/pacecrew", label: t("drawer.paceCrew"), icon: Users },
    { to: "/paceport", label: t("drawer.paceport"), icon: Sparkles },
    { to: "/wearable", label: t("drawer.wearable"), icon: Activity },
    { to: "/wearables", label: t("drawer.wearables"), icon: Watch },
    { to: "/shop", label: t("drawer.shop"), icon: ShoppingBag },
    { to: "/dashboard", label: t("drawer.profile"), icon: UserCircle2 }
  ];

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/18 backdrop-blur-[2px]"
            aria-label="Close menu"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed left-0 top-0 z-50 flex h-full w-[82%] max-w-[320px] flex-col rounded-r-[36px] bg-[#f7f5f0]/96 px-5 pb-6 pt-6 shadow-[0_18px_44px_rgba(17,31,22,0.16)] backdrop-blur-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-100/80 text-sm font-semibold text-sage-700">
                  M
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-sage-500">MILESCAPE</p>
                  <p className="mt-1 text-base font-semibold text-ink">Hello</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white/76 p-2 text-sage-700 ring-1 ring-sage-900/8"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              {items.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;

                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between rounded-[22px] px-3 py-3.5 text-sm transition",
                      active ? "bg-white text-ink ring-1 ring-sage-900/8" : "text-sage-700 hover:bg-white/56",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", active ? "bg-sage-100/90 text-sage-700" : "bg-sage-900/5 text-sage-600")}>
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="font-medium">{label}</span>
                    </span>
                    <ChevronRight className={cn("h-4 w-4", active ? "text-sage-500" : "text-sage-300")} />
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto border-t border-sage-900/8 pt-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">{t("drawer.menu")}</p>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
