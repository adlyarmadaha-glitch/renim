import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, Bookmark, Star, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { animeApi } from "@/lib/animeApi";
import { bookmarkStorage } from "@/lib/localStorage";

// Poster berkualitas tinggi dari sumber terpercaya — selalu fresh
const FRESH_BANNERS = [
  {
    animeId: "sousou-no-frieren",
    title: "Frieren: Beyond Journey's End",
    synopsis: "Setelah mengalahkan Raja Iblis, penyihir elf Frieren harus menghadapi makna kehilangan dan keabadian.",
    poster: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
    score: "9.0", type: "TV", status: "Selesai",
    genres: ["Adventure", "Drama", "Fantasy"],
  },
  {
    animeId: "dungeon-ni-deai-wo-motomeru-no-wa-machigatteiru-darou-ka-v",
    title: "DanMachi Season 5",
    synopsis: "Bell Cranel dan petualangan baru di Dungeon bersama Familia-nya menghadapi ancaman yang lebih besar.",
    poster: "https://cdn.myanimelist.net/images/anime/1948/142839l.jpg",
    score: "8.0", type: "TV", status: "Ongoing",
    genres: ["Action", "Adventure", "Fantasy"],
  },
  {
    animeId: "fullmetal-alchemist-brotherhood",
    title: "Fullmetal Alchemist: Brotherhood",
    synopsis: "Edward dan Alphonse Elric mencari Philosopher's Stone untuk memulihkan tubuh mereka.",
    poster: "https://cdn.myanimelist.net/images/anime/1223/96541l.jpg",
    score: "9.1", type: "TV", status: "Selesai",
    genres: ["Action", "Adventure", "Fantasy"],
  },
  {
    animeId: "shingeki-no-kyojin",
    title: "Attack on Titan: The Final Season",
    synopsis: "Perang dunia meletus saat Eren menggunakan Rumbling untuk menghancurkan dunia di luar tembok.",
    poster: "https://cdn.myanimelist.net/images/anime/1948/120625l.jpg",
    score: "9.0", type: "TV", status: "Selesai",
    genres: ["Action", "Drama", "Military"],
  },
  {
    animeId: "demon-slayer-kimetsu-no-yaiba",
    title: "Demon Slayer: Kimetsu no Yaiba",
    synopsis: "Tanjiro Kamado memulai perjalanan panjang menjadi pemburu iblis demi mengobati adiknya Nezuko.",
    poster: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    score: "8.7", type: "TV", status: "Ongoing",
    genres: ["Action", "Supernatural", "Fantasy"],
  },
  {
    animeId: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    synopsis: "Yuji Itadori bergabung dengan organisasi rahasia penyihir kutukan untuk menyelamatkan dunia.",
    poster: "https://cdn.myanimelist.net/images/anime/1792/138022l.jpg",
    score: "8.7", type: "TV", status: "Ongoing",
    genres: ["Action", "Fantasy", "School"],
  },
  {
    animeId: "vinland-saga",
    title: "Vinland Saga Season 2",
    synopsis: "Thorfinn kini menjadi budak dan memulai perjalanan menebus dosa-dosanya di era Viking.",
    poster: "https://cdn.myanimelist.net/images/anime/1170/124312l.jpg",
    score: "9.0", type: "TV", status: "Selesai",
    genres: ["Action", "Adventure", "Historical"],
  },
  {
    animeId: "one-piece",
    title: "One Piece",
    synopsis: "Monkey D. Luffy bersama kru Topi Jerami berlayar menuju Grand Line untuk mencari harta One Piece.",
    poster: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    score: "8.7", type: "TV", status: "Ongoing",
    genres: ["Action", "Adventure", "Comedy"],
  },
];

const ACCENT_COLORS = [
  { from: "#7C3AED", via: "#4F46E5", glow: "#7C3AED" },
  { from: "#0EA5E9", via: "#2563EB", glow: "#0EA5E9" },
  { from: "#DC2626", via: "#B91C1C", glow: "#DC2626" },
  { from: "#D97706", via: "#B45309", glow: "#D97706" },
  { from: "#059669", via: "#047857", glow: "#059669" },
  { from: "#DB2777", via: "#BE185D", glow: "#DB2777" },
  { from: "#7C3AED", via: "#6D28D9", glow: "#7C3AED" },
  { from: "#EA580C", via: "#C2410C", glow: "#EA580C" },
];

function BannerSlide({ anime, index }) {
  const [bookmarked, setBookmarked] = useState(() => bookmarkStorage.isBookmarked(anime.animeId));
  const [imgOk, setImgOk] = useState(true);
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  const toggle = (e) => {
    e.preventDefault();
    if (bookmarked) {
      bookmarkStorage.remove(anime.animeId);
      setBookmarked(false);
    } else {
      bookmarkStorage.add({ anime_id: anime.animeId, title: anime.title, poster: anime.poster, status: anime.status, score: anime.score });
      setBookmarked(true);
    }
  };

  return (
    <div className="absolute inset-0">
      {/* Background poster — full bleed, no crossOrigin */}