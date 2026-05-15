import React, { useState, useRef } from "react";
import { authStorage } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Save, AtSign, User, Shield, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserTitle from "@/components/auth/UserTitle";
import AvatarCropper from "@/components/profile/AvatarCropper";

export default function ProfileSettings({ user, onUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cropSrc, setCropSrc] = useState(null);
  const [isGif, setIsGif] = useState(false);
  const [fileSizeBytes, setFileSizeBytes] = useState(0);
  const fileRef = useRef(null);

  if (!user) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("File harus berupa gambar atau GIF"); return; }
    // GIF: max 2MB
    if (file.type === "image/gif" && file.size > 2 * 1024 * 1024) { setError("GIF maksimal 2MB"); return; }
    // Large images are auto-compressed — no hard limit for non-gif
    setError("");
    const gif = file.type === "image/gif";
    setIsGif(gif);
    setFileSizeBytes(file.size);
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = async (dataUrl) => {
    setSaving(true);
    try {
      const updated = await authStorage.updateProfile({ avatar: dataUrl });
      onUpdate?.(updated);
      setCropSrc(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Nama tidak boleh kosong"); return; }
    if (username && !/^[a-z0-9_]{3,20}$/i.test(username)) {
      setError("Username 3-20 karakter, hanya huruf/angka/underscore");
      return;
    }
    setSaving(true);
    try {
      const updated = await authStorage.updateProfile({ name: name.trim(), username: username.trim() });
      onUpdate?.(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <AnimatePresence mode="wait">
        {cropSrc ? (
          <motion.div key="cropper" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AvatarCropper
              src={cropSrc}
              isGif={isGif}
              fileSizeBytes={fileSizeBytes}
              onConfirm={handleCropConfirm}
              onCancel={() => setCropSrc(null)}
            />
          </motion.div>
        ) : (
          <motion.div key="avatar-edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
            {/* Avatar display */}
            <div className="relative group/avatar">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold overflow-hidden ring-4 ring-border shadow-2xl shadow-primary/20">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  (user.name || user.email || "U")[0].toUpperCase()
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-semibold">Ganti Foto</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*,.gif" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Name + title */}
            <div className="text-center">
              <p className="font-bold text-lg">{user.name}</p>
              {user.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
              <div className="mt-1.5 flex justify-center">
                <UserTitle role={user.role} />
              </div>
            </div>

            <p className="text-xs text-muted-foreground -mt-2 text-center px-4">
              Hover foto lalu klik untuk menggantinya. Foto besar otomatis dikompres ⚡
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile form */}
      {!cropSrc && (
        <form onSubmit={handleSave} className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nama tampilan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9 bg-secondary border-secondary"
              maxLength={40}
            />
          </div>

          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="username (a-z, 0-9, _)"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              className="pl-9 bg-secondary border-secondary"
              maxLength={20}
            />
          </div>

          {/* Email (readonly) */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={user.email} readOnly className="pl-9 bg-secondary border-secondary opacity-60 cursor-not-allowed" />
          </div>

          {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

          {success && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2 border border-green-500/20 text-center">
              ✅ Profil berhasil diperbarui!
            </motion.p>
          )}

          <Button type="submit" disabled={saving} className="w-full gap-2 bg-primary hover:bg-primary/90 font-bold">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Profil
          </Button>
        </form>
      )}
    </div>
  );
}