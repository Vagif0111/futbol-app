import "server-only";
import { withCache } from "./cache";
import type {
  Fixture, MatchEvent, LineupsResponse, StatItem, PlayerProfile,
  TeamProfile, StandingRow, SearchResult, FixtureStatusShort, TeamStatistics,
} from "@/types/football";

const BASE_URL = "https://v3.football.api-sports.io";

export class ApiFootballError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function apiGet<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    throw new ApiFootballError("API_FOOTBALL_KEY tanımlı değil (.env.local dosyasını kontrol edin).");
  }
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const url = `${BASE_URL}${path}?${qs.toString()}`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { "x-apisports-key": key } });
  } catch {
    throw new ApiFootballError("Veri kaynağına ulaşılamıyor. İnternet bağlantınızı kontrol edin.");
  }

  if (res.status === 429) {
    throw new ApiFootballError("Günlük API istek limiti doldu. Lütfen daha sonra tekrar deneyin.", 429);
  }
  if (!res.ok) {
    throw new ApiFootballError(`Veri kaynağı hata döndürdü (${res.status}).`, res.status);
  }
  const json = await res.json();
  if (json.errors && Array.isArray(json.errors) ? json.errors.length : Object.keys(json.errors || {}).length) {
    throw new ApiFootballError("Veri kaynağı geçersiz istek bildirdi.");
  }
  return json.response as T;
}

function cachedGet<T>(cacheKey: string, ttlSeconds: number, path: string, params: Record<string, string | number | undefined>) {
  return withCache(cacheKey, ttlSeconds, () => apiGet<T>(path, params));
}

// ---- Mapping helpers: API-Football ham yanıtını uygulama tiplerine çevirir ----

function mapFixture(raw: any): Fixture {
  return {
    id: raw.fixture.id,
    date: raw.fixture.date,
    timestamp: raw.fixture.timestamp,
    status: {
      short: raw.fixture.status.short as FixtureStatusShort,
      long: raw.fixture.status.long,
      elapsed: raw.fixture.status.elapsed ?? null,
    },
    venue: raw.fixture.venue ? { name: raw.fixture.venue.name, city: raw.fixture.venue.city } : undefined,
    league: {
      id: raw.league.id, name: raw.league.name, country: raw.league.country,
      logo: raw.league.logo, season: raw.league.season, round: raw.league.round,
    },
    home: { id: raw.teams.home.id, name: raw.teams.home.name, logo: raw.teams.home.logo, winner: raw.teams.home.winner },
    away: { id: raw.teams.away.id, name: raw.teams.away.name, logo: raw.teams.away.logo, winner: raw.teams.away.winner },
    goalsHome: raw.goals.home,
    goalsAway: raw.goals.away,
  };
}

// ---- Public functions used by API routes ----

export async function getFixturesByDate(date: string): Promise<Fixture[]> {
  const raw = await cachedGet<any[]>(`fixtures:date:${date}`, 120, "/fixtures", { date });
  return raw.map(mapFixture);
}

export async function getLiveFixtures(): Promise<Fixture[]> {
  // Canlı veri kısa TTL ile cache'lenir; client tarafı da bunu 60-90sn'de bir çağırır.
  const raw = await cachedGet<any[]>("fixtures:live", 45, "/fixtures", { live: "all" });
  return raw.map(mapFixture);
}

// API-Football sezonları "başlangıç yılı" ile adlandırır (örn. 2025-26 sezonu -> 2025).
// Avrupa liglerinde sezon genelde Temmuz civarı başlar.
function currentSeasonYear(): number {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 6 ? year : year - 1; // ay 0-index, 6 = Temmuz
}

// Ücretsiz API planı bazı sezonlara erişimi kısıtlayabiliyor ("geçersiz istek" hatası).
// Bu yüzden güncel sezondan geriye doğru birkaç sezon deneyip erişilebilen ilkini kullanıyoruz.
async function withSeasonFallback<T>(
  fetcher: (season: number) => Promise<T[]>,
  startSeason: number = currentSeasonYear(),
  tries = 4
): Promise<{ season: number; data: T[] } | null> {
  for (let i = 0; i < tries; i++) {
    const season = startSeason - i;
    try {
      const data = await fetcher(season);
      if (data.length > 0) return { season, data };
    } catch {
      // bu sezon erişilemiyor, bir öncekini dene
    }
  }
  return null;
}

export async function getUpcomingFixtures(teamId?: number, leagueId?: number): Promise<Fixture[]> {
  if (!leagueId) {
    const raw = await cachedGet<any[]>(`fixtures:next:${teamId ?? "all"}:all`, 300, "/fixtures", {
      next: 15, team: teamId,
    });
    return raw.map(mapFixture);
  }
  const found = await withSeasonFallback((season) =>
    cachedGet<any[]>(`fixtures:next:${teamId ?? "all"}:${leagueId}:${season}`, 300, "/fixtures", {
      next: 15, team: teamId, league: leagueId, season,
    })
  );
  return found ? found.data.map(mapFixture) : [];
}

export async function getRecentFixtures(teamId?: number, leagueId?: number): Promise<Fixture[]> {
  if (!leagueId) {
    const raw = await cachedGet<any[]>(`fixtures:last:${teamId ?? "all"}:all`, 300, "/fixtures", {
      last: 15, team: teamId,
    });
    return raw.map(mapFixture);
  }
  const found = await withSeasonFallback((season) =>
    cachedGet<any[]>(`fixtures:last:${teamId ?? "all"}:${leagueId}:${season}`, 300, "/fixtures", {
      last: 15, team: teamId, league: leagueId, season,
    })
  );
  return found ? found.data.map(mapFixture) : [];
}

export async function getFixtureById(id: number): Promise<Fixture | null> {
  const raw = await cachedGet<any[]>(`fixture:${id}`, 30, "/fixtures", { id });
  return raw[0] ? mapFixture(raw[0]) : null;
}

export async function getFixtureEvents(id: number): Promise<MatchEvent[]> {
  const raw = await cachedGet<any[]>(`fixture:${id}:events`, 30, "/fixtures/events", { fixture: id });
  return raw.map((e: any) => ({
    minute: e.time.elapsed,
    extraMinute: e.time.extra ?? null,
    team: { id: e.team.id, name: e.team.name, logo: e.team.logo },
    player: { id: e.player?.id ?? null, name: e.player?.name ?? null },
    assist: { id: e.assist?.id ?? null, name: e.assist?.name ?? null },
    type: e.type,
    detail: e.detail,
    comments: e.comments,
  }));
}

// Sadece RESMİ kadro. API resmi kadro açıklanana kadar boş dizi döner —
// biz de bunu asla "muhtemel 11" gibi doldurmuyoruz.
export async function getFixtureLineups(id: number): Promise<LineupsResponse> {
  const raw = await cachedGet<any[]>(`fixture:${id}:lineups`, 60, "/fixtures/lineups", { fixture: id });
  if (!raw.length) return { official: false, home: null, away: null };

  const mapTeam = (t: any) => ({
    team: { id: t.team.id, name: t.team.name, logo: t.team.logo },
    coach: t.coach?.name ?? null,
    formation: t.formation ?? null,
    startXI: (t.startXI ?? []).map((p: any) => ({
      id: p.player.id, name: p.player.name, number: p.player.number,
      position: p.player.pos, grid: p.player.grid,
    })),
    substitutes: (t.substitutes ?? []).map((p: any) => ({
      id: p.player.id, name: p.player.name, number: p.player.number,
      position: p.player.pos, grid: p.player.grid,
    })),
  });

  const home = raw[0] ? mapTeam(raw[0]) : null;
  const away = raw[1] ? mapTeam(raw[1]) : null;
  return { official: !!(home?.startXI.length || away?.startXI.length), home, away };
}

export async function getFixtureStatistics(id: number): Promise<{ home: StatItem[]; away: StatItem[] }> {
  const raw = await cachedGet<any[]>(`fixture:${id}:stats`, 60, "/fixtures/statistics", { fixture: id });
  if (raw.length < 2) return { home: [], away: [] };
  const homeRaw = raw[0]?.statistics ?? [];
  const awayRaw = raw[1]?.statistics ?? [];
  const home: StatItem[] = homeRaw.map((s: any) => ({ type: s.type, home: s.value, away: null }));
  const away: StatItem[] = awayRaw.map((s: any) => ({ type: s.type, home: null, away: s.value }));
  return { home, away };
}

export async function getTeamProfile(id: number): Promise<TeamProfile | null> {
  const raw = await cachedGet<any[]>(`team:${id}`, 3600, "/teams", { id });
  if (!raw[0]) return null;
  const t = raw[0].team;
  const v = raw[0].venue;
  return {
    id: t.id, name: t.name, logo: t.logo, country: t.country, founded: t.founded ?? null,
    venue: v ? { name: v.name, city: v.city } : undefined,
  };
}

export async function getStandings(leagueId: number): Promise<{ season: number; rows: StandingRow[] } | null> {
  const found = await withSeasonFallback(async (season) => {
    const raw = await cachedGet<any[]>(`standings:${leagueId}:${season}`, 900, "/standings", { league: leagueId, season });
    const table = raw[0]?.league?.standings?.[0] ?? [];
    return table;
  });
  if (!found) return null;
  const rows: StandingRow[] = found.data.map((r: any) => ({
    rank: r.rank,
    team: { id: r.team.id, name: r.team.name, logo: r.team.logo },
    points: r.points,
    played: r.all.played,
    win: r.all.win,
    draw: r.all.draw,
    lose: r.all.lose,
    goalsFor: r.all.goals.for,
    goalsAgainst: r.all.goals.against,
    form: r.form ?? null,
  }));
  return { season: found.season, rows };
}

export async function getPlayerProfile(id: number, season: number): Promise<PlayerProfile | null> {
  const raw = await cachedGet<any[]>(`player:${id}:${season}`, 900, "/players", { id, season });
  if (!raw[0]) return null;
  const p = raw[0].player;
  const stats = (raw[0].statistics ?? []).map((s: any) => ({
    team: { id: s.team.id, name: s.team.name, logo: s.team.logo },
    league: { id: s.league.id, name: s.league.name, season: s.league.season },
    appearances: s.games?.appearences ?? null,
    minutes: s.games?.minutes ?? null,
    goals: s.goals?.total ?? null,
    assists: s.goals?.assists ?? null,
    yellowCards: s.cards?.yellow ?? null,
    redCards: s.cards?.red ?? null,
    shotsTotal: s.shots?.total ?? null,
    shotsOn: s.shots?.on ?? null,
    passesTotal: s.passes?.total ?? null,
    passAccuracy: s.passes?.accuracy ?? null,
    rating: s.games?.rating ?? null,
  }));
  return {
    id: p.id, name: p.name, photo: p.photo, age: p.age ?? null,
    nationality: p.nationality ?? null,
    position: raw[0].statistics?.[0]?.games?.position ?? null,
    number: raw[0].statistics?.[0]?.games?.number ?? null,
    stats,
  };
}

export async function getTeamSquad(id: number): Promise<{ id: number; name: string; photo: string; position: string | null; number: number | null }[]> {
  const raw = await cachedGet<any[]>(`team:${id}:squad`, 3600, "/players/squads", { team: id });
  const players = raw[0]?.players ?? [];
  return players.map((p: any) => ({
    id: p.id, name: p.name, photo: p.photo, position: p.position ?? null, number: p.number ?? null,
  }));
}

export async function search(query: string): Promise<SearchResult> {
  if (query.trim().length < 3) return { teams: [], players: [], leagues: [] };
  const [teamsRaw, playersRaw, leaguesRaw] = await Promise.all([
    cachedGet<any[]>(`search:teams:${query}`, 600, "/teams", { search: query }),
    cachedGet<any[]>(`search:players:${query}`, 600, "/players", { search: query }),
    cachedGet<any[]>(`search:leagues:${query}`, 600, "/leagues", { search: query }),
  ]);
  return {
    teams: teamsRaw.map((t) => ({ id: t.team.id, name: t.team.name, logo: t.team.logo })),
    players: playersRaw.map((p) => ({
      id: p.player.id, name: p.player.name, photo: p.player.photo,
      team: p.statistics?.[0]?.team?.name ?? null,
    })),
    leagues: leaguesRaw.map((l) => ({
      id: l.league.id, name: l.league.name, logo: l.league.logo, country: l.country?.name ?? "",
    })),
  };
}

// Bir takımın oynadığı, "current" (aktif) sezona sahip ilk ligi bulur —
// takım istatistiklerini çekmek için hangi lig kullanılacağını belirler.
async function getTeamCurrentLeague(teamId: number): Promise<{ leagueId: number; leagueName: string } | null> {
  const raw = await cachedGet<any[]>(`team:${teamId}:current-league`, 3600, "/leagues", { team: teamId, current: "true" });
  const first = raw[0];
  if (!first) return null;
  return { leagueId: first.league.id, leagueName: first.league.name };
}

export async function getTeamStatistics(teamId: number): Promise<TeamStatistics | null> {
  const league = await getTeamCurrentLeague(teamId);
  if (!league) return null;

  const found = await withSeasonFallback(async (season) => {
    const raw = await cachedGet<any>(
      `team:${teamId}:stats:${league.leagueId}:${season}`,
      900,
      "/teams/statistics",
      { team: teamId, league: league.leagueId, season }
    );
    return raw && raw.fixtures ? [raw] : [];
  });
  if (!found) return null;
  const raw = found.data[0];
  return {
    league: { id: league.leagueId, name: league.leagueName, season: found.season },
    played: raw.fixtures.played?.total ?? 0,
    wins: raw.fixtures.wins?.total ?? 0,
    draws: raw.fixtures.draws?.total ?? 0,
    loses: raw.fixtures.loses?.total ?? 0,
    goalsFor: raw.goals?.for?.total?.total ?? 0,
    goalsAgainst: raw.goals?.against?.total?.total ?? 0,
    cleanSheets: raw.clean_sheet?.total ?? 0,
    failedToScore: raw.failed_to_score?.total ?? 0,
    formStreak: raw.form ?? null,
  };
}
