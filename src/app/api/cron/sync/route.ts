import { NextResponse } from "next/server";
import { backfillLeagueSeason } from "@/lib/api-football";
import { FEATURED_LEAGUES } from "@/types/football";

// Vercel Cron tarafından her gün otomatik çağrılır (vercel.json'a bakın).
// Vercel, CRON_SECRET ortam değişkeni tanımlıysa isteğe otomatik olarak
// "Authorization: Bearer <CRON_SECRET>" header'ı ekler.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const results: { league: string; season?: number; count?: number; error?: string }[] = [];
  for (const l of FEATURED_LEAGUES) {
    try {
      const r = await backfillLeagueSeason(l.id);
      results.push({ league: l.name, season: r?.season, count: r?.count });
    } catch (e) {
      results.push({ league: l.name, error: String(e) });
    }
  }
  return NextResponse.json({ results });
}
