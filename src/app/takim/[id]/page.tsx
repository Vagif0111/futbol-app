"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApi } from "@/hooks/useApi";
import { MatchCard } from "@/components/MatchCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusMessage";
import { toggleFavorite, isFavorite } from "@/lib/favorites";
import type { Fixture, TeamProfile, TeamStatistics } from "@/types/football";

type Tab = "squad" | "stats" | "recent" | "upcoming";

interface SquadPlayer {
  id: number;
  name: string;
  photo: string;
  position: string | null;
  number: number | null;
}

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const teamId = Number(id);
  const [tab, setTab] = useState<Tab>("squad");
  const [fav, setFav] = useState(false);

  const { data: team, error, loading } = useApi<TeamProfile>(`/api/teams/${teamId}`);
  const { data: squad, loading: squadLoading } = useApi<SquadPlayer[]>(
    tab === "squad" ? `/api/teams/${teamId}/squad` : null
  );
  const { data: stats, loading: statsLoading, error: statsError } = useApi<TeamStatistics>(
    tab === "stats" ? `/api/teams/${teamId}/statistics` : null
  );
  const { data: fixtures, loading: fxLoading } = useApi<Fixture[]>(
    tab === "recent" ? `/api/fixtures/recent?team=${teamId}`
      : tab === "upcoming" ? `/api/fixtures/upcoming?team=${teamId}`
      : null
  );

  useEffect(() => {
    setFav(isFavorite("team", teamId));
  }, [teamId]);

  if (loading) return <LoadingState />;
  if (error || !team) return <ErrorState message={error ?? "Takım bulunamadı."} />;

  return (
    <div>
      <div className="flex flex-col items-center gap-2 border-b border-border bg-ink p-6">
        <Image src={team.logo} alt="" width={56} height={56} unoptimized />
        <h1 className="text-lg font-semibold text-white">{team.name}</h1>
        <p className="text-xs text-white/70">
          {team.country ?? "—"}{team.founded ? ` · ${team.founded}` : ""}
        </p>
        {team.venue?.name && (
          <p className="text-xs text-white/70">{team.venue.name}, {team.venue.city}</p>
        )}
        <button
          onClick={() => setFav(toggleFavorite({ kind: "team", id: teamId, name: team.name, logo: team.logo }).some(f => f.id === teamId))}
          className={`mt-1 rounded-full border px-4 py-1.5 text-xs ${
            fav ? "border-accent text-accent" : "border-white/30 text-white/80"
          }`}
        >
          {fav ? "★ Favorilerde" : "☆ Favorilere ekle"}
        </button>
      </div>

      <div className="flex border-b border-border overflow-x-auto">
        {([["squad", "Kadro"], ["stats", "İstatistik"], ["recent", "Son Maçlar"], ["upcoming", "Gelecek Maçlar"]] as [Tab, string][]).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`shrink-0 px-3 py-2.5 text-sm ${
                tab === key ? "border-b-2 border-accent font-medium text-ink" : "text-muted"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {tab === "squad" && (
        <div className="divide-y divide-border bg-surface">
          {squadLoading && <LoadingState />}
          {!squadLoading && squad?.length === 0 && <EmptyState message="Kadro verisi bulunamadı." />}
          {!squadLoading && squad?.map((p) => (
            <Link key={p.id} href={`/oyuncu/${p.id}`} className="flex items-center gap-3 px-4 py-2.5">
              <Image src={p.photo} alt="" width={32} height={32} unoptimized className="rounded-full" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{p.name}</p>
                <p className="text-xs text-muted">{p.position ?? "—"}</p>
              </div>
              {p.number != null && <span className="text-xs text-muted">#{p.number}</span>}
            </Link>
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div className="p-3">
          {statsLoading && <LoadingState />}
          {!statsLoading && statsError && <ErrorState message={statsError} />}
          {!statsLoading && !statsError && !stats && (
            <EmptyState message="Bu takım için istatistik verisi yok." />
          )}
          {!statsLoading && stats && (
            <>
              <p className="mb-2 text-xs text-muted">{stats.league.name} · {stats.league.season}</p>
              <div className="grid grid-cols-3 gap-2.5">
                <StatBox label="Oynanan" value={stats.played} />
                <StatBox label="Galibiyet" value={stats.wins} />
                <StatBox label="Beraberlik" value={stats.draws} />
                <StatBox label="Mağlubiyet" value={stats.loses} />
                <StatBox label="Attığı Gol" value={stats.goalsFor} />
                <StatBox label="Yediği Gol" value={stats.goalsAgainst} />
                <StatBox label="Averaj" value={stats.goalsFor - stats.goalsAgainst} />
                <StatBox label="Gol Yemedi" value={stats.cleanSheets} />
                <StatBox label="Gol Atamadı" value={stats.failedToScore} />
              </div>
              {stats.formStreak && (
                <p className="mt-3 text-xs text-muted">
                  Son form: <span className="font-medium text-ink">{stats.formStreak}</span>
                </p>
              )}
            </>
          )}
        </div>
      )}

      {(tab === "recent" || tab === "upcoming") && (
        <div className="space-y-2 p-3">
          {fxLoading && <LoadingState />}
          {!fxLoading && fixtures?.length === 0 && <EmptyState message="Maç bulunamadı." />}
          {!fxLoading && fixtures?.map((f) => <MatchCard key={f.id} fixture={f} />)}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-center shadow-card">
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
