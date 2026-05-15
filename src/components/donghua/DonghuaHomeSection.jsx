import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { donghuaApi, donghuaSeenNew } from "@/lib/donghuaApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Tv2, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function DonghuaCard({ item }) {
  const href = item.episodeSlug
    ? `/donghua/episode/${item.episodeSlug}`
    : `/donghua/${item.slug}`;
  const state = item.episodeSlug
    ? { animeSlug: item.slug, animeTitle: item.title, poster: item.poster }
    : {};
  const newKey = item.episodeSlug || item.slug || item.title;
  const isNew = !donghuaSeenNew.isSeen(newKey);

  const handleClick = () => {
    if (isNew) donghuaSeenNew.markSeen(newKey);
  };

  return (
    <Link to={href} state={state} onClick={handleClick}>
      <div className="group relative w-28 sm:w-32 shrink-0">
        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary relative shadow-md">
          {item.poster ? (
            <img src={item.poster} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy" referrerPolicy="no-referrer"
              onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Tv2 className="w-8 h-8 opacity-20" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          {isNew && (
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-green-500 text-[8px] text-white font-extrabold shadow">
              NEW
            </div>
          )}
          {item.score && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/70 text-yellow-400 text-[8px] font-bold">
              <Star className="w-2 h-2 fill-current" />{item.score}
            </div>
          )}
          {item.ep && (
            <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[8px] text-white/90 truncate font-semibold">{item.ep}</p>
            </div>
          )}
        </div>
        <p className="text-xs font-semibold line-clamp-2 leading-tight mt-1.5 group-hover:text-primary transition-colors">{item.title}</p>
      </div>
    </Link>
  );
}

export default function DonghuaHomeSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["donghua-home-v2"],
    queryFn: () => donghuaApi.getHome(),
    staleTime: 1000 * 60 * 3,
  });

  const items = (data?.latestRelease || data?.data?.latestRelease || []).slice(0, 12);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-extrabold text-base flex items-center gap-2">
          🐉 <span>Donghua Terbaru</span>
        </h2>
        <Link to="/donghua" className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold">
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="w-28 sm:w-32 shrink-0">
              <Skeleton className="aspect-[3/4] rounded-xl" />
              <Skeleton className="h-3 w-3/4 mt-1.5" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? null : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {items.map((item, i) => (
            <motion.div key={item.slug || i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <DonghuaCard item={item} />
            </motion.div>
          ))}
          <Link to="/donghua" className="w-24 sm:w-28 shrink-0 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors aspect-[3/4]">
            <ArrowRight className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Lihat Semua</span>
          </Link>
        </div>
      )}
    </section>
  );
}