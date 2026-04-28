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
  <div className="overflow-hidden rounded-[30px] bg-white/72 shadow-[0_20px_52px_rgba(42,56,45,0.08)] ring-1 ring-white/80 backdrop-blur-xl">
    {members.map((member) => (
      <div key={member.id} className="border-t border-sage-900/8 px-5 py-4 first:border-t-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100/90 text-sm font-semibold text-sage-800">
                {member.name.slice(0, 1)}
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">{member.name}</h3>
                <p className="mt-1 text-sm text-sage-500">{member.role === "organizer" ? "Organizer" : "Member"}</p>
              </div>
            </div>
            {member.joinedAt ? <p className="mt-3 text-xs text-sage-400">Joined {new Date(member.joinedAt).toLocaleDateString()}</p> : null}
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-sage-500">Active missions</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">{member.activeMissionCount}</p>
          </div>
        </div>
        {canManage && member.role !== "organizer" ? (
          <button
            type="button"
            onClick={() => onRemove(member.id)}
            className="mt-4 rounded-full bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100"
          >
            Remove member
          </button>
        ) : null}
      </div>
    ))}
  </div>
);
