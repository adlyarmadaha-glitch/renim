import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookmarkStorage } from "@/lib/localStorage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, PlayCircle, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState(() => bookmarkStorage.list());

  const handleDelete = (animeId) => {
    bookmarkStorage.remove(animeId);
    setBookmarks(bookmarkStorage.list());
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Bookmark className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-heading font-bold">Bookmark</h1>
        {bookmarks.length > 0 && (
          <Badge variant="outline" className="text-xs">{bookmarks.length}</Badge>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-24">
          <Bookmark className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium mb-1">Belum ada bookmark</p>
          <p className="text-sm text-muted-foreground">
            Simpan anime favoritmu dari halaman detail
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AnimatePresence>
            {bookmarks.map((bm, i) => (
              <motion.div
                key={bm.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.03 }}
                className="group relative"
              >
                <Link to={`/anime/${encodeURIComponent(bm.anime_id)}`}>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary ring-1 ring-border/50 relative">
                    {bm.poster ? (
                      <img
                        src={bm.poster}
                        alt={bm.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {bm.score && parseFloat(bm.score) > 0 && (
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[11px] text-yellow-400 flex items-center gap-0.5 font-bold">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {parseFloat(bm.score).toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 px-0.5">
                    <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {bm.title}
                    </h3>
                    {bm.status && (
                      <p className="text-xs text-muted-foreground mt-0.5">{bm.status}</p>
                    )}
                  </div>
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-1.5 left-1.5 w-7 h-7 bg-black/60 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                  onClick={() => handleDelete(bm.anime_id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}