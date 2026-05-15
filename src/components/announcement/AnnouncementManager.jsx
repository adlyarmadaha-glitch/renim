import React, { useState, useEffect } from "react";
import { fsDb } from "@/lib/firestore";
import { authStorage } from "@/lib/auth";
import UserTitle from "@/components/auth/UserTitle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Trash2, Send, Info, AlertTriangle, CheckCircle2, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TYPES = [
  { value: "info",    label: "Info",       icon: Info,          color: "text-blue-400 border-blue-400/40 bg-blue-400/10" },
  { value: "warning", label: "Peringatan", icon: AlertTriangle, color: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" },
  { value: "success", label: "Update",     icon: CheckCircle2,  color: "text-green-400 border-green-400/40 bg-green-400/10" },
  { value: "hot",     label: "Hot!",       icon: Flame,         color: "text-orange-400 border-orange-400/40 bg-orange-400/10" },
];

function timeAgo(ts) {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function AnnouncementManager({ isAdmin = false }) {
  const user = authStorage.getUser();
  const [list, setList] = useState([]);
  const [text, setText] = useState("");
  const [type, setType] = useState("info");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Real-time via Firestore
    const unsub = fsDb.Announcement.subscribe((docs) => setList(docs));
    return unsub;
  }, []);

  if (!user || (user.role !== "admin" && user.role !== "staff")) return null;

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await fsDb.Announcement.add({
      text: text.trim(),
      type,
      authorName: user.name || user.email,
      authorRole: user.role,
      authorId: user.id,
    });
    setText("");
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await fsDb.Announcement.remove(id);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-primary" />
        Pengumuman
        <span className="ml-1"><UserTitle role={user.role} size="xs" /></span>
      </h2>

      <form onSubmit={handlePost} className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  type === t.value ? t.color : "text-muted-foreground border-border hover:bg-secondary"
                }`}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>
        <Textarea
          placeholder="Tulis pengumuman untuk semua pengguna..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-secondary border-0 text-sm resize-none min-h-[80px]"
          maxLength={300}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{text.length}/300</span>
          <Button type="submit" size="sm" disabled={!text.trim() || submitting} className="gap-2">
            <Send className="w-3.5 h-3.5" /> Kirim
          </Button>
        </div>
      </form>

      {list.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground font-semibold">Aktif ({list.length})</p>
          <AnimatePresence>
            {list.map((a) => {
              const cfg = TYPES.find((t) => t.value === a.type) || TYPES[0];
              const Icon = cfg.icon;
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/60 group">
                  <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.color.split(" ")[0]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(a.created_date)}</p>
                  </div>
                  <Button variant="ghost" size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={() => handleDelete(a.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}