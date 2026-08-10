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

  return (
    <Link
      href={`/mac/${fixture.id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 active:opacity-70"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Image src={fixture.home.logo} alt="" width={20} height={20} unoptimized />
        <span className="truncate text-sm text-neutral-200">{fixture.home.name}</span>
      </div>

      <div className="mx-3 flex w-16 shrink-0 flex-col items-center gap-0.5">
        {live ? (
          <LiveBadge minute={fixture.status.elapsed} />
        ) : (
          <span className="text-[11px] text-neutral-500">{statusLabel(fixture)}</span>
        )}
        <span className="text-sm font-semibold text-white">
          {played ? `${fixture.goalsHome} - ${fixture.goalsAway}` : "-"}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="truncate text-right text-sm text-neutral-200">{fixture.away.name}</span>
        <Image src={fixture.away.logo} alt="" width={20} height={20} unoptimized />
      </div>
    </Link>
  );
}
