"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { LoadingState, EmptyState } from "@/components/StatusMessage";
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

  const hasAnyResult =
    result && (result.leagues.length > 0 || result.teams.length > 0 || result.players.length > 0);

  return (
    <div className="p-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Oyuncu, takım veya lig/turnuva ara…"
        className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none"
      />

      <div className="mt-4 space-y-4">
        {loading && <LoadingState />}

        {!loading && result && result.leagues.length > 0 && (
          <Section title="Ligler / Turnuvalar">
            {result.leagues.map((l) => (
              <Link key={l.id} href={`/lig/${l.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-ink">
                <Image src={l.logo} alt="" width={20} height={20} unoptimized />
                {l.name}
                {l.country && <span className="text-xs text-muted">· {l.country}</span>}
              </Link>
            ))}
          </Section>
        )}

        {!loading && result && result.teams.length > 0 && (
          <Section title="Takımlar">
            {result.teams.map((t) => (
              <Link key={t.id} href={`/takim/${t.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-ink">
                <Image src={t.logo} alt="" width={20} height={20} unoptimized />
                {t.name}
              </Link>
            ))}
          </Section>
        )}

        {!loading && result && result.players.length > 0 && (
          <Section title="Oyuncular">
            {result.players.map((p) => (
              <Link key={p.id} href={`/oyuncu/${p.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-ink">
                <Image src={p.photo} alt="" width={20} height={20} unoptimized className="rounded-full" />
                {p.name}
                {p.team && <span className="text-xs text-muted">· {p.team}</span>}
              </Link>
            ))}
          </Section>
        )}

        {!loading && q.trim().length >= 3 && result && !hasAnyResult && (
          <EmptyState message="Sonuç bulunamadı." />
        )}

        {q.trim().length > 0 && q.trim().length < 3 && (
          <p className="text-xs text-muted">En az 3 harf girin.</p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted">{title}</p>
      <div className="divide-y divide-border rounded-md border border-border bg-surface shadow-card">{children}</div>
    </div>
  );
}
