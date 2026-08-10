import { NextResponse } from "next/server";
import { getUpcomingFixtures, ApiFootballError } from "@/lib/api-football";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const team = searchParams.get("team");
    const league = searchParams.get("league");
    const data = await getUpcomingFixtures(
      team ? Number(team) : undefined,
      league ? Number(league) : undefined
    );
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
