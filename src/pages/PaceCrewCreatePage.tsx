import { useState } from "react";
import { Link } from "react-router-dom";
import { buttonStyles } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppState } from "../hooks/useAppState";

export const PaceCrewCreatePage = () => {
  const { state, createPaceCrew, t } = useAppState();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const organizedCrew = state.userPaceCrewState.organizedCrewId
    ? state.paceCrews.find((crew) => crew.id === state.userPaceCrewState.organizedCrewId)
    : null;

  const handleCreate = () => {
    const result = createPaceCrew({ name: name.trim(), description: description.trim() });
    setToast(result.message);
    window.setTimeout(() => setToast(null), 2200);

    if (result.success) {
      setName("");
      setDescription("");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={t("app.paceCrew")}
        title={t("pacecrew.createTitle")}
      />

      {toast ? (
        <div className="rounded-[24px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-card">{toast}</div>
      ) : null}

      {organizedCrew ? (
        <section className="rounded-[30px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("pacecrew.organizing")}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{t("pacecrew.alreadyOrganizing")}</h2>
          <Link to={`/pacecrew/${organizedCrew.id}`} className={`${buttonStyles({ fullWidth: true })} mt-5`}>
            {t("pacecrew.openCurrent")}
          </Link>
        </section>
      ) : (
        <section className="rounded-[30px] bg-white p-5 shadow-card ring-1 ring-sage-100">
          <div className="space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="PaceCrew name"
              className="w-full rounded-[20px] border-0 bg-sage-50 px-4 py-3 text-sm text-ink ring-1 ring-sage-100 focus:ring-2 focus:ring-sage-300"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short description"
              className="min-h-[120px] w-full rounded-[20px] border-0 bg-sage-50 px-4 py-3 text-sm text-ink ring-1 ring-sage-100 focus:ring-2 focus:ring-sage-300"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!name.trim() || !description.trim()}
              className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-sage-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("pacecrew.create")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
