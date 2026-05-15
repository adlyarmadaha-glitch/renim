import React, { useState, useEffect, useRef } from "react";
import { watchPartyService } from "@/lib/watchParty";
import { nobarRankStorage } from "@/components/watchparty/NobarOtakuRank";
import { Send, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function timeStr(ts) {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function WatchPartyChat({ roomId, user, hostId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    return watchPartyService.subscribeMessages(roomId, setMessages);
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    const t = text.trim();
    setText("");
    await watchPartyService.sendMessage(roomId, {
      userId: user.id,
      userName: user.name,
      userRole: user.role || "user",
      text: t,
    });
    // Award 1 nobar EXP per message (max 20/session effectively via rate limit)
    nobarRankStorage.add(user.id, { exp: 1, messageSent: true });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.userId === user?.id;
            const isHost = msg.userId === hostId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {(msg.userName || "?")[0].toUpperCase()}
                </div>
                <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  {!isMe && (
                    <div className="flex items-center gap-1 px-1">
                      {isHost && <Crown className="w-3 h-3 text-yellow-400" />}
                      <span className="text-[10px] text-muted-foreground font-semibold truncate max-w-[80px]">
                        {msg.userName}
                      </span>
                    </div>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-muted-foreground px-1">{timeStr(msg.created_date)}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">Belum ada pesan. Mulai chat!</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan..."
          maxLength={200}
          className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50"
        />
        <button type="submit" disabled={!text.trim()}
          className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 disabled:opacity-40">
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </form>
    </div>
  );
}