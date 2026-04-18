import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";

export const SettingsPage = () => {
  const { state, setLanguage, setSliderMaxDistanceKm, t } = useAppState();
  const [sliderMaxInput, setSliderMaxInput] = useState(String(state.sliderMaxDistanceKm));

  useEffect(() => {
    setSliderMaxInput(String(state.sliderMaxDistanceKm));
  }, [state.sliderMaxDistanceKm]);

  const parsedSliderMaxInput = Number(sliderMaxInput);
  const sliderMaxValid =
    Number.isFinite(parsedSliderMaxInput) &&
    parsedSliderMaxInput >= 1 &&
    parsedSliderMaxInput <= 100;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow={t("dashboard.settings")} title={t("settings.title")} />

      <section className="space-y-4">
        <SectionHeader eyebrow={t("dashboard.settings")} title={t("dashboard.runDistanceRange")} />
        <div className="rounded-[28px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">{t("dashboard.customMaxDistance")}</p>
              <p className="mt-1 text-sm text-sage-600">0 to {state.sliderMaxDistanceKm} km</p>
            </div>
            <div className="rounded-full bg-sage-50 px-4 py-2 text-sm font-medium text-sage-700">
              {t("dashboard.max100")}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex flex-1 items-center rounded-[20px] bg-sage-50 px-4 py-3 ring-1 ring-sage-100">
              <input
                type="number"
                inputMode="decimal"
                min="1"
                max="100"
                step="1"
                value={sliderMaxInput}
                onChange={(event) => setSliderMaxInput(event.target.value)}
                className="w-full border-none bg-transparent text-lg font-semibold text-ink outline-none"
              />
              <span className="text-sm font-medium text-sage-500">km</span>
            </div>
            <Button
              onClick={() => {
                if (sliderMaxValid) {
                  setSliderMaxDistanceKm(parsedSliderMaxInput);
                }
              }}
              disabled={!sliderMaxValid}
            >
              {t("dashboard.save")}
            </Button>
          </div>

          <p className="mt-3 text-xs text-sage-500">
            {sliderMaxValid ? t("dashboard.savedRange") : t("dashboard.enterRange")}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow={t("dashboard.settings")} title={t("dashboard.language")} />
        <div className="grid grid-cols-2 gap-3 rounded-[28px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`rounded-[22px] px-4 py-4 text-sm font-semibold transition ${
              state.language === "en" ? "bg-sage-700 text-white" : "bg-sage-50 text-ink"
            }`}
          >
            {t("dashboard.english")}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("zh")}
            className={`rounded-[22px] px-4 py-4 text-sm font-semibold transition ${
              state.language === "zh" ? "bg-sage-700 text-white" : "bg-sage-50 text-ink"
            }`}
          >
            {t("dashboard.chinese")}
          </button>
        </div>
      </section>
    </div>
  );
};
