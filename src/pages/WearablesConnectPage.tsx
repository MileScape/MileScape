import { ChevronRight, Watch } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supportedDevices } from "../data/wearables";
import { useAppState } from "../hooks/useAppState";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";

export const WearablesConnectPage = () => {
  const navigate = useNavigate();
  const { state, connectWearable } = useAppState();
  const activeDevice = state.wearableConnection;
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleConnect = (deviceId: string, deviceName: string) => {
    const result = connectWearable({ id: deviceId, name: deviceName });
    if (result.success) {
      setSheetOpen(false);
      navigate("/wearables");
    }
  };

  if (!activeDevice) {
    return (
      <div className="space-y-8 pb-10">
        <section className="space-y-3 pt-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">WEARABLES</p>
          <h1 className="text-[2rem] font-semibold tracking-[-0.06em] text-ink">Bring runs into MileScape</h1>
        </section>

        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(158deg,rgba(255,255,255,0.84),rgba(232,241,232,0.97))] px-6 py-7 shadow-[0_22px_60px_rgba(49,60,50,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.45, 0.68, 0.45] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-72px] top-[-36px] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(188,210,193,0.8),rgba(188,210,193,0.06)_68%,transparent_72%)]"
          />
          <div className="relative flex min-h-[62vh] flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">Pairing</p>
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/80 text-sage-700 shadow-[0_18px_40px_rgba(49,63,50,0.12)] ring-1 ring-white/85">
                <Watch className="h-7 w-7" />
              </div>
            </div>

            <div className="space-y-3 py-6">
              <p className="text-[0.95rem] font-medium uppercase tracking-[0.34em] text-sage-500">CONNECT ONE</p>
              <h2 className="text-[3.55rem] font-semibold uppercase leading-[0.88] tracking-[-0.08em] text-ink">
                WEARABLE
              </h2>
              <p className="max-w-[24ch] text-sm leading-6 text-sage-600">
                Pair a device to bring synced runs, pace, and health data into MileScape.
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-900"
              >
                Start Pairing
              </button>
            </div>
          </div>
        </div>

        {sheetOpen ? (
          <div className="fixed inset-0 z-40">
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="absolute inset-0 bg-ink/18 backdrop-blur-[6px]"
              aria-label="Close device picker"
            />
            <div className="absolute inset-x-0 bottom-0 mx-auto flex h-[52vh] max-w-md flex-col rounded-t-[34px] bg-[linear-gradient(180deg,rgba(251,249,244,0.84),rgba(240,246,240,0.72))] px-5 pb-6 pt-4 shadow-[0_-24px_80px_rgba(36,50,40,0.20)] ring-1 ring-white/70 backdrop-blur-3xl">
              <div className="mx-auto h-1.5 w-14 rounded-full bg-white/70" />
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">PAIRING</p>
                  <h3 className="mt-1 text-[1.45rem] font-semibold tracking-[-0.03em] text-ink">Choose a device</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/56 text-sage-700 ring-1 ring-white/80 backdrop-blur-xl">
                  <Watch className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 flex-1 space-y-3 overflow-y-auto px-1 pb-1 pr-2 pt-1">
                {supportedDevices.map((device) => (
                  <button
                    key={device.id}
                    type="button"
                    disabled={device.availability !== "available"}
                    onClick={() => handleConnect(device.id, device.name)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[24px] px-5 py-4 text-left ring-1 transition",
                      device.availability === "available"
                        ? "bg-white/82 text-ink ring-sage-900/8 hover:bg-white"
                        : "bg-sage-50/70 text-sage-400 ring-sage-900/5",
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold">{device.name}</p>
                      <p className="mt-1 text-xs text-sage-500">{device.maker}</p>
                    </div>
                    {device.availability === "available" ? (
                      <ChevronRight className="h-4 w-4 text-sage-400" />
                    ) : (
                      <span className="text-[11px] uppercase tracking-[0.14em]">Soon</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="space-y-2 pt-1">
        <p className="text-[11px] uppercase tracking-[0.24em] text-sage-500">WEARABLES</p>
        <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-ink">Connect new device</h2>
        <p className="text-sm leading-6 text-sage-600">
          Choose a supported wearable to replace or add your sync source.
        </p>
      </section>

      <div className="rounded-[24px] bg-sage-50/80 px-4 py-4 ring-1 ring-sage-900/8">
        <p className="text-[11px] uppercase tracking-[0.18em] text-sage-500">Current connection</p>
        <p className="mt-2 text-base font-semibold text-ink">{activeDevice.name}</p>
      </div>

      <div className="space-y-3">
        {supportedDevices.map((device) => (
          <button
            key={device.id}
            type="button"
            disabled={device.availability !== "available"}
            onClick={() => handleConnect(device.id, device.name)}
            className={cn(
              "flex w-full items-center justify-between rounded-[24px] px-5 py-4 text-left ring-1 transition",
              device.availability === "available"
                ? "bg-white/82 text-ink ring-sage-900/8 hover:bg-white"
                : "bg-sage-50/70 text-sage-400 ring-sage-900/5",
            )}
          >
            <div>
              <p className="text-sm font-semibold">{device.name}</p>
              <p className="mt-1 text-xs text-sage-500">{device.maker}</p>
            </div>
            {device.availability === "available" ? (
              <ChevronRight className="h-4 w-4 text-sage-400" />
            ) : (
              <span className="text-[11px] uppercase tracking-[0.14em]">Soon</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
