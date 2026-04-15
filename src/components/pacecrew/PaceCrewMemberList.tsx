import type { PaceCrewRole } from "../../types";

interface PaceCrewMemberListProps {
  members: Array<{
    id: string;
    name: string;
    role: PaceCrewRole;
    joinedAt?: string;
    activeMissionCount: number;
  }>;
  canManage: boolean;
  onRemove: (memberId: string) => void;
}

export const PaceCrewMemberList = ({ members, canManage, onRemove }: PaceCrewMemberListProps) => (
  <div className="space-y-3">
    {members.map((member) => (
      <div key={member.id} className="rounded-[24px] bg-white p-4 shadow-card ring-1 ring-sage-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-ink">{member.name}</h3>
            <p className="mt-1 text-sm text-sage-500">{member.role === "organizer" ? "Organizer" : "Member"}</p>
            {member.joinedAt ? <p className="mt-1 text-xs text-sage-400">Joined {new Date(member.joinedAt).toLocaleDateString()}</p> : null}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-sage-500">Active missions</p>
            <p className="mt-2 text-lg font-semibold text-ink">{member.activeMissionCount}</p>
          </div>
        </div>
        {canManage && member.role !== "organizer" ? (
          <button
            type="button"
            onClick={() => onRemove(member.id)}
            className="mt-4 text-sm font-semibold text-rose-600 transition hover:text-rose-700"
          >
            Remove member
          </button>
        ) : null}
      </div>
    ))}
  </div>
);
