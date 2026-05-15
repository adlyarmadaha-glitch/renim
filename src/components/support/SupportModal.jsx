import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bug, Lightbulb, HelpCircle, MessageSquare, AlertTriangle, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ticketService } from "@/lib/firebaseTickets";
import { firebaseAuth } from "@/lib/firebaseAuth";

const CATEGORIES = [
  { id: "bug", label: "Laporkan Bug", icon: Bug, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  { id: "suggestion", label: "Saran & Ide", icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  { id: "question", label: "Pertanyaan", icon: HelpCircle, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { id: "complaint", label: "Keluhan", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  { id: "other", label: "Lainnya", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
];

export default function SupportModal({ onClose }) {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState("form");
  const [category, setCategory] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    firebaseAuth.getUser().then(setUser);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) { setError("Judul dan deskripsi wajib diisi"); return; }
    setSubmitting(true);
    setError("");
    await ticketService.create({
      user_id_local: user?.id || "guest",
      user_name: user?.name || "Guest",
      username: user?.username || "",
      user_email: user?.email || "",
      category,
      title: title.trim(),
      description: description.trim(),
      priority: "medium",
    });
    setSubmitting(false);
    setStep("success");
  };

  const selectedCat = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="relative z-10 w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "min(92vh, 660px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm">Hubungi Admin</h2>
              <p className="text-[10px] text-muted-foreground">Laporan dan saran kamu sangat berarti</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "success" ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold mb-1">Terkirim!</h3>
                <p className="text-sm text-muted-foreground">Laporan kamu sudah diterima. Kami akan segera meninjau dan merespons.</p>
              </div>
              <Button onClick={onClose} className="mt-2 bg-gradient-to-r from-primary to-accent font-bold">Tutup</Button>
            </motion.div>
          ) : (
            <motion.div key="form" className="flex flex-col min-h-0 flex-1">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Kategori</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const active = category === cat.id;
                      return (
                        <button key={cat.id} onClick={() => setCategory(cat.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            active ? `${cat.bg} ${cat.border} ${cat.color}` : "border-border text-muted-foreground hover:bg-secondary/60"
                          }`}>
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? cat.color : ""}`} />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Judul</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Judul ${selectedCat?.label || "masalah"}...`} className="bg-secondary border-secondary" maxLength={100} />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Deskripsi</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Jelaskan secara detail masalah atau saran kamu..." className="bg-secondary border-secondary resize-none min-h-[100px]" maxLength={1000} />
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">{description.length}/1000</p>
                </div>

                {user && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/60 rounded-xl border border-border">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden">
                      {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : (user.name || "A")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full font-bold shrink-0">Login</span>
                  </div>
                )}

                {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
              </div>

              <div className="shrink-0 px-5 pb-5 pt-3 border-t border-border bg-card">
                <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !description.trim()}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-accent font-bold shadow-lg shadow-primary/20 h-11">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  Kirim Laporan
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}