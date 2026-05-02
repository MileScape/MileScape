import { Gift, Sparkles } from "lucide-react";
import { useState } from "react";
import { CapsuleMachineModal, type CapsuleMachineModalProps } from "./CapsuleMachineModal";

export type CapsuleMachineButtonProps = Omit<CapsuleMachineModalProps, "isOpen" | "onClose"> & {
  label?: string;
  caption?: string;
  className?: string;
  buttonMode?: "card" | "compact";
};

export const CapsuleMachineButton = ({
  label = "Capsule",
  caption = "Draw",
  className = "",
  buttonMode = "card",
  ...modalProps
}: CapsuleMachineButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          buttonMode === "compact"
            ? `group relative flex h-[64px] w-[68px] items-center justify-center overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(238,233,224,0.98))] text-sage-700 shadow-[0_16px_34px_rgba(45,62,53,0.2)] ring-1 ring-[#e4ddcf] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(45,62,53,0.24)] active:translate-y-0 ${className}`
            : `group relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#243228_0%,#4e6258_58%,#ddb768_160%)] px-5 py-4 text-left text-white shadow-[0_22px_52px_rgba(36,50,40,0.2)] ring-1 ring-white/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_62px_rgba(36,50,40,0.26)] ${className}`
        }
        aria-haspopup="dialog"
        aria-label="Open capsule machine"
      >
        {buttonMode === "compact" ? (
          <>
            <span className="absolute inset-[5px] rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(230,225,215,0.94))]" />
            <span className="absolute -right-4 -top-4 h-14 w-14 rounded-full bg-white/60 blur-xl transition duration-300 group-hover:scale-125" />
            <span className="absolute left-1/2 top-[6px] h-[32px] w-[32px] -translate-x-1/2 rounded-full border border-white/90 bg-[radial-gradient(circle_at_34%_25%,rgba(255,255,255,0.98),rgba(214,225,214,0.84)_62%,rgba(176,196,181,0.8)_100%)] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.58),0_8px_16px_rgba(74,94,82,0.14)]" />
            <span className="absolute left-[24px] top-[18px] h-2.5 w-2.5 rounded-full bg-[linear-gradient(180deg,#fff4bf_0%,#e9bd54_48%,#c96543_50%,#8f3b34_100%)] shadow-[0_4px_8px_rgba(196,105,62,0.2)]" />
            <span className="absolute left-[36px] top-[15px] h-2 w-2 rounded-full bg-[linear-gradient(180deg,#f8f7ff_0%,#d6d9ee_48%,#c89bb6_50%,#8a617a_100%)] shadow-[0_4px_8px_rgba(129,93,122,0.16)]" />
            <span className="absolute left-1/2 top-[36px] h-[7px] w-[34px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#7b8f82,#576d60)] shadow-[0_5px_10px_rgba(75,94,82,0.16)]" />
            <span className="absolute left-1/2 top-[41px] h-[17px] w-[42px] -translate-x-1/2 rounded-[11px] bg-[linear-gradient(180deg,#edf2ec_0%,#d9e3d8_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-white/80" />
            <span className="absolute left-[24px] top-[46px] h-[7px] w-[16px] rounded-full bg-[linear-gradient(180deg,#f8efe3,#dfd1be)] ring-1 ring-white/70" />
            <span className="absolute right-[14px] top-[45px] flex h-4 w-4 items-center justify-center rounded-full bg-[linear-gradient(180deg,#60796d,#42574b)] text-white shadow-[0_6px_14px_rgba(66,87,75,0.24)] transition duration-300 group-hover:rotate-[28deg]">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
            <span className="absolute bottom-[2px] left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-[#60796d]/36" />
          </>
        ) : (
          <>
            <span className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gold/30 blur-2xl transition group-hover:scale-125" />
            <span className="absolute bottom-2 right-5 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            <span className="relative flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 ring-1 ring-white/16">
                <Gift className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  My Scape Drop
                </span>
                <span className="mt-1 block text-lg font-semibold tracking-[-0.04em]">{label}</span>
                <span className="mt-1 block text-sm leading-5 text-white/68">{caption}</span>
              </span>
            </span>
          </>
        )}
      </button>

      <CapsuleMachineModal isOpen={isOpen} onClose={() => setIsOpen(false)} {...modalProps} />
    </>
  );
};
