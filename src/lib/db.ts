import "server-only";
import { sql } from "@vercel/postgres";

let schemaReady = false;

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS fixtures (
      id INTEGER PRIMARY KEY,
      league_id INTEGER NOT NULL,
      league_name TEXT,
      league_logo TEXT,
      league_country TEXT,
      season INTEGER NOT NULL,
      date TIMESTAMPTZ,
      status_short TEXT,
      status_long TEXT,
      home_team_id INTEGER,
      home_team_name TEXT,
      home_team_logo TEXT,
      away_team_id INTEGER,
      away_team_name TEXT,
      away_team_logo TEXT,
      goals_home INTEGER,
      goals_away INTEGER,
      events JSONB,
      statistics JSONB,
      lineups JSONB,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_fixtures_league_season ON fixtures(league_id, season);`;
  schemaReady = true;
}

// Bitmiş sayılan durumlar - sadece bunlar kalıcı olarak önbelleğe alınır,
// çünkü bir daha değişmezler.
export const FINISHED_STATUSES = ["FT", "AET", "PEN"];

export interface FixtureDbRow {
  id: number;
  league_id: number;
  league_name: string;
  league_logo: string;
  league_country: string;
  season: number;
  date: string;
  status_short: string;
  status_long: string;
  home_team_id: number;
  home_team_name: string;
  home_team_logo: string;
  away_team_id: number;
  away_team_name: string;
  away_team_logo: string;
  goals_home: number | null;
  goals_away: number | null;
  events: unknown | null;
  statistics: unknown | null;
  lineups: unknown | null;
}

export async function getFixtureFromDb(id: number): Promise<FixtureDbRow | null> {
  await ensureSchema();
  const { rows } = await sql<FixtureDbRow>`SELECT * FROM fixtures WHERE id = ${id}`;
  return rows[0] ?? null;
}

interface UpsertFixtureInput {
  id: number;
  leagueId: number;
  leagueName: string;
  leagueLogo: string;
  leagueCountry: string;
  season: number;
  date: string;
  statusShort: string;
  statusLong: string;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string;
  goalsHome: number | null;
  goalsAway: number | null;
}

export async function upsertFixtureCore(f: UpsertFixtureInput): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO fixtures (
      id, league_id, league_name, league_logo, league_country, season, date,
      status_short, status_long, home_team_id, home_team_name, home_team_logo,
      away_team_id, away_team_name, away_team_logo, goals_home, goals_away, updated_at
    ) VALUES (
      ${f.id}, ${f.leagueId}, ${f.leagueName}, ${f.leagueLogo}, ${f.leagueCountry}, ${f.season}, ${f.date},
      ${f.statusShort}, ${f.statusLong}, ${f.homeTeamId}, ${f.homeTeamName}, ${f.homeTeamLogo},
      ${f.awayTeamId}, ${f.awayTeamName}, ${f.awayTeamLogo}, ${f.goalsHome}, ${f.goalsAway}, now()
    )
    ON CONFLICT (id) DO UPDATE SET
      status_short = EXCLUDED.status_short,
      status_long = EXCLUDED.status_long,
      goals_home = EXCLUDED.goals_home,
      goals_away = EXCLUDED.goals_away,
      updated_at = now();
  `;
}

export async function updateFixtureExtra(
  id: number,
  extra: { events?: unknown; statistics?: unknown; lineups?: unknown }
): Promise<void> {
  await ensureSchema();
  if (extra.events !== undefined) {
    await sql`UPDATE fixtures SET events = ${JSON.stringify(extra.events)}, updated_at = now() WHERE id = ${id}`;
  }
  if (extra.statistics !== undefined) {
    await sql`UPDATE fixtures SET statistics = ${JSON.stringify(extra.statistics)}, updated_at = now() WHERE id = ${id}`;
  }
  if (extra.lineups !== undefined) {
    await sql`UPDATE fixtures SET lineups = ${JSON.stringify(extra.lineups)}, updated_at = now() WHERE id = ${id}`;
  }
}

export { sql };
