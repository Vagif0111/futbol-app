"use client";

import { useState, useEffect, useRef } from "react";
import type { SearchResult } from "@/types/football";

export interface SquadPlayer {
  id: number;
  name: string;
  team: string | null;
}

export function PlayerSearch({ onAdd }: { onAdd: (p: SquadPlayer) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SquadPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 3) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        const data: SearchResult | undefined = json.data;
        setResults((data?.players ?? []).map((p) => ({ id: p.id, name: p.name, team: p.team })));
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [q]);

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Oyuncu ara (en az 3 harf)…"
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
      />
      {loading && <p className="mt-1 text-xs text-muted">Aranıyor…</p>}
      {results.length > 0 && (
        <ul className="mt-1 max-h-40 divide-y divide-border overflow-y-auto rounded-md border border-border">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => { onAdd(p); setQ(""); setResults([]); }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink"
              >
                <span>{p.name}</span>
                {p.team && <span className="text-xs text-muted">{p.team}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
