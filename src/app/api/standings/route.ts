import { NextResponse } from "next/server";
import { getStandings, ApiFootballError } from "@/lib/api-football";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const league = Number(searchParams.get("league"));
    const season = Number(searchParams.get("season") ?? new Date().getFullYear());
    if (!league) return NextResponse.json({ error: "league parametresi gerekli." }, { status: 400 });
    const data = await getStandings(league, season);
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
