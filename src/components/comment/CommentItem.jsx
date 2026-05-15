import React, { useState, useEffect, useRef } from "react";
import { fsDb } from "@/lib/firestore";
import { authStorage } from "@/lib/auth";
import { rpgStorage } from "@/lib/rpgSystem";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Send, ChevronDown, ChevronUp, Smile, Heart } from "lucide-react";
import EmojiPreviewTextarea from "@/components/emoji/EmojiPreviewTextarea";
import { motion, AnimatePresence } from "framer-motion";
import UserTitle from "@/components/auth/UserTitle";
import RasTitle from "@/components/rpg/RasTitle";
import LevelBadge from "@/components/rpg/LevelBadge";
import EmojiText from "@/components/emoji/EmojiText";
import EmojiPicker from "@/components/emoji/EmojiPicker";
import ReplyItem from "@/components/comment/ReplyItem";
import { getCustomBadge } from "@/pages/AdminPanel";
import { getUserRole } from "@/lib/customRoles";
import CustomBadgeDisplay from "@/components/profile/CustomBadgeDisplay";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export function CommentAvatar({ name, userId, size = "md" }) {
  const src = (() => {
    if (!userId) return null;
    try {
      const users = JSON.parse(localStorage.getItem("renime_users") || "[]");
      return users.find((x) => x.id === userId)?.avatar || null;
    } catch { return null; }
  })();

  const cls = size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-xs";

  if (src) return <img src={src} alt={name} className={`${cls} rounded-full object-cover shrink-0 ring-2 ring-border`} />;
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-border`}>
      {(name || "A")[0].toUpperCase()}
    </div>
  );
}

export default function CommentItem({ comment, animeId, user, onDelete, onViewProfile }) {
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiReply, setShowEmojiReply] = useState(false);
  const emojiReplyBtnRef = useRef(null);

  const likeKey = `renime_clike_${comment.id}`;
  const likedKey = `renime_cliked_${comment.id}`;
  const [liked, setLiked] = useState(() => localStorage.getItem(likedKey) === "1");
  const [likeCount, setLikeCount] = useState(() => parseInt(localStorage.getItem(likeKey) || "0"));

  const handleLike = () => {
    if (!user) return;
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLiked(newLiked);
    setLikeCount(newCount);
    localStorage.setItem(likedKey, newLiked ? "1" : "0");
    localStorage.setItem(likeKey, String(newCount));
  };

  useEffect(() => {
    fsDb.CommentReply.list(comment.id).then((r) => {
      setReplyCount(r.length);
    }).catch(() => {});
  }, [comment.id]);

  const loadReplies = async () => {
    const r = await fsDb.CommentReply.list(comment.id);
    setReplies(r);
    setShowReplies(true);
  };

  const toggleReplies = () => {
    if (showReplies) {
      setShowReplies(false);
    } else {
      loadReplies();
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;
    setSubmitting(true);
    const freshUser = authStorage.getUser();
    const rpg = rpgStorage.get(freshUser.id);
    const newReply = await fsDb.CommentReply.add({
      comment_id: comment.id,
      anime_id: animeId,
      user_name: freshUser.name || freshUser.email,
      username: freshUser.username || "",
      user_id_local: freshUser.id,
      user_role: freshUser.role || "user",
      user_ras: rpg?.ras || "manusia",
      user_level: rpg?.level || 1,
      text: replyText.trim(),
    });