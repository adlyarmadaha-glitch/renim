import React, { useState } from "react";
import { watchPartyService } from "@/lib/watchParty";
import { motion } from "framer-motion";
import { X, Hash, LogIn, Popcorn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JoinRoomModal({ user, onRoomJoined, onClose }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e) => {
    e.preventDefault();
    const roomId = code.trim().toUpperCase();
    if (!roomId) return;
    setLoading(true);
    setError("");
    try {
      const room = await watchPartyService.joinRoom(roomId, user);
      onRoomJoined(roomId, room);
    } catch (err) {
      setError(err.message || "Gagal bergabung ke room");
    } finally {
      setLoading(false);
    }
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-heading font-bold">Gabung Room</h2>
          <p className="text-xs text-muted-foreground mt-1">Masukkan kode 6 karakter dari temanmu</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              placeholder="XXXXXX"
              className="w-full pl-9 bg-secondary border border-border rounded-xl px-3 py-3 text-center text-2xl font-heading font-extrabold tracking-[0.3em] outline-none focus:border-primary/50 uppercase"
              maxLength={6}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90" disabled={loading || code.length < 6}>
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Popcorn className="w-4 h-4" />}
            {loading ? "Bergabung..." : "Bergabung ke Room"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}