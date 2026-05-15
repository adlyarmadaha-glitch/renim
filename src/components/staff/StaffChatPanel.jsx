import React, { useState, useEffect, useRef } from "react";
import { fsDb } from "@/lib/firestore";
import { authStorage } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Shield, Crown } from "lucide-react";
import { motion } from "framer-motion";

function formatTime(ts) {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function StaffChatPanel() {
  const user = authStorage.getUser();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Real-time via Firestore onSnapshot
    const unsub = fsDb.StaffChat.subscribe((msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    await fsDb.StaffChat.add({
      sender_id: user.id || "",
      sender_name: user.name || user.email || "Staff",
      sender_role: user.role || "staff",
      text: text.trim(),
    });
    setText("");
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
        Memuat chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "min(60vh, 480px)" }}>
      <div className="shrink-0 mb-3 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-400 flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        Chat internal khusus Admin &amp; Staf. Tidak terlihat oleh pengguna biasa.
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">Belum ada pesan. Mulai percakapan!</div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user.id;
          const isAdmin = msg.sender_role === "admin";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${isAdmin ? "bg-gradient-to-br from-red-500 to-orange-500" : "bg-gradient-to-br from-cyan-500 to-blue-500"}`}>
                {isAdmin ? <Crown className="w-3.5 h-3.5" /> : (msg.sender_name || "S")[0].toUpperCase()}
              </div>
              <div className={`max-w-[70%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <p className={`text-[9px] font-bold px-1 ${isAdmin ? "text-red-400" : "text-cyan-400"}`}>{msg.sender_name} ({msg.sender_role})</p>}
                <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed break-words ${isMe ? "bg-primary text-white rounded-br-sm" : "bg-secondary border border-border rounded-bl-sm"}`}>
                  {msg.text}
                </div>
                <p className="text-[8px] text-muted-foreground px-1">{formatTime(msg.created_date)}</p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="shrink-0 flex gap-2 mt-3">
        <Input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Tulis pesan ke tim staf..."
          className="flex-1 bg-secondary border-secondary"
          maxLength={500}
        />
        <Button type="submit" size="icon" disabled={!text.trim() || sending} className="bg-primary shrink-0">
          {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}