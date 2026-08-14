import { NextResponse } from "next/server";
import { getFixturesByDate, ApiFootballError } from "@/lib/api-football";

export async function GET() {
  try {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const data = await getFixturesByDate(tomorrow);
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
