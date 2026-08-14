"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { FixtureListGrouped } from "@/components/MatchCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusMessage";
import { getFavorites, type FavoriteItem } from "@/lib/favorites";
import type { Fixture } from "@/types/football";

type Tab = "today" | "tomorrow" | "live" | "recent";

const TAB_CONFIG: Record<Tab, { label: string; url: string; poll?: number }> = {
  today: { label: "Bugün", url: "/api/fixtures/today" },
  tomorrow: { label: "Yarın", url: "/api/fixtures/tomorrow" },
  live: { label: "Canlı", url: "/api/fixtures/live", poll: 60_000 },
  recent: { label: "Son Maçlar", url: "/api/fixtures/recent" },
};

const todayLabel = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("today");
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const cfg = TAB_CONFIG[tab];
  const { data, error, loading, refetch } = useApi<Fixture[]>(cfg.url, { pollMs: cfg.poll });

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  return (
    <div>
      <header className="bg-gradient-to-b from-surface2 to-bg px-4 pb-4 pt-6">
        <h1 className="text-xl font-bold text-white">⚽ Futbol</h1>
        <p className="mt-0.5 text-xs capitalize text-neutral-500">{todayLabel}</p>
      </header>

      {favorites.length > 0 && (
        <section className="mb-1 px-4 pt-3">
          <p className="mb-1.5 text-xs font-medium text-neutral-500">Favoriler</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {favorites.map((f) => (
              <Link
                key={`${f.kind}-${f.id}`}
                href={f.kind === "team" ? `/takim/${f.id}` : f.kind === "player" ? `/oyuncu/${f.id}` : "#"}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-neutral-300"
              >
                {f.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="sticky top-0 z-[5] flex gap-1 border-b border-border bg-bg/95 px-3 pt-3 backdrop-blur">
        {(Object.keys(TAB_CONFIG) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-3 py-2 text-sm transition-colors ${
              tab === t
                ? "border-b-2 border-accent font-semibold text-white"
                : "text-neutral-500"
            }`}
          >
            {TAB_CONFIG[t].label}
          </button>
        ))}
      </div>

      <div className="p-3">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && data && data.length === 0 && (
          <EmptyState message="Bu bölümde gösterilecek maç yok." />
        )}
        {!loading && !error && data && data.length > 0 && (
          <FixtureListGrouped
            fixtures={data}
            favoriteLeagueIds={favorites.filter((f) => f.kind === "league").map((f) => f.id)}
          />
        )}
      </div>
    </div>
  );
}
