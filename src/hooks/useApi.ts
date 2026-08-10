"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Basit client cache: aynı session içinde aynı endpoint tekrar tekrar
// çekilmesin diye. Sayfa yenilenince sıfırlanır (istenen davranış).
const clientCache = new Map<string, { data: unknown; ts: number }>();
const CLIENT_TTL_MS = 20_000;

interface Options {
  pollMs?: number; // verilirse belirtilen aralıkla yeniden çeker (örn. canlı maç ekranı)
  enabled?: boolean;
}

export function useApi<T>(url: string | null, opts: Options = {}) {
  const { pollMs, enabled = true } = opts;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (skipCache = false) => {
      if (!url || !enabled) return;

      if (!skipCache) {
        const cached = clientCache.get(url);
        if (cached && Date.now() - cached.ts < CLIENT_TTL_MS) {
          setData(cached.data as T);
          setLoading(false);
          setError(null);
          return;
        }
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Veri alınamadı.");
          setLoading(false);
          return;
        }
        clientCache.set(url, { data: json.data, ts: Date.now() });
        setData(json.data as T);
        setError(null);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError("Bağlantı kurulamadı. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    },
    [url, enabled]
  );

  useEffect(() => {
    setLoading(true);
    fetchData();
    if (!pollMs) return;
    const id = setInterval(() => fetchData(true), pollMs);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, pollMs, enabled]);

  return { data, error, loading, refetch: () => fetchData(true) };
}
