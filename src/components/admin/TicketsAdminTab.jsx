import React, { useState, useEffect } from "react";
import { ticketService } from "@/lib/firebaseTickets";
import { Ticket } from "lucide-react";
import TicketThread from "./TicketThread";

const STATUS_FILTERS = [
  { key: "all",         label: "Semua" },
  { key: "open",        label: "Baru" },
  { key: "in_progress", label: "Diproses" },
  { key: "resolved",    label: "Selesai" },
  { key: "closed",      label: "Ditutup" },
];

const STAT_KEYS = [
  { key: "open",        label: "Baru",      color: "text-blue-400",   bg: "bg-blue-500/10" },
  { key: "in_progress", label: "Diproses",  color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { key: "resolved",    label: "Selesai",   color: "text-green-400",  bg: "bg-green-500/10" },
  { key: "closed",      label: "Ditutup",   color: "text-muted-foreground", bg: "bg-secondary" },
];

export default function TicketsAdminTab() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Subscribe realtime
    const unsub = ticketService.subscribeAllTickets((list) => {
      setTickets(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);
  const counts = {};
  tickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {STAT_KEYS.map(s => (
          <div key={s.key} className={`${s.bg} rounded-xl p-3 text-center border border-border`}>
            <p className={`text-xl font-extrabold ${s.color}`}>{counts[s.key] || 0}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl overflow-x-auto scrollbar-hide">
        {STATUS_FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${filter === f.key ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}
          >
            {f.label}{f.key === "all" ? ` (${tickets.length})` : ""}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" /> Memuat...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Ticket className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Tidak ada tiket</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => <TicketThread key={t.id} ticket={t} onUpdate={() => {}} />)}
        </div>
      )}
    </div>
  );
}