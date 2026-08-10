import { NextResponse } from "next/server";
import { getFixtureById, ApiFootballError } from "@/lib/api-football";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getFixtureById(Number(params.id));
    if (!data) return NextResponse.json({ error: "Maç bulunamadı." }, { status: 404 });
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
