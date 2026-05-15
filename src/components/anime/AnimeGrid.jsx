import React from "react";
import AnimeCard from "./AnimeCard";

export default function AnimeGrid({ animeList = [], title, subtitle }) {
  return (
    <section>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h2 className="text-xl font-heading font-bold">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {animeList.map((anime, i) => (
          <AnimeCard key={anime.animeId || anime.slug || i} anime={anime} index={i} />
        ))}
      </div>
      {animeList.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Tidak ada anime ditemukan</p>
        </div>
      )}
    </section>
  );
}