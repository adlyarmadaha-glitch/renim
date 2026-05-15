import React, { useState, useEffect } from "react";
import { firebaseAuth } from "@/lib/firebaseAuth";
import { ticketService } from "@/lib/firebaseTickets";
import { Shield, Ticket, Megaphone, Lock, MessageCircle, RefreshCw } from "lucide-react";
import TicketThread from "@/components/admin/TicketThread";
import AnnouncementManager from "@/components/announcement/AnnouncementManager";
import StaffChatPanel from "@/components/staff/StaffChatPanel";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "tickets",       label: "Tiket",       icon: Ticket },
  { id: "announcements", label: "Pengumuman",   icon: Megaphone },
  { id: "chat",          label: "Chat Tim",     icon: MessageCircle },
];

const STATUS_FILTERS = [
  { key: "all",         label: "Semua" },
  { key: "open",        label: "Baru" },
  { key: "in_progress", label: "Diproses" },
  { key: "resolved",    label: "Selesai" },
  { key: "closed",      label: "Ditutup" },
];

export default function StaffPanel() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    firebaseAuth.getUser().then(setUser);
    const handler = () => firebaseAuth.getUser().then(setUser);
    window.addEventListener("renime-auth-change", handler);
    return () => window.removeEventListener("renime-auth-change", handler);
  }, []);

  useEffect(() => {
    if (activeTab !== "tickets") return;
    setLoading(true);
    // Subscribe realtime to all tickets
    const unsub = ticketService.subscribeAllTickets((list) => {
      setTickets(list);
      setLoading(false);
    });
    return unsub;
  }, [activeTab]);

  const isAllowed = user && (user.role === "staff" || user.role === "admin");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">Akses hanya untuk Staf dan Admin</p>
      </div>
    );
  }

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-xl">Panel Staf</h1>
          <p className="text-xs text-muted-foreground">Selamat datang, {user.name}</p>
        </div>
        <div className="ml-auto">
          <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${user.role === "admin" ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"}`}>
            {user.role === "admin" ? "ADMIN" : "STAF"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary rounded-xl p-1 gap-1 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-w-max ${
                activeTab === t.id ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="w-3.5 h-3.5 shrink-0" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tickets */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-secondary p-1 rounded-xl flex-1 overflow-x-auto scrollbar-hide">
              {STATUS_FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${filter === f.key ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}>
                  {f.label}{f.key === "all" ? ` (${tickets.length})` : ""}
                </button>
              ))}
            </div>
          </div>
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
      )}

      {activeTab === "announcements" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
          <AnnouncementManager isAdmin={true} />
        </div>
      )}

      {activeTab === "chat" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
          <h2 className="font-bold flex items-center gap-2 text-base mb-4">
            <MessageCircle className="w-4 h-4 text-cyan-400" /> Chat Admin &amp; Staf
          </h2>
          <StaffChatPanel />
        </div>
      )}
    </div>
  );
}