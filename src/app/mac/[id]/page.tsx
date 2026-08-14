"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusMessage";
import { LiveBadge } from "@/components/LiveBadge";
import { isLive } from "@/types/football";
import type { Fixture, MatchEvent, LineupsResponse, StatItem } from "@/types/football";

type Section = "events" | "lineups" | "stats";

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [section, setSection] = useState<Section>("events");

  const { data: fixture, error, loading } = useApi<Fixture>(`/api/fixtures/${id}`, {
    pollMs: 60_000,
  });
  const live = fixture ? isLive(fixture.status.short) : false;

  if (loading) return <LoadingState />;
  if (error || !fixture) return <ErrorState message={error ?? "Maç bulunamadı."} />;

  return (
    <div>
      <div className="border-b border-border bg-gradient-to-b from-surface2 to-bg p-5">
        <p className="mb-2 text-center text-xs text-neutral-500">
          {fixture.league.name} · {fixture.league.round}
        </p>
        <div className="flex items-center justify-between">
          <TeamHeader name={fixture.home.name} logo={fixture.home.logo} />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-white">
              {fixture.goalsHome ?? "-"} : {fixture.goalsAway ?? "-"}
            </span>
            {live ? (
              <LiveBadge minute={fixture.status.elapsed} />
            ) : (
              <span className="text-xs text-neutral-500">{fixture.status.long}</span>
            )}
          </div>
          <TeamHeader name={fixture.away.name} logo={fixture.away.logo} />
        </div>
      </div>

      <div className="flex border-b border-border">
        {([
          ["events", "Olaylar"],
          ["lineups", "Kadrolar"],
          ["stats", "İstatistik"],
        ] as [Section, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`flex-1 py-2.5 text-sm ${
              section === key ? "border-b-2 border-accent font-medium text-white" : "text-neutral-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-3">
        {section === "events" && <EventsTab fixtureId={fixture.id} />}
        {section === "lineups" && <LineupsTab fixtureId={fixture.id} />}
        {section === "stats" && <StatsTab fixtureId={fixture.id} home={fixture.home.name} away={fixture.away.name} />}
      </div>
    </div>
  );
}

function TeamHeader({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="flex w-24 flex-col items-center gap-1.5 text-center">
      <Image src={logo} alt="" width={36} height={36} unoptimized />
      <span className="text-xs text-neutral-300">{name}</span>
    </div>
  );
}

function EventsTab({ fixtureId }: { fixtureId: number }) {
  const { data, error, loading, refetch } = useApi<MatchEvent[]>(
    `/api/fixtures/${fixtureId}/events`,
    { pollMs: 60_000 }
  );
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data || data.length === 0) return <EmptyState message="Henüz maç olayı yok." />;

  const icon = (type: string, detail: string) => {
    if (type === "Goal") return "⚽";
    if (type === "Card" && detail.includes("Yellow")) return "🟨";
    if (type === "Card" && detail.includes("Red")) return "🟥";
    if (type === "subst") return "🔄";
    return "•";
  };

  return (
    <ul className="space-y-2.5">
      {data.map((e, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className="w-8 shrink-0 text-neutral-500">
            {e.minute}{e.extraMinute ? `+${e.extraMinute}` : ""}'
          </span>
          <span>{icon(e.type, e.detail)}</span>
          <span className="text-neutral-200">
            {e.player.name ?? "Bilinmiyor"}
            {e.assist.name && <span className="text-neutral-500"> (asist: {e.assist.name})</span>}
            <span className="block text-xs text-neutral-500">{e.team.name}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function LineupsTab({ fixtureId }: { fixtureId: number }) {
  const { data, error, loading, refetch } = useApi<LineupsResponse>(
    `/api/fixtures/${fixtureId}/lineups`,
    { pollMs: 60_000 }
  );
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data || !data.official) {
    return (
      <EmptyState message="Kadro henüz resmi olarak açıklanmadı. Açıklandığında otomatik görünecek." />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {[data.home, data.away].map((team, idx) =>
        team ? (
          <div key={idx}>
            <p className="mb-1.5 text-xs font-medium text-neutral-400">
              {team.team.name} · {team.formation ?? "—"}
            </p>
            <ul className="space-y-1 text-xs text-neutral-300">
              {team.startXI.map((p) => (
                <li key={p.id}>
                  {p.number}. {p.name} <span className="text-neutral-500">({p.position})</span>
                </li>
              ))}
            </ul>
            {team.substitutes.length > 0 && (
              <>
                <p className="mb-1 mt-2 text-[11px] text-neutral-500">Yedekler</p>
                <ul className="space-y-1 text-xs text-neutral-500">
                  {team.substitutes.map((p) => (
                    <li key={p.id}>{p.number}. {p.name}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : null
      )}
    </div>
  );
}

function StatsTab({ fixtureId, home, away }: { fixtureId: number; home: string; away: string }) {
  const { data, error, loading, refetch } = useApi<{ home: StatItem[]; away: StatItem[] }>(
    `/api/fixtures/${fixtureId}/statistics`
  );
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data || data.home.length === 0) return <EmptyState message="Bu maç için istatistik verisi yok." />;

  return (
    <div className="space-y-2.5">
      {data.home.map((stat, i) => {
        const awayStat = data.away[i];
        return (
          <div key={stat.type} className="text-sm">
            <div className="mb-0.5 flex justify-between text-neutral-300">
              <span>{stat.home ?? "-"}</span>
              <span className="text-xs text-neutral-500">{stat.type}</span>
              <span>{awayStat?.away ?? "-"}</span>
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-center text-[11px] text-neutral-600">{home} vs {away}</p>
    </div>
  );
}
