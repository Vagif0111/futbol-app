import { NextResponse } from "next/server";
import { getPlayerProfile, ApiFootballError } from "@/lib/api-football";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const season = Number(searchParams.get("season") ?? new Date().getFullYear());
    const data = await getPlayerProfile(Number(params.id), season);
    if (!data) return NextResponse.json({ error: "Oyuncu bulunamadı." }, { status: 404 });
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
