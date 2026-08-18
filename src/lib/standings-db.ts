import "server-only";
import { sql, ensureSchema, FINISHED_STATUSES } from "./db";
import type { StandingRow } from "@/types/football";

interface TeamAgg {
  id: number;
  name: string;
  logo: string;
  played: number;
  win: number;
  draw: number;
  lose: number;
  gf: number;
  ga: number;
  points: number;
}

export async function computeStandingsFromDb(leagueId: number, season: number): Promise<StandingRow[]> {
  await ensureSchema();
  const { rows } = await sql<{
    home_team_id: number; home_team_name: string; home_team_logo: string;
    away_team_id: number; away_team_name: string; away_team_logo: string;
    goals_home: number | null; goals_away: number | null;
  }>`
    SELECT home_team_id, home_team_name, home_team_logo,
           away_team_id, away_team_name, away_team_logo,
           goals_home, goals_away
    FROM fixtures
    WHERE league_id = ${leagueId} AND season = ${season}
      AND status_short = ANY(${FINISHED_STATUSES})
  `;

  const table = new Map<number, TeamAgg>();
  const ensure = (id: number, name: string, logo: string): TeamAgg => {
    let t = table.get(id);
    if (!t) {
      t = { id, name, logo, played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, points: 0 };
      table.set(id, t);
    }
    return t;
  };

  for (const r of rows) {
    if (r.goals_home == null || r.goals_away == null) continue;
    const home = ensure(r.home_team_id, r.home_team_name, r.home_team_logo);
    const away = ensure(r.away_team_id, r.away_team_name, r.away_team_logo);
    home.played++; away.played++;
    home.gf += r.goals_home; home.ga += r.goals_away;
    away.gf += r.goals_away; away.ga += r.goals_home;
    if (r.goals_home > r.goals_away) { home.win++; home.points += 3; away.lose++; }
    else if (r.goals_home < r.goals_away) { away.win++; away.points += 3; home.lose++; }
    else { home.draw++; away.draw++; home.points += 1; away.points += 1; }
  }

  return Array.from(table.values())
    .sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
    .map((t, i) => ({
      rank: i + 1,
      team: { id: t.id, name: t.name, logo: t.logo },
      points: t.points,
      played: t.played,
      win: t.win,
      draw: t.draw,
      lose: t.lose,
      goalsFor: t.gf,
      goalsAgainst: t.ga,
      form: null,
    }));
}
