import { AnimatePresence, motion } from "framer-motion";
import { Compass, Medal, Route, ShoppingBag, UserCircle2, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

const items = [
  { to: "/run/setup", label: "Start Run", icon: Route },
  { to: "/explore", label: "Destinations", icon: Compass },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/achievements", label: "Collection", icon: Medal },
  { to: "/dashboard", label: "Profile", icon: UserCircle2 }
];

export const SideDrawer = ({ open, onClose }: SideDrawerProps) => {
  const location = useLocation();

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
            className="fixed left-0 top-0 z-50 flex h-full w-[82%] max-w-[320px] flex-col rounded-r-[36px] bg-white px-5 pb-6 pt-6 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-sage-500">MileScape</p>
                <p className="mt-1 text-2xl font-semibold text-ink">Menu</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-sage-50 p-2 text-sage-700"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {items.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;

                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-4 rounded-[24px] px-4 py-4 text-sm font-medium transition",
                      active ? "bg-sage-700 text-white" : "bg-sage-50 text-sage-700",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto rounded-[28px] bg-hero-glow p-5 ring-1 ring-sage-100">
              <p className="text-xs uppercase tracking-[0.22em] text-sage-500">Concept</p>
              <p className="mt-2 text-sm leading-6 text-sage-700">
                Run a little, travel a little further, and unlock a calmer memory each time.
              </p>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
