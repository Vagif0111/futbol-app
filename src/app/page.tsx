"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { FixtureListGrouped } from "@/components/MatchCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusMessage";
import { getFavorites, type FavoriteItem } from "@/lib/favorites";
import type { Fixture } from "@/types/football";

type Mode = "date" | "live";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, delta: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return toISODate(d);
}

function dateDisplayLabel(iso: string): string {
  const today = toISODate(new Date());
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  if (iso === today) return "Bugün";
  if (iso === yesterday) return "Dün";
  if (iso === tomorrow) return "Yarın";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", weekday: "short",
  });
}

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("date");
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const url = mode === "live" ? "/api/fixtures/live" : `/api/fixtures/date?date=${date}`;
  const poll = mode === "live" ? 60_000 : undefined;
  const { data, error, loading, refetch } = useApi<Fixture[]>(url, { pollMs: poll });

  const favLeagueIds = useMemo(
    () => favorites.filter((f) => f.kind === "league").map((f) => f.id),
    [favorites]
  );

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  return (
    <div>
      <header className="bg-gradient-to-b from-surface2 to-bg px-4 pb-3 pt-6">
        <h1 className="text-xl font-bold text-white">⚽ Futbol</h1>
      </header>

      {favorites.length > 0 && (
        <section className="mb-1 px-4">
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

      <div className="sticky top-0 z-[5] border-b border-border bg-bg/95 px-3 pt-3 backdrop-blur">
        <div className="flex gap-1">
          <button
            onClick={() => setMode("date")}
            className={`rounded-t-lg px-3 py-2 text-sm ${
              mode === "date" ? "border-b-2 border-accent font-semibold text-white" : "text-neutral-500"
            }`}
          >
            Tarihe Göre
          </button>
          <button
            onClick={() => setMode("live")}
            className={`rounded-t-lg px-3 py-2 text-sm ${
              mode === "live" ? "border-b-2 border-accent font-semibold text-white" : "text-neutral-500"
            }`}
          >
            Canlı
          </button>
        </div>

        {mode === "date" && (
          <div className="flex items-center justify-between gap-2 py-2">
            <button
              onClick={() => setDate((d) => addDays(d, -1))}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-neutral-400"
              aria-label="Önceki gün"
            >
              ‹
            </button>

            <div className="flex flex-1 items-center justify-center gap-2">
              <span className="text-sm font-medium text-white">{dateDisplayLabel(date)}</span>
              <input
                type="date"
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                style={{ colorScheme: "dark" }}
                className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-xs text-neutral-400"
                aria-label="Tarih seç"
              />
            </div>

            <button
              onClick={() => setDate((d) => addDays(d, 1))}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-neutral-400"
              aria-label="Sonraki gün"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && data && data.length === 0 && (
          <EmptyState message={mode === "live" ? "Şu anda canlı maç yok." : "Bu tarihte maç bulunamadı."} />
        )}
        {!loading && !error && data && data.length > 0 && (
          <FixtureListGrouped fixtures={data} favoriteLeagueIds={favLeagueIds} />
        )}
      </div>
    </div>
  );
}
