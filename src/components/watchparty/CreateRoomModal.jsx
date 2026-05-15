import React, { useState } from "react";
import { watchPartyService } from "@/lib/watchParty";
import { motion } from "framer-motion";
import { X, Users, Copy, Check, Popcorn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateRoomModal({ episodeId, animeTitle, episodeTitle, poster, user, onRoomCreated, onClose }) {
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const id = await watchPartyService.createRoom({ episodeId, animeTitle, episodeTitle, poster, host: user });
    setRoomId(id);
    setLoading(false);
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/nonton-bareng/${roomId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30">
            <Popcorn className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-heading font-bold">Nonton Bareng</h2>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{animeTitle} — {episodeTitle}</p>
        </div>

        {!roomId ? (
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
              <p>✅ Buat room dan bagikan kode/link ke temanmu</p>
              <p>✅ Video akan tersinkronisasi secara realtime</p>
              <p>✅ Chat bareng sambil nonton</p>
            </div>
            <Button className="w-full gap-2 bg-gradient-to-r from-primary to-accent" onClick={handleCreate} disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Users className="w-4 h-4" />}
              {loading ? "Membuat Room..." : "Buat Room Sekarang"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Kode Room</p>
              <div className="text-4xl font-heading font-extrabold tracking-[0.3em] text-primary">{roomId}</div>
            </div>

            <div className="bg-secondary rounded-xl p-3 flex items-center gap-2">
              <p className="text-xs text-muted-foreground flex-1 truncate">
                {window.location.origin}/nonton-bareng/{roomId}
              </p>
              <button onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Disalin!" : "Salin"}
              </button>
            </div>

            <Button className="w-full gap-2" onClick={() => onRoomCreated(roomId)}>
              <Popcorn className="w-4 h-4" /> Masuk ke Room
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}