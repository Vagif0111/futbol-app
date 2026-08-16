"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApi } from "@/hooks/useApi";
import { MatchCard } from "@/components/MatchCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusMessage";
import { FEATURED_LEAGUES } from "@/types/football";
import type { Fixture, StandingRow } from "@/types/football";

type Tab = "upcoming" | "recent" | "standings";

export default function LeaguePage() {
  const { id } = useParams<{ id: string }>();
  const leagueId = Number(id);
  const leagueMeta = FEATURED_LEAGUES.find((l) => l.id === leagueId);
  const [tab, setTab] = useState<Tab>("standings");

  return (
    <div>
      <div className="border-b border-border bg-ink p-5">
        <h1 className="text-lg font-semibold text-white">{leagueMeta?.name ?? "Lig"}</h1>
      </div>

      <div className="flex border-b border-border">
        {([
          ["standings", "Puan Durumu"],
          ["upcoming", "Yaklaşan"],
          ["recent", "Son Maçlar"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 text-sm ${
              tab === key ? "border-b-2 border-accent font-medium text-ink" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-3">
        {tab === "standings" && <StandingsTab leagueId={leagueId} />}
        {tab === "upcoming" && <FixturesTab leagueId={leagueId} kind="upcoming" />}
        {tab === "recent" && <FixturesTab leagueId={leagueId} kind="recent" />}
      </div>
    </div>
  );
}

function StandingsTab({ leagueId }: { leagueId: number }) {
  const { data, error, loading, refetch } = useApi<{ season: number; rows: StandingRow[] }>(
    `/api/standings?league=${leagueId}`
  );
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data || data.rows.length === 0) return <EmptyState message="Bu lig için puan durumu verisi yok." />;

  return (
    <div>
      <p className="mb-2 text-xs text-muted">Sezon {data.season}</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
      <table className="w-full min-w-[420px] text-xs">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="w-6 py-2 pl-2">#</th>
            <th className="py-2">Takım</th>
            <th className="w-6 py-2 text-center">O</th>
            <th className="w-6 py-2 text-center">G</th>
            <th className="w-6 py-2 text-center">B</th>
            <th className="w-6 py-2 text-center">M</th>
            <th className="w-8 py-2 text-center">AG</th>
            <th className="w-8 py-2 text-center">YG</th>
            <th className="w-8 py-2 text-center">Av</th>
            <th className="w-8 py-2 pr-2 text-center">P</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={row.team.id} className="border-b border-border last:border-0">
              <td className="py-2 pl-2 text-muted">{row.rank}</td>
              <td className="py-2">
                <Link href={`/takim/${row.team.id}`} className="flex items-center gap-1.5 text-ink">
                  <Image src={row.team.logo} alt="" width={16} height={16} unoptimized />
                  <span className="truncate">{row.team.name}</span>
                </Link>
              </td>
              <td className="py-2 text-center text-muted">{row.played}</td>
              <td className="py-2 text-center text-muted">{row.win}</td>
              <td className="py-2 text-center text-muted">{row.draw}</td>
              <td className="py-2 text-center text-muted">{row.lose}</td>
              <td className="py-2 text-center text-muted">{row.goalsFor}</td>
              <td className="py-2 text-center text-muted">{row.goalsAgainst}</td>
              <td className="py-2 text-center text-muted">
                {row.goalsFor - row.goalsAgainst > 0 ? "+" : ""}
                {row.goalsFor - row.goalsAgainst}
              </td>
              <td className="py-2 pr-2 text-center font-semibold text-ink">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function FixturesTab({ leagueId, kind }: { leagueId: number; kind: "upcoming" | "recent" }) {
  const { data, error, loading, refetch } = useApi<Fixture[]>(
    `/api/fixtures/${kind}?league=${leagueId}`
  );
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data || data.length === 0) return <EmptyState message="Maç bulunamadı." />;

  return (
    <div className="space-y-2">
      {data.map((f) => <MatchCard key={f.id} fixture={f} />)}
    </div>
  );
}
