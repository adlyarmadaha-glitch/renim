import React, { useState, useEffect, useRef } from "react";
import { ticketService } from "@/lib/firebaseTickets";
import { firebaseAuth } from "@/lib/firebaseAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Shield, ChevronDown, ChevronUp, Clock, CheckCircle, Loader2, XCircle, Bug, Lightbulb, HelpCircle, AlertTriangle, MessageSquare, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CAT_CFG = {
  bug:        { icon: Bug,           color: "text-red-400",    bg: "bg-red-500/10",    label: "Bug" },
  suggestion: { icon: Lightbulb,     color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Saran" },
  question:   { icon: HelpCircle,    color: "text-blue-400",   bg: "bg-blue-500/10",   label: "Pertanyaan" },
  complaint:  { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", label: "Keluhan" },
  other:      { icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10", label: "Lainnya" },
};

const STATUS_CFG = {
  open:        { label: "Buka",     icon: Clock,       color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30" },
  in_progress: { label: "Diproses", icon: Loader2,     color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  resolved:    { label: "Selesai",  icon: CheckCircle, color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30" },
  closed:      { label: "Ditutup",  icon: XCircle,     color: "text-muted-foreground", bg: "bg-secondary", border: "border-border" },
};

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function TicketThread({ ticket, onUpdate }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState(ticket.status || "open");
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    firebaseAuth.getUser().then(setUser);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const unsub = ticketService.subscribeMessages(ticket.id, setMessages);
    return unsub;
  }, [expanded, ticket.id]);

  useEffect(() => {
    if (expanded && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, expanded]);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Hapus tiket ini? Semua pesan juga akan terhapus.")) return;
    setDeleting(true);
    await ticketService.delete(ticket.id);
    onUpdate?.();
  };

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    await ticketService.sendMessage({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_name: user.name,
      sender_role: user.role,
      text: text.trim(),
    });
    // Manually update status if changed
    if (status !== ticket.status) {
      await ticketService.update(ticket.id, { status, admin_name: user.name });
    }
    setText("");
    setSending(false);
    onUpdate?.();
  };

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    await ticketService.update(ticket.id, { status: newStatus, admin_name: user?.name });
    onUpdate?.();
  };

  const catCfg = CAT_CFG[ticket.category] || CAT_CFG.other;
  const statCfg = STATUS_CFG[status] || STATUS_CFG.open;
  const CatIcon = catCfg.icon;
  const StatIcon = statCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary/40 border border-border rounded-xl overflow-hidden"
    >
      <button className="w-full text-left" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-start gap-3 p-3.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(ticket.user_name || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${catCfg.bg} ${catCfg.color}`}>
                <CatIcon className="w-2.5 h-2.5" />{catCfg.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${statCfg.bg} ${statCfg.border} ${statCfg.color}`}>
                <StatIcon className="w-2.5 h-2.5" />{statCfg.label}
              </span>
              {messages.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 bg-primary/15 text-primary rounded-full font-bold">{messages.length} pesan</span>
              )}
            </div>
            <p className="text-sm font-semibold truncate">{ticket.title}</p>
            <p className="text-[10px] text-muted-foreground">{ticket.user_name} · {formatTime(ticket.created_date)}</p>
          </div>
          <div className="flex items-center gap-1 mt-0.5 shrink-0">
            <button onClick={handleDelete} disabled={deleting}
              className="p-1.5 hover:bg-destructive/15 text-destructive rounded-lg transition-colors opacity-60 hover:opacity-100"
              title="Hapus tiket">
              {deleting ? <div className="w-3 h-3 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
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
              <div className="bg-card/60 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Laporan Awal</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                {ticket.user_email && <p className="text-[10px] text-muted-foreground mt-1">{ticket.user_email}</p>}
              </div>

              {messages.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {messages.map((msg) => {
                    const isStaff = msg.sender_role === "admin" || msg.sender_role === "staff";
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isStaff ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${isStaff ? "bg-gradient-to-br from-primary to-accent" : "bg-gradient-to-br from-green-500 to-teal-500"}`}>
                          {isStaff ? <Shield className="w-3 h-3" /> : (msg.sender_name || "?")[0].toUpperCase()}
                        </div>
                        <div className={`max-w-[75%] rounded-xl px-3 py-2 ${isStaff ? "bg-primary/15 border border-primary/20" : "bg-secondary border border-border"}`}>
                          <p className={`text-[9px] font-bold mb-0.5 ${isStaff ? "text-primary" : "text-muted-foreground"}`}>
                            {msg.sender_name} {isStaff && `(${msg.sender_role})`}
                          </p>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          <p className="text-[8px] text-muted-foreground mt-1">{formatTime(msg.created_date)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}

              {/* Status selector */}
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button key={key} onClick={() => handleStatusChange(key)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${status === key ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "border-border text-muted-foreground hover:bg-secondary"}`}
                    >
                      <Icon className="w-2.5 h-2.5" />{cfg.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Tulis balasan ke pelapor..."
                  className="bg-secondary border-secondary resize-none min-h-[70px] text-sm"
                  maxLength={1000}
                />
                <Button size="sm" onClick={handleSend} disabled={sending || !text.trim()} className="gap-1.5 bg-primary font-semibold">
                  {sending ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3 h-3" />}
                  Kirim Balasan
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}