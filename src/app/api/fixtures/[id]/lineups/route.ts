import { NextResponse } from "next/server";
import { getFixtureLineups, ApiFootballError } from "@/lib/api-football";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getFixtureLineups(Number(params.id));
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
