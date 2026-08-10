import { NextResponse } from "next/server";
import { getLiveFixtures, ApiFootballError } from "@/lib/api-football";

export async function GET() {
  try {
    const data = await getLiveFixtures();
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
