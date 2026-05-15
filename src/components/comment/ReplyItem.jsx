const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from "react";

import { authStorage } from "@/lib/auth";
import { rpgStorage } from "@/lib/rpgSystem";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Send, Smile, CornerDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserTitle from "@/components/auth/UserTitle";
import RasTitle from "@/components/rpg/RasTitle";
import EmojiText from "@/components/emoji/EmojiText";
import EmojiPicker from "@/components/emoji/EmojiPicker";
import { CommentAvatar } from "./CommentItem";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function ReplyItem({ reply, animeId, user, onDelete, onViewProfile, depth = 0 }) {
  const [subReplies, setSubReplies] = useState([]);
  const [showSubReplies, setShowSubReplies] = useState(false);
  const [subReplyCount, setSubReplyCount] = useState(0);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiBtnRef = useRef(null);

  // Load sub-reply count on mount
  useEffect(() => {
    if (depth >= 3) return; // max depth limit
    db.entities.CommentReply.filter({ comment_id: reply.id }).then((r) => {
      setSubReplyCount(r.length);
    }).catch(() => {});
  }, [reply.id, depth]);

  const loadSubReplies = async () => {
    const r = await db.entities.CommentReply.filter({ comment_id: reply.id }, "created_date", 50);
    setSubReplies(r);
    setShowSubReplies(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;
    setSubmitting(true);
    const freshUser = authStorage.getUser();
    const rpg = rpgStorage.get(freshUser.id);
    const newReply = await db.entities.CommentReply.create({
      comment_id: reply.id,
      anime_id: animeId,
      user_name: freshUser.name || freshUser.email,
      username: freshUser.username || "",
      user_id_local: freshUser.id,
      user_role: freshUser.role || "user",
      user_ras: rpg?.ras || "manusia",
      user_level: rpg?.level || 1,
      text: replyText.trim(),
    });
    setSubReplies((p) => [...p, newReply]);
    setSubReplyCount((c) => c + 1);
    setShowSubReplies(true);
    setReplyText("");
    setShowReplyBox(false);
    setSubmitting(false);
  };

  const canDelete = user && (reply.user_id_local === user.id || user.role === "admin");

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="group/reply"
    >
      <div className="flex items-start gap-2">
        <button onClick={() => onViewProfile?.(reply)} className="shrink-0 mt-0.5">
          <CommentAvatar name={reply.user_name} userId={reply.user_id_local} size="sm" />
        </button>
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1 flex-wrap">
              <button onClick={() => onViewProfile?.(reply)} className="text-xs font-semibold hover:text-primary transition-colors">
                {reply.user_name}
              </button>
              {reply.username && <span className="text-[10px] text-muted-foreground">@{reply.username}</span>}
              <UserTitle role={reply.user_role || "user"} size="xs" />
              {reply.user_ras && <RasTitle ras={reply.user_ras} size="xs" />}
              <span className="text-[10px] text-muted-foreground">{timeAgo(reply.created_date)}</span>
            </div>
            {canDelete && (
              <button onClick={() => onDelete(reply.id)}
                className="text-muted-foreground hover:text-destructive opacity-0 group-hover/reply:opacity-100 transition-opacity shrink-0 p-0.5">
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Text */}
          <p className="text-xs text-foreground/90 mt-0.5 leading-relaxed">
            <EmojiText text={reply.text} />
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1.5">
            {subReplyCount > 0 && (
              <button
                onClick={() => showSubReplies ? setShowSubReplies(false) : loadSubReplies()}
                className="text-[10px] font-semibold text-primary hover:text-primary/80 flex items-center gap-0.5"
              >
                <CornerDownRight className="w-2.5 h-2.5" />
                {subReplyCount} balasan
              </button>
            )}
            {user && depth < 3 && (
              <button
                onClick={() => setShowReplyBox((v) => !v)}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Balas
              </button>
            )}
          </div>

          {/* Sub-reply input */}
          <AnimatePresence>
            {showReplyBox && user && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <form onSubmit={handleSubmit} className="relative">
                  <Textarea
                    placeholder={`Balas @${reply.user_name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="bg-secondary border-0 text-xs resize-none min-h-[50px] pr-16"
                    maxLength={300}
                  />
                  <div className="absolute bottom-1.5 right-2 flex items-center gap-1">
                    <button type="button" ref={emojiBtnRef}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEmoji((v) => !v); }}
                      className="p-0.5 hover:text-primary text-muted-foreground">
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    <Button type="submit" size="icon" className="w-6 h-6" disabled={!replyText.trim() || submitting}>
                      <Send className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                  <AnimatePresence>
                    {showEmoji && (
                      <EmojiPicker anchorRef={emojiBtnRef} onSelect={(em) => setReplyText((t) => t + em)} onClose={() => setShowEmoji(false)} />
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested sub-replies */}
          <AnimatePresence>
            {showSubReplies && subReplies.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-2 space-y-2 border-l-2 border-border/60 pl-2.5"
              >
                {subReplies.map((sr) => (
                  <ReplyItem
                    key={sr.id}
                    reply={sr}
                    animeId={animeId}
                    user={user}
                    onDelete={async (id) => {
                      await db.entities.CommentReply.delete(id);
                      setSubReplies((p) => p.filter((x) => x.id !== id));
                      setSubReplyCount((c) => Math.max(0, c - 1));
                    }}
                    onViewProfile={onViewProfile}
                    depth={depth + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}