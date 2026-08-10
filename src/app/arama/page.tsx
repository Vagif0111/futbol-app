"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { LoadingState, EmptyState } from "@/components/StatusMessage";
import { FEATURED_LEAGUES } from "@/types/football";
import type { SearchResult } from "@/types/football";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 3) {
      setResult(null);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setResult(json.data ?? null);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [q]);

  const matchedLeagues = FEATURED_LEAGUES.filter((l) =>
    l.name.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="p-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Oyuncu, takım veya lig ara…"
        className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-white outline-none"
      />

      <div className="mt-4 space-y-4">
        {loading && <LoadingState />}

        {!loading && q.trim().length >= 3 && matchedLeagues.length > 0 && (
          <Section title="Ligler">
            {matchedLeagues.map((l) => (
              <Link key={l.id} href={`/lig/${l.id}`} className="block px-3 py-2 text-sm text-neutral-200">
                {l.name}
              </Link>
            ))}
          </Section>
        )}

        {!loading && result && result.teams.length > 0 && (
          <Section title="Takımlar">
            {result.teams.map((t) => (
              <Link key={t.id} href={`/takim/${t.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200">
                <Image src={t.logo} alt="" width={20} height={20} unoptimized />
                {t.name}
              </Link>
            ))}
          </Section>
        )}

        {!loading && result && result.players.length > 0 && (
          <Section title="Oyuncular">
            {result.players.map((p) => (
              <Link key={p.id} href={`/oyuncu/${p.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-200">
                <Image src={p.photo} alt="" width={20} height={20} unoptimized className="rounded-full" />
                {p.name}
                {p.team && <span className="text-xs text-neutral-500">· {p.team}</span>}
              </Link>
            ))}
          </Section>
        )}

        {!loading && q.trim().length >= 3 && result &&
          result.teams.length === 0 && result.players.length === 0 && matchedLeagues.length === 0 && (
            <EmptyState message="Sonuç bulunamadı." />
        )}

        {q.trim().length > 0 && q.trim().length < 3 && (
          <p className="text-xs text-neutral-500">En az 3 harf girin.</p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-neutral-500">{title}</p>
      <div className="divide-y divide-border rounded-md border border-border bg-surface">{children}</div>
    </div>
  );
}
