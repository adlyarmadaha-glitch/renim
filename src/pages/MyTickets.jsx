import React, { useState, useEffect, useRef } from "react";
import { ticketService } from "@/lib/firebaseTickets";
import { firebaseAuth } from "@/lib/firebaseAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, ChevronDown, ChevronUp, Send, Clock, CheckCircle, Loader2, XCircle, Shield, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SupportModal from "@/components/support/SupportModal";

const STATUS_CFG = {
  open:        { label: "Menunggu",  icon: Clock,       color: "text-blue-400",        bg: "bg-blue-500/10",   border: "border-blue-500/30" },
  in_progress: { label: "Diproses", icon: Loader2,     color: "text-yellow-400",      bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  resolved:    { label: "Selesai",  icon: CheckCircle, color: "text-green-400",        bg: "bg-green-500/10",  border: "border-green-500/30" },
  closed:      { label: "Ditutup",  icon: XCircle,     color: "text-muted-foreground", bg: "bg-secondary",     border: "border-border" },
};

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function TicketCard({ ticket }) {
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
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
    if (expanded && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, expanded]);

  const handleReply = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    await ticketService.sendMessage({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_name: user.name,
      sender_role: "user",
      text: text.trim(),
    });
    setText("");
    setSending(false);
  };

  const statCfg = STATUS_CFG[ticket.status] || STATUS_CFG.open;
  const StatIcon = statCfg.icon;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button className="w-full text-left" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-start gap-3 p-3.5">
          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${statCfg.color.replace("text-", "bg-")}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${statCfg.bg} ${statCfg.border} ${statCfg.color}`}>
                <StatIcon className="w-2.5 h-2.5" />{statCfg.label}
              </span>
              {ticket.admin_reply && <span className="text-[9px] px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded-full font-bold border border-green-500/20">Ada Balasan</span>}
              {messages.length > 0 && <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">{messages.length} pesan</span>}
            </div>
            <p className="text-sm font-semibold">{ticket.title}</p>
            <p className="text-[10px] text-muted-foreground">{formatTime(ticket.created_date)}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground mt-1 shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-border/60 p-3.5 space-y-3">
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Laporan Kamu</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {messages.length > 0 && (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {messages.map(msg => {
                    const isStaff = msg.sender_role === "admin" || msg.sender_role === "staff";
                    return (
                      <div key={msg.id} className={`flex gap-2 items-end ${isStaff ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${isStaff ? "bg-gradient-to-br from-primary to-accent" : "bg-gradient-to-br from-green-500 to-teal-500"}`}>
                          {isStaff ? <Shield className="w-3 h-3" /> : (msg.sender_name || "?")[0].toUpperCase()}
                        </div>
                        <div className={`max-w-[75%] flex flex-col gap-0.5 ${isStaff ? "items-end" : "items-start"}`}>
                          {isStaff && <p className="text-[9px] font-bold text-primary px-1">{msg.sender_name} (Tim Admin)</p>}
                          <div className={`rounded-2xl px-3 py-2 text-sm ${isStaff ? "bg-primary/15 border border-primary/20 rounded-br-sm" : "bg-secondary border border-border rounded-bl-sm"}`}>
                            {msg.text}
                          </div>
                          <p className="text-[8px] text-muted-foreground px-1">{formatTime(msg.created_date)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}

              {ticket.status !== "closed" && ticket.status !== "resolved" ? (
                <div className="space-y-2">
                  <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Tulis balasan..." className="bg-secondary border-secondary resize-none min-h-[70px] text-sm" maxLength={500} />
                  <Button size="sm" onClick={handleReply} disabled={sending || !text.trim()} className="gap-1.5 bg-primary font-semibold">
                    {sending ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3 h-3" />}
                    Balas
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  {ticket.status === "resolved" ? "✅ Tiket ini sudah diselesaikan." : "Tiket ini sudah ditutup."}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MyTickets() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    firebaseAuth.getUser().then(u => {
      setUser(u);
      if (!u) { setLoading(false); return; }
      // Subscribe realtime — hides closed tickets automatically
      const unsub = ticketService.subscribeUserTickets(u.id, (list) => {
        setTickets(list);
        setLoading(false);
      });
      return unsub;
    });
  }, []);

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <MessageSquare className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Login untuk melihat tiket kamu</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-lg">Tiket Saya</h1>
            <p className="text-xs text-muted-foreground">Riwayat laporan dan balasan</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowSupport(true)} className="bg-primary gap-1.5 text-xs">
          <Send className="w-3 h-3" /> Buat Laporan
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />Memuat...
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Ticket className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium mb-1">Belum ada tiket</p>
          <p className="text-xs">Buat laporan jika ada masalah atau saran</p>
          <Button size="sm" onClick={() => setShowSupport(true)} className="mt-4 bg-primary gap-1.5">Buat Laporan</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
        </div>
      )}

      <AnimatePresence>
        {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      </AnimatePresence>
    </div>
  );
}