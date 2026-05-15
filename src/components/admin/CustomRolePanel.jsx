import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { roleService } from "@/lib/firebaseRoles";
import { firebaseAuth } from "@/lib/firebaseAuth";
import CustomBadgeDisplay from "@/components/profile/CustomBadgeDisplay";
import { Plus, Trash2, Tag, Users, Mail } from "lucide-react";

const BADGE_EFFECTS = [
  { id: "none",     label: "Biasa" },
  { id: "glow",     label: "✨ Glow" },
  { id: "rainbow",  label: "🌈 Pelangi" },
  { id: "fire",     label: "🔥 Api" },
  { id: "neon",     label: "💜 Neon" },
  { id: "gold",     label: "👑 Emas" },
  { id: "ice",      label: "❄️ Es" },
  { id: "electric", label: "⚡ Listrik" },
];

export default function CustomRolePanel() {
  const [roles, setRoles] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [newLabel, setNewLabel] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎖️");
  const [newColor, setNewColor] = useState("#a855f7");
  const [newEffect, setNewEffect] = useState("none");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignRoleId, setAssignRoleId] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Subscribe realtime
    const unsubRoles = roleService.subscribeRoles(setRoles);
    const unsubAssign = roleService.subscribeAssignments(setAssignments);
    return () => { unsubRoles(); unsubAssign(); };
  }, []);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 2500); };

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    setLoading(true);
    await roleService.createRole({ label: newLabel.trim(), emoji: newEmoji, color: newColor, effect: newEffect });
    setNewLabel(""); setNewEmoji("🎖️"); setNewColor("#a855f7"); setNewEffect("none");
    setShowCreate(false);
    flash("Role baru dibuat!");
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await roleService.deleteRole(id);
    flash("Role dihapus");
  };

  const handleAssign = async () => {
    if (!assignEmail.trim()) return;
    setLoading(true);
    await roleService.assignRole(assignEmail.trim(), assignRoleId || null);
    setAssignEmail(""); setAssignRoleId("");
    flash(assignRoleId ? "Role berhasil diberikan!" : "Role dicopot");
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {success && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-green-400 bg-green-500/10 border border-green-500/20">
          ✅ {success}
        </motion.div>
      )}

      {/* Role list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> Role Kustom ({roles.length})
          </h3>
          <Button size="sm" onClick={() => setShowCreate((v) => !v)} className="gap-1.5 text-xs bg-primary">
            <Plus className="w-3 h-3" /> Buat Role
          </Button>
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="bg-secondary/50 rounded-xl border border-border p-4 space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Buat Role Baru</p>
                <div className="flex gap-2">
                  <Input value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} placeholder="🎖️" className="w-14 text-center text-lg bg-secondary border-secondary" />
                  <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Nama role (contoh: Veteran)" className="flex-1 bg-secondary border-secondary text-sm" />
                  <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-9 rounded-lg border border-border cursor-pointer bg-secondary" />
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {BADGE_EFFECTS.map((ef) => (
                    <button key={ef.id} onClick={() => setNewEffect(ef.id)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                        newEffect === ef.id ? "bg-primary/15 border-primary/50 text-primary" : "bg-secondary border-border text-muted-foreground"
                      }`}>{ef.label}</button>
                  ))}
                </div>
                {newLabel && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Preview:</span>