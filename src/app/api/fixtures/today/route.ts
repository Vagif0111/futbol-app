import { NextResponse } from "next/server";
import { getFixturesByDate, ApiFootballError } from "@/lib/api-football";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const data = await getFixturesByDate(today);
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
