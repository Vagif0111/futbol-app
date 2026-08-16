import { NextResponse } from "next/server";
import { getTeamStatistics, ApiFootballError } from "@/lib/api-football";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getTeamStatistics(Number(params.id));
    if (!data) return NextResponse.json({ error: "İstatistik verisi bulunamadı." }, { status: 404 });
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
