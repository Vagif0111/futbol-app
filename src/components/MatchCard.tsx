import Link from "next/link";
import Image from "next/image";
import type { Fixture } from "@/types/football";
import { isLive } from "@/types/football";
import { LiveBadge } from "./LiveBadge";

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

export function MatchCard({ fixture }: { fixture: Fixture }) {
  const live = isLive(fixture.status.short);
  const played = fixture.goalsHome !== null;
  const homeWin = played && fixture.goalsHome! > fixture.goalsAway!;
  const awayWin = played && fixture.goalsAway! > fixture.goalsHome!;

  return (
    <Link
      href={`/mac/${fixture.id}`}
      className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-3 shadow-card active:bg-surface2"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Image src={fixture.home.logo} alt="" width={26} height={26} unoptimized className="shrink-0" />
        <span className={`truncate text-sm ${homeWin ? "font-semibold text-white" : "text-neutral-300"}`}>
          {fixture.home.name}
        </span>
      </div>

      <div className="mx-3 flex w-16 shrink-0 flex-col items-center gap-1">
        {live ? (
          <LiveBadge minute={fixture.status.elapsed} />
        ) : (
          <span className="text-[11px] text-neutral-500">{statusLabel(fixture)}</span>
        )}
        <span className="text-base font-bold tabular-nums text-white">
          {played ? `${fixture.goalsHome} - ${fixture.goalsAway}` : "vs"}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
        <span className={`truncate text-right text-sm ${awayWin ? "font-semibold text-white" : "text-neutral-300"}`}>
          {fixture.away.name}
        </span>
        <Image src={fixture.away.logo} alt="" width={26} height={26} unoptimized className="shrink-0" />
      </div>
    </Link>
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
  const groups = new Map<number, { id: number; name: string; logo: string; country: string; items: Fixture[] }>();
  for (const f of fixtures) {
    const g = groups.get(f.league.id);
    if (g) g.items.push(f);
    else groups.set(f.league.id, { id: f.league.id, name: f.league.name, logo: f.league.logo, country: f.league.country, items: [f] });
  }

  const sorted = Array.from(groups.values()).sort((a, b) => {
    const aFav = favoriteLeagueIds.includes(a.id);
    const bFav = favoriteLeagueIds.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {sorted.map((g) => {
        const isFav = favoriteLeagueIds.includes(g.id);
        return (
          <div key={g.id}>
            <div className="mb-1.5 flex items-center gap-1.5 px-0.5">
              <Image src={g.logo} alt="" width={16} height={16} unoptimized />
              <span className="text-xs font-medium text-neutral-400">{g.name}</span>
              <span className="text-[11px] text-neutral-600">· {g.country}</span>
              {isFav && <span className="text-[11px] text-accent">★ Favori</span>}
            </div>
            <div className="space-y-2">
              {g.items.map((f) => <MatchCard key={f.id} fixture={f} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
