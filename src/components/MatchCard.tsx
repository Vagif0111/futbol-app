"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { Fixture } from "@/types/football";
import { isLive } from "@/types/football";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

function statusLabel(f: Fixture): string {
  if (f.status.short === "NS") {
    return new Date(f.date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  if (f.status.short === "FT") return "MS";
  if (f.status.short === "HT") return "Devre";
  if (f.status.short === "PST") return "Ertelendi";
  if (f.status.short === "CANC") return "İptal";
  return f.status.long;
}

function TeamBlock({ name, logo, align }: { name: string; logo: string; align: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center gap-1 ${align === "left" ? "" : ""}`}>
      <Image src={logo} alt="" width={36} height={36} unoptimized />
      <span className="line-clamp-1 text-center text-xs font-medium text-ink">{name}</span>
    </div>
  );
}

export function MatchCard({ fixture }: { fixture: Fixture }) {
  const live = isLive(fixture.status.short);
  const played = fixture.goalsHome !== null;
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite("league", fixture.league.id));
  }, [fixture.league.id]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-card">
      <div className="mb-2 flex items-center gap-1.5">
        <Image src={fixture.league.logo} alt="" width={16} height={16} unoptimized />
        <span className="text-[11px] font-medium text-ink">{fixture.league.name}</span>
        <span className="text-[11px] text-muted">· {fixture.league.country}</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            const next = toggleFavorite({
              kind: "league", id: fixture.league.id, name: fixture.league.name, logo: fixture.league.logo,
            });
            setFav(next.some((f) => f.kind === "league" && f.id === fixture.league.id));
          }}
          className={`ml-auto text-sm ${fav ? "text-accent" : "text-muted"}`}
          aria-label="Favori lig"
        >
          {fav ? "★" : "☆"}
        </button>
      </div>

      <Link href={`/mac/${fixture.id}`} className="flex items-center gap-2">
        <TeamBlock name={fixture.home.name} logo={fixture.home.logo} align="left" />

        <div className="flex w-16 shrink-0 flex-col items-center gap-0.5">
          {live ? (
            <span className="flex items-center gap-1 rounded bg-live/10 px-1.5 py-0.5 text-[11px] font-semibold text-live">
              <span className="h-1.5 w-1.5 rounded-full bg-live" />
              {fixture.status.elapsed != null ? `${fixture.status.elapsed}'` : "CANLI"}
            </span>
          ) : null}
          <span className="text-base font-bold tabular-nums text-ink">
            {played ? `${fixture.goalsHome} - ${fixture.goalsAway}` : statusLabel(fixture)}
          </span>
          <span className="text-[11px] text-muted">{played ? statusLabel(fixture) : "vs"}</span>
        </div>

        <TeamBlock name={fixture.away.name} logo={fixture.away.logo} align="right" />
      </Link>
    </div>
  );
}

// Maçları lig başlıklarıyla gruplayıp listeler. Favori ligler en üstte gösterilir.
export function FixtureListGrouped({
  fixtures,
  favoriteLeagueIds = [],
}: {
  fixtures: Fixture[];
  favoriteLeagueIds?: number[];
}) {
  const sorted = [...fixtures].sort((a, b) => {
    const aFav = favoriteLeagueIds.includes(a.league.id);
    const bFav = favoriteLeagueIds.includes(b.league.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <div className="space-y-3">
      {sorted.map((f) => <MatchCard key={f.id} fixture={f} />)}
    </div>
  );
}
