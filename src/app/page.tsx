"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApi } from "@/hooks/useApi";
import { FixtureListGrouped } from "@/components/MatchCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusMessage";
import { getFavorites, type FavoriteItem } from "@/lib/favorites";
import { FEATURED_LEAGUES, leagueLogoUrl } from "@/types/football";
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
  const full = new Date(iso + "T00:00:00Z").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  if (iso === today) return `Bugün, ${full}`;
  if (iso === yesterday) return `Dün, ${full}`;
  if (iso === tomorrow) return `Yarın, ${full}`;
  return full;
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
      <header className="flex items-center justify-between bg-ink px-4 py-4">
        <h1 className="text-2xl font-bold text-white">Futbol</h1>
        <Link href="/favoriler" aria-label="Favoriler" className="text-xl text-white">☆</Link>
      </header>

      <div className="flex gap-2 overflow-x-auto px-3 py-3">
        {FEATURED_LEAGUES.map((l) => (
          <Link
            key={l.id}
            href={`/lig/${l.id}`}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 shadow-card"
          >
            <Image src={leagueLogoUrl(l.id)} alt="" width={18} height={18} unoptimized />
            <span className="text-xs font-medium text-ink">{l.name}</span>
          </Link>
        ))}
      </div>

      {favorites.some((f) => f.kind === "team" || f.kind === "player") && (
        <section className="mb-1 px-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {favorites
              .filter((f) => f.kind === "team" || f.kind === "player")
              .map((f) => (
                <Link
                  key={`${f.kind}-${f.id}`}
                  href={f.kind === "team" ? `/takim/${f.id}` : `/oyuncu/${f.id}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-ink shadow-card"
                >
                  {f.name}
                </Link>
              ))}
          </div>
        </section>
      )}

      <div className="px-3 pb-1">
        <div className="mb-2 flex gap-1">
          <button
            onClick={() => setMode("date")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              mode === "date" ? "bg-ink text-white" : "border border-border bg-surface text-muted"
            }`}
          >
            Tarihe Göre
          </button>
          <button
            onClick={() => setMode("live")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              mode === "live" ? "bg-ink text-white" : "border border-border bg-surface text-muted"
            }`}
          >
            Canlı
          </button>
        </div>

        {mode === "date" && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-full border border-border bg-surface px-2 py-2 shadow-card">
            <button
              onClick={() => setDate((d) => addDays(d, -1))}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted"
              aria-label="Önceki gün"
            >
              ‹
            </button>

            <div className="relative flex flex-1 items-center justify-center gap-1.5">
              <span className="text-sm font-medium text-ink">📅 {dateDisplayLabel(date)}</span>
              <input
                type="date"
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="absolute inset-0 opacity-0"
                aria-label="Tarih seç"
              />
            </div>

            <button
              onClick={() => setDate((d) => addDays(d, 1))}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted"
              aria-label="Sonraki gün"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="px-3 pb-3">
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
