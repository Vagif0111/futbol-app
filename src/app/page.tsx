"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { MatchCard } from "@/components/MatchCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusMessage";
import { getFavorites, type FavoriteItem } from "@/lib/favorites";
import type { Fixture } from "@/types/football";

type Tab = "today" | "live" | "upcoming" | "recent";

const TAB_CONFIG: Record<Tab, { label: string; url: string; poll?: number }> = {
  today: { label: "Bugün", url: "/api/fixtures/today" },
  live: { label: "Canlı", url: "/api/fixtures/live", poll: 60_000 },
  upcoming: { label: "Yaklaşan", url: "/api/fixtures/upcoming" },
  recent: { label: "Son Maçlar", url: "/api/fixtures/recent" },
};

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
      <header className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-semibold text-white">Futbol</h1>
      </header>

      {favorites.length > 0 && (
        <section className="mb-3 px-4">
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

      <div className="flex gap-1 border-b border-border px-3">
        {(Object.keys(TAB_CONFIG) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm ${
              tab === t ? "border-b-2 border-accent font-medium text-white" : "text-neutral-500"
            }`}
          >
            {TAB_CONFIG[t].label}
          </button>
        ))}
      </div>

      <div className="space-y-2 p-3">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && data && data.length === 0 && (
          <EmptyState message="Bu bölümde gösterilecek maç yok." />
        )}
        {!loading && !error && data?.map((f) => <MatchCard key={f.id} fixture={f} />)}
      </div>
    </div>
  );
}
