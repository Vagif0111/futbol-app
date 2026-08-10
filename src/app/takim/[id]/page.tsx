"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApi } from "@/hooks/useApi";
import { MatchCard } from "@/components/MatchCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/StatusMessage";
import { toggleFavorite, isFavorite } from "@/lib/favorites";
import type { Fixture, TeamProfile } from "@/types/football";

type Tab = "squad" | "recent" | "upcoming";

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
      <div className="flex flex-col items-center gap-2 border-b border-border p-5">
        <Image src={team.logo} alt="" width={56} height={56} unoptimized />
        <h1 className="text-lg font-semibold text-white">{team.name}</h1>
        <p className="text-xs text-neutral-500">
          {team.country ?? "—"}{team.founded ? ` · ${team.founded}` : ""}
        </p>
        {team.venue?.name && (
          <p className="text-xs text-neutral-500">{team.venue.name}, {team.venue.city}</p>
        )}
        <button
          onClick={() => setFav(toggleFavorite({ kind: "team", id: teamId, name: team.name, logo: team.logo }).some(f => f.id === teamId))}
          className={`mt-1 rounded-full border px-4 py-1.5 text-xs ${
            fav ? "border-accent text-accent" : "border-border text-neutral-400"
          }`}
        >
          {fav ? "★ Favorilerde" : "☆ Favorilere ekle"}
        </button>
      </div>

      <div className="flex border-b border-border">
        {([["squad", "Kadro"], ["recent", "Son Maçlar"], ["upcoming", "Gelecek Maçlar"]] as [Tab, string][]).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm ${
                tab === key ? "border-b-2 border-accent font-medium text-white" : "text-neutral-500"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {tab === "squad" && (
        <div className="divide-y divide-border">
          {squadLoading && <LoadingState />}
          {!squadLoading && squad?.length === 0 && <EmptyState message="Kadro verisi bulunamadı." />}
          {!squadLoading && squad?.map((p) => (
            <Link key={p.id} href={`/oyuncu/${p.id}`} className="flex items-center gap-3 px-4 py-2.5">
              <Image src={p.photo} alt="" width={32} height={32} unoptimized className="rounded-full" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-neutral-200">{p.name}</p>
                <p className="text-xs text-neutral-500">{p.position ?? "—"}</p>
              </div>
              {p.number != null && <span className="text-xs text-neutral-500">#{p.number}</span>}
            </Link>
          ))}
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
