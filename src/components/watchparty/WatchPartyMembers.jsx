import React from "react";
import { Crown, Users } from "lucide-react";

export default function WatchPartyMembers({ members }) {
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-bold">Penonton ({members.length})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary rounded-xl text-xs">
            {m.isHost && <Crown className="w-3 h-3 text-yellow-400 shrink-0" />}
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[9px] font-bold text-white">
              {(m.userName || "?")[0].toUpperCase()}
            </div>
            <span className="max-w-[70px] truncate font-medium">{m.userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}