const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Bug, Lightbulb, HelpCircle, AlertTriangle, MessageSquare,
  CheckCircle, Clock, XCircle, Loader2, Send, RefreshCw,
  Filter, ChevronDown, ChevronUp, User
} from "lucide-react";

const CAT_CFG = {
  bug:        { icon: Bug,           color: "text-red-400",    bg: "bg-red-500/10",     border: "border-red-500/30",    label: "Bug" },
  suggestion: { icon: Lightbulb,     color: "text-yellow-400", bg: "bg-yellow-500/10",  border: "border-yellow-500/30", label: "Saran" },
  question:   { icon: HelpCircle,    color: "text-blue-400",   bg: "bg-blue-500/10",    border: "border-blue-500/30",   label: "Pertanyaan" },
  complaint:  { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10",  border: "border-orange-500/30", label: "Keluhan" },
  other:      { icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10",  border: "border-purple-500/30", label: "Lainnya" },
};

const STATUS_CFG = {
  open:        { label: "Buka",        icon: Clock,        color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30" },
  in_progress: { label: "Diproses",    icon: Loader2,      color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  resolved:    { label: "Selesai",     icon: CheckCircle,  color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30" },
  closed:      { label: "Ditutup",     icon: XCircle,      color: "text-muted-foreground", bg: "bg-secondary", border: "border-border" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.open;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" /> {cfg.label}
    </span>
  );
}

function CatBadge({ category }) {
  const cfg = CAT_CFG[category] || CAT_CFG.other;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" /> {cfg.label}
    </span>
  );
}

function TicketCard({ ticket, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState(ticket.admin_reply || "");
  const [status, setStatus] = useState(ticket.status || "open");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await db.entities.SupportTicket.update(ticket.id, {
      admin_reply: reply.trim(),
      status,
      admin_name: "Admin",
    });
    setSaving(false);
    onUpdate();
  };

  const createdDate = ticket.created_date
    ? new Date(ticket.created_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary/40 border border-border rounded-xl overflow-hidden hover:border-border/80 transition-all"
    >
      <button className="w-full text-left" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start gap-3 p-3.5">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(ticket.user_name || "?")[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <CatBadge category={ticket.category} />
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="text-sm font-semibold truncate leading-tight">{ticket.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <User className="w-2.5 h-2.5" />{ticket.user_name}
                  {ticket.username && <span>· @{ticket.username}</span>}
                  · {createdDate}
                </p>
              </div>
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 p-3.5 space-y-3">
              {/* Description */}
              <div className="bg-card/50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Deskripsi</p>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {/* User info */}
              {ticket.user_email && (
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3 h-3" /> {ticket.user_email}
                </div>
              )}

              {/* Admin Controls */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Respons Admin</p>

                {/* Status selector */}
                <div className="flex gap-1.5 flex-wrap">
                  {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setStatus(key)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                          status === key ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <Icon className="w-2.5 h-2.5" /> {cfg.label}
                      </button>
                    );
                  })}
                </div>

                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Tulis balasan admin..."
                  className="bg-secondary border-secondary resize-none min-h-[80px] text-sm"
                  maxLength={1000}
                />

                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-1.5 bg-primary text-white font-semibold"
                >
                  {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3 h-3" />}
                  Simpan Respons
                </Button>
              </div>

              {/* Previous admin reply */}
              {ticket.admin_reply && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-primary mb-1.5">✅ Balasan Sebelumnya</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{ticket.admin_reply}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const STATUS_FILTERS = ["all", "open", "in_progress", "resolved", "closed"];

export default function TicketPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const list = await db.entities.SupportTicket.list("-created_date", 100);
    setTickets(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  const counts = {};
  tickets.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { key: "open", label: "Baru", color: "text-blue-400", bg: "bg-blue-500/10" },
          { key: "in_progress", label: "Diproses", color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { key: "resolved", label: "Selesai", color: "text-green-400", bg: "bg-green-500/10" },
          { key: "closed", label: "Ditutup", color: "text-muted-foreground", bg: "bg-secondary" },
        ].map((s) => (
          <div key={s.key} className={`${s.bg} rounded-xl p-3 text-center border border-border`}>
            <p className={`text-xl font-extrabold ${s.color}`}>{counts[s.key] || 0}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + refresh */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 bg-secondary p-1 rounded-xl flex-1 overflow-x-auto scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                filter === f ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? `Semua (${tickets.length})` : STATUS_CFG[f]?.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="shrink-0">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" /> Memuat tiket...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Tidak ada tiket {filter !== "all" ? STATUS_CFG[filter]?.label : ""}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TicketCard key={t.id} ticket={t} onUpdate={load} />
          ))}
        </div>
      )}
    </div>
  );
}