import { useState } from "react";
import { Link } from "react-router-dom";
import { buttonStyles } from "../components/ui/Button";
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
      <section className="rounded-[32px] bg-[linear-gradient(145deg,rgba(255,255,255,0.76),rgba(238,244,238,0.94))] px-5 py-6 shadow-[0_20px_52px_rgba(42,56,45,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-sage-500">PACECREW</p>
        <h2 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-ink">{t("pacecrew.createTitle")}</h2>
      </section>

      {toast ? (
        <div className="rounded-[24px] bg-sage-700 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_46px_rgba(40,62,50,0.24)] ring-1 ring-white/20">{toast}</div>
      ) : null}

      {organizedCrew ? (
        <section className="rounded-[30px] bg-white/72 p-5 shadow-[0_20px_52px_rgba(42,56,45,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.18em] text-sage-500">{t("pacecrew.organizing")}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{t("pacecrew.alreadyOrganizing")}</h2>
          <Link to={`/pacecrew/${organizedCrew.id}`} className={`${buttonStyles({ fullWidth: true })} mt-5`}>
            {t("pacecrew.openCurrent")}
          </Link>
        </section>
      ) : (
        <section className="rounded-[30px] bg-white/72 p-5 shadow-[0_20px_52px_rgba(42,56,45,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
          <div className="space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="PaceCrew name"
              className="w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 focus:ring-2 focus:ring-sage-300"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short description"
              className="min-h-[120px] w-full rounded-[22px] border-0 bg-white/80 px-4 py-3 text-sm text-ink ring-1 ring-sage-900/8 focus:ring-2 focus:ring-sage-300"
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
