import { NextResponse } from "next/server";
import { backfillLeagueSeason, ApiFootballError } from "@/lib/api-football";

// Kullanım: /api/admin/backfill?league=203&key=GİZLİ_ANAHTAR
// GİZLİ_ANAHTAR, Vercel'de tanımladığın CRON_SECRET ortam değişkeniyle aynı olmalı.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const leagueId = Number(searchParams.get("league"));
  if (!leagueId) return NextResponse.json({ error: "league parametresi gerekli." }, { status: 400 });

  try {
    const result = await backfillLeagueSeason(leagueId);
    return NextResponse.json({ result });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
