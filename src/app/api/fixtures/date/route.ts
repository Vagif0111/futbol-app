import { NextResponse } from "next/server";
import { getFixturesByDate, ApiFootballError } from "@/lib/api-football";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") ?? "";
    if (!DATE_RE.test(date)) {
      return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
    }
    const data = await getFixturesByDate(date);
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof ApiFootballError ? e.message : "Beklenmeyen bir hata oluştu.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
