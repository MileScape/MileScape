import { useState } from "react";
import type { Route } from "../../types";
import { Button } from "../ui/Button";

interface PaceCrewMissionFormProps {
  destinations: Route[];
  onSubmit: (input: {
    title: string;
    description: string;
    targetDistanceKm: number;
    depositStamps: number;
    rewardStamps: number;
    deadline: string;
    destinationRewardId?: string;
  }) => void;
}

export const PaceCrewMissionForm = ({ destinations, onSubmit }: PaceCrewMissionFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDistanceKm, setTargetDistanceKm] = useState("2");
  const [depositStamps, setDepositStamps] = useState("15");
  const [rewardStamps, setRewardStamps] = useState("40");
  const [deadline, setDeadline] = useState("");
  const [destinationRewardId, setDestinationRewardId] = useState("");

  return (
    <div className="rounded-[30px] bg-white p-5 shadow-card ring-1 ring-sage-100">
      <p className="text-xs uppercase tracking-[0.2em] text-sage-500">Organizer tools</p>
      <h3 className="mt-2 text-xl font-semibold text-ink">Publish a PaceCrew mission</h3>
      <div className="mt-4 space-y-3">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Mission title" className="w-full rounded-[20px] border-0 bg-sage-50 px-4 py-3 text-sm text-ink ring-1 ring-sage-100 focus:ring-2 focus:ring-sage-300" />
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mission description" className="min-h-[96px] w-full rounded-[20px] border-0 bg-sage-50 px-4 py-3 text-sm text-ink ring-1 ring-sage-100 focus:ring-2 focus:ring-sage-300" />
        <div className="grid grid-cols-2 gap-3">
          <input value={targetDistanceKm} onChange={(event) => setTargetDistanceKm(event.target.value)} placeholder="Target km" type="number" min="0.5" step="0.1" className="w-full rounded-[20px] border-0 bg-sage-50 px-4 py-3 text-sm text-ink ring-1 ring-sage-100 focus:ring-2 focus:ring-sage-300" />
          <input value={depositStamps} onChange={(event) => setDepositStamps(event.target.value)} placeholder="Deposit" type="number" min="0" className="w-full rounded-[20px] border-0 bg-sage-50 px-4 py-3 text-sm text-ink ring-1 ring-sage-100 focus:ring-2 focus:ring-sage-300" />
          <input value={rewardStamps} onChange={(event) => setRewardStamps(event.target.value)} placeholder="Reward" type="number" min="0" className="w-full rounded-[20px] border-0 bg-sage-50 px-4 py-3 text-sm text-ink ring-1 ring-sage-100 focus:ring-2 focus:ring-sage-300" />
          <input value={deadline} onChange={(event) => setDeadline(event.target.value)} type="date" className="w-full rounded-[20px] border-0 bg-sage-50 px-4 py-3 text-sm text-ink ring-1 ring-sage-100 focus:ring-2 focus:ring-sage-300" />
        </div>
        <select value={destinationRewardId} onChange={(event) => setDestinationRewardId(event.target.value)} className="w-full rounded-[20px] border-0 bg-sage-50 px-4 py-3 text-sm text-ink ring-1 ring-sage-100 focus:ring-2 focus:ring-sage-300">
          <option value="">No destination reward</option>
          {destinations.map((destination) => (
            <option key={destination.id} value={destination.id}>
              {destination.name}
            </option>
          ))}
        </select>
        <Button
          fullWidth
          className="bg-ink hover:bg-sage-900"
          onClick={() =>
            onSubmit({
              title,
              description,
              targetDistanceKm: Number(targetDistanceKm),
              depositStamps: Number(depositStamps),
              rewardStamps: Number(rewardStamps),
              deadline: new Date(deadline || Date.now()).toISOString(),
              destinationRewardId: destinationRewardId || undefined
            })
          }
        >
          Publish mission
        </Button>
      </div>
    </div>
  );
};
