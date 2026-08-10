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
const currentYear = new Date().getFullYear();

export default function LeaguePage() {
  const { id } = useParams<{ id: string }>();
  const leagueId = Number(id);
  const leagueMeta = FEATURED_LEAGUES.find((l) => l.id === leagueId);
  const [tab, setTab] = useState<Tab>("standings");

  return (
    <div>
      <div className="border-b border-border p-4">
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
              tab === key ? "border-b-2 border-accent font-medium text-white" : "text-neutral-500"
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
  const { data, error, loading, refetch } = useApi<StandingRow[]>(
    `/api/standings?league=${leagueId}&season=${currentYear}`
  );
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data || data.length === 0) return <EmptyState message="Bu lig için puan durumu verisi yok." />;

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-neutral-500">
          <th className="w-6 py-1.5">#</th>
          <th className="py-1.5">Takım</th>
          <th className="w-6 py-1.5 text-center">O</th>
          <th className="w-6 py-1.5 text-center">Av</th>
          <th className="w-8 py-1.5 text-center">P</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.team.id} className="border-t border-border">
            <td className="py-1.5 text-neutral-500">{row.rank}</td>
            <td className="py-1.5">
              <Link href={`/takim/${row.team.id}`} className="flex items-center gap-1.5 text-neutral-200">
                <Image src={row.team.logo} alt="" width={16} height={16} unoptimized />
                <span className="truncate">{row.team.name}</span>
              </Link>
            </td>
            <td className="py-1.5 text-center text-neutral-400">{row.played}</td>
            <td className="py-1.5 text-center text-neutral-400">{row.goalsFor - row.goalsAgainst}</td>
            <td className="py-1.5 text-center font-medium text-white">{row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
