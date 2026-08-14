"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useApi } from "@/hooks/useApi";
import { LoadingState, ErrorState } from "@/components/StatusMessage";
import { toggleFavorite, isFavorite } from "@/lib/favorites";
import type { PlayerProfile } from "@/types/football";

const currentYear = new Date().getFullYear();
const SEASONS = [currentYear, currentYear - 1, currentYear - 2];

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const playerId = Number(id);
  const [season, setSeason] = useState(currentYear);
  const [fav, setFav] = useState(false);

  const { data: player, error, loading, refetch } = useApi<PlayerProfile>(
    `/api/players/${playerId}?season=${season}`,
    // Oyuncu maçta gol atınca kaynaktaki güncel veriye göre bu sayı otomatik
    // güncellenir; sayfa açıkken 60sn'de bir tazelenir.
    { pollMs: 60_000 }
  );

  useEffect(() => {
    setFav(isFavorite("player", playerId));
  }, [playerId]);

  if (loading) return <LoadingState />;
  if (error || !player) return <ErrorState message={error ?? "Oyuncu bulunamadı."} onRetry={refetch} />;

  const s = player.stats[0]; // seçili sezon/takıma ait ilk kayıt

  return (
    <div>
      <div className="flex flex-col items-center gap-2 border-b border-border bg-gradient-to-b from-surface2 to-bg p-6">
        <Image src={player.photo} alt="" width={72} height={72} unoptimized className="rounded-full" />
        <h1 className="text-lg font-semibold text-white">{player.name}</h1>
        <p className="text-xs text-neutral-500">
          {player.position ?? "—"} · {player.age ? `${player.age} yaş` : "—"}
          {player.number ? ` · #${player.number}` : ""}
        </p>
        {s && <p className="text-xs text-neutral-500">{s.team.name}</p>}
        <button
          onClick={() =>
            setFav(
              toggleFavorite({
                kind: "player", id: playerId, name: player.name, logo: player.photo,
              }).some((f) => f.id === playerId)
            )
          }
          className={`mt-1 rounded-full border px-4 py-1.5 text-xs ${
            fav ? "border-accent text-accent" : "border-border text-neutral-400"
          }`}
        >
          {fav ? "★ Favorilerde" : "☆ Favorilere ekle"}
        </button>
      </div>

      <div className="flex justify-center gap-2 border-b border-border p-3">
        {SEASONS.map((y) => (
          <button
            key={y}
            onClick={() => setSeason(y)}
            className={`rounded-full px-3 py-1 text-xs ${
              season === y ? "bg-accent text-black" : "border border-border text-neutral-400"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="p-4">
        {!s ? (
          <p className="text-center text-sm text-neutral-500">Bu sezon için istatistik verisi yok.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Maç" value={s.appearances} />
            <Stat label="Gol" value={s.goals} />
            <Stat label="Asist" value={s.assists} />
            <Stat label="Dakika" value={s.minutes} />
            <Stat label="Sarı Kart" value={s.yellowCards} />
            <Stat label="Kırmızı Kart" value={s.redCards} />
            <Stat label="Şut" value={s.shotsTotal} />
            <Stat label="İsabetli Şut" value={s.shotsOn} />
            <Stat label="Pas" value={s.passesTotal} />
            <Stat label="Pas İsabeti" value={s.passAccuracy ? `%${s.passAccuracy}` : null} />
            <Stat label="Reyting" value={s.rating} />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-center">
      <p className="text-lg font-semibold text-white">{value ?? "—"}</p>
      <p className="text-[11px] text-neutral-500">{label}</p>
    </div>
  );
}
