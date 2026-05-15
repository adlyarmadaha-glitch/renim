import React, { useState, useEffect, useRef } from "react";
import { fsDb } from "@/lib/firestore";
import { authStorage } from "@/lib/auth";
import { rpgStorage } from "@/lib/rpgSystem";
import { Button } from "@/components/ui/button";
import { MessageCircle, LogIn, Lock, Smile, Send } from "lucide-react";
import EmojiPreviewTextarea from "@/components/emoji/EmojiPreviewTextarea";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth/AuthModal";
import UserTitle from "@/components/auth/UserTitle";
import RasTitle from "@/components/rpg/RasTitle";
import LevelBadge from "@/components/rpg/LevelBadge";
import UserProfileModal from "@/components/profile/UserProfileModal";
import CommentItem, { CommentAvatar } from "@/components/comment/CommentItem";
import EmojiPicker from "@/components/emoji/EmojiPicker";

export default function CommentSection({ animeId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => authStorage.getUser());
  const [showAuth, setShowAuth] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const emojiBtnRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setComments([]);
    // Fallback: if no response in 5s, stop loading
    const timeout = setTimeout(() => setLoading(false), 5000);
    const unsub = fsDb.Comment.subscribe(animeId, (docs) => {
      clearTimeout(timeout);
      setComments(docs);
      setLoading(false);
    });
    return () => { clearTimeout(timeout); unsub(); };
  }, [animeId]);

  useEffect(() => {
    const handler = () => setUser(authStorage.getUser());
    window.addEventListener("renime-auth-change", handler);
    return () => window.removeEventListener("renime-auth-change", handler);
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!user) { setShowAuth(true); return; }
    const trimText = text.trim();
    if (!trimText || submitting) return;
    setSubmitting(true);
    const freshUser = authStorage.getUser();
    const rpg = rpgStorage.get(freshUser.id);

    // Optimistic insert — add immediately to UI
    const optimisticId = `optimistic_${Date.now()}`;
    const optimisticComment = {
      id: optimisticId,
      anime_id: animeId,
      user_name: freshUser.name || freshUser.email || "Anonim",
      username: freshUser.username || "",
      user_id_local: freshUser.id || "",
      user_role: freshUser.role || "user",
      user_ras: rpg?.ras || "manusia",
      user_level: rpg?.level || 1,
      text: trimText,
      created_date: new Date(),
      _optimistic: true,
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setText("");

    fsDb.Comment.add({
      anime_id: animeId,
      user_name: optimisticComment.user_name,
      username: optimisticComment.username,
      user_id_local: optimisticComment.user_id_local,
      user_role: optimisticComment.user_role,
      user_ras: optimisticComment.user_ras,
      user_level: optimisticComment.user_level,
      text: trimText,
    }).catch(() => {
      // Rollback on failure
      setComments((prev) => prev.filter((c) => c.id !== optimisticId));
      setText(trimText);
    }).finally(() => setSubmitting(false));
  };

  const handleDelete = async (c) => {
    if (!user) return;
    if (c.user_id_local && c.user_id_local !== user.id && user.role !== "admin") return;
    await fsDb.Comment.remove(c.id);
  };

  const handleViewProfile = (c) => {
    if (!c.user_id_local) return;
    try {
      const users = JSON.parse(localStorage.getItem("renime_users") || "[]");
      const u = users.find((x) => x.id === c.user_id_local);
      if (u) setViewProfile({ id: u.id, name: u.name, username: u.username, role: u.role, avatar: u.avatar, createdAt: u.createdAt });
    } catch {}
  };

  const myRpg = user ? rpgStorage.get(user.id) : null;

  const sortedComments = [...comments].sort((a, b) => {