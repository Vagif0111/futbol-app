"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFavorites, toggleFavorite, type FavoriteItem, type FavoriteKind } from "@/lib/favorites";
import { EmptyState } from "@/components/StatusMessage";
import { FEATURED_LEAGUES } from "@/types/football";

const GROUPS: { kind: FavoriteKind; title: string }[] = [
  { kind: "team", title: "Takımlar" },
  { kind: "player", title: "Oyuncular" },
  { kind: "league", title: "Ligler" },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const remove = (item: FavoriteItem) => {
    setFavorites(toggleFavorite(item));
  };

  const hasAny = favorites.length > 0;

  return (
    <div className="p-4">
      <h1 className="mb-3 text-lg font-semibold text-ink">Favoriler</h1>

      {!hasAny && <EmptyState message="Henüz favori eklemediniz. Takım veya oyuncu sayfasından ekleyebilirsiniz." />}

      {GROUPS.map(({ kind, title }) => {
        const items = favorites.filter((f) => f.kind === kind);
        if (items.length === 0) return null;
        return (
          <section key={kind} className="mb-4">
            <p className="mb-1.5 text-xs font-medium text-muted">{title}</p>
            <div className="divide-y divide-border rounded-md border border-border bg-surface">
              {items.map((item) => (
                <div key={`${item.kind}-${item.id}`} className="flex items-center justify-between px-3 py-2">
                  <Link
                    href={
                      item.kind === "team" ? `/takim/${item.id}`
                      : item.kind === "player" ? `/oyuncu/${item.id}`
                      : `/lig/${item.id}`
                    }
                    className="flex min-w-0 flex-1 items-center gap-2 text-sm text-ink"
                  >
                    {item.logo && (
                      <Image src={item.logo} alt="" width={20} height={20} unoptimized className="rounded-full" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </Link>
                  <button onClick={() => remove(item)} className="ml-2 shrink-0 text-xs text-red-400">
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section>
        <p className="mb-1.5 text-xs font-medium text-muted">Tüm Ligler</p>
        <div className="divide-y divide-border rounded-md border border-border bg-surface">
          {FEATURED_LEAGUES.map((l) => {
            const isFav = favorites.some((f) => f.kind === "league" && f.id === l.id);
            return (
              <div key={l.id} className="flex items-center justify-between px-3 py-2">
                <Link href={`/lig/${l.id}`} className="text-sm text-ink">{l.name}</Link>
                <button
                  onClick={() =>
                    setFavorites(toggleFavorite({ kind: "league", id: l.id, name: l.name, logo: "" }))
                  }
                  className={`text-xs ${isFav ? "text-accent" : "text-muted"}`}
                >
                  {isFav ? "★" : "☆"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
