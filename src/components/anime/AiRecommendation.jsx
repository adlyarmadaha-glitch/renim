const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { Sparkles, Loader2, ChevronRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AiRecommendation({ currentAnimeTitle, genres = [] }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);

  const getRecommendations = async () => {
    setLoading(true);
    setAsked(true);
    const genreStr = genres.length > 0 ? genres.join(", ") : "Action, Adventure";
    try {
      const result = await db.integrations.Core.InvokeLLM({
        prompt: `Kamu adalah pakar anime Indonesia. Berikan tepat 5 rekomendasi anime yang mirip atau cocok untuk penonton "${currentAnimeTitle || "anime populer"}" dengan genre: ${genreStr}.
        
        Rules:
        - Pilih anime yang NYATA, POPULER, dan TERKENAL di Indonesia
        - Jangan rekomendasikan anime yang sama dengan judul input
        - searchQuery adalah judul anime dalam Bahasa Inggris atau Jepang yang umum dipakai untuk pencarian (contoh: "Fullmetal Alchemist Brotherhood", "Sword Art Online", "Attack on Titan")
        - Berikan alasan singkat dalam Bahasa Indonesia (1 kalimat, max 100 karakter)
        - Pastikan 5 item, tidak kurang tidak lebih`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  reason: { type: "string" },
                  searchQuery: { type: "string" },
                  genre: { type: "string" },
                },
                required: ["title", "reason", "searchQuery"],
              },
            },
          },
          required: ["recommendations"],
        },
      });
      setRecommendations(result?.recommendations?.slice(0, 5) || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Rekomendasi AI</h3>
            <p className="text-xs text-muted-foreground">Anime serupa untukmu</p>
          </div>
        </div>
        {!asked && (
          <Button
            size="sm"
            onClick={getRecommendations}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Rekomendasikan
          </Button>
        )}
        {asked && !loading && (
          <Button
            size="sm"
            variant="outline"
            onClick={getRecommendations}
            className="text-xs"
          >
            Coba lagi
          </Button>
        )}
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-4 text-muted-foreground"
          >
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <p className="text-sm">AI sedang mencari rekomendasi terbaik...</p>
          </motion.div>
        )}

        {recommendations && !loading && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {recommendations.map((rec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link to={`/cari?q=${encodeURIComponent(rec.searchQuery || rec.title)}`}>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all group">
                    <div className="w-6 h-6 shrink-0 rounded-md bg-primary/15 text-primary flex items-center justify-center text-xs font-extrabold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{rec.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rec.reason}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors mt-0.5" />
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}

        {!asked && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Klik tombol untuk mendapatkan rekomendasi anime serupa bertenaga AI ✨
          </p>
        )}
      </AnimatePresence>
    </section>
  );
}