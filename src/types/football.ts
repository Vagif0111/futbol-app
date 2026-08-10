// API-Football yanıtlarından türetilen, uygulama genelinde kullanılan tipler.
// Not: alanların çoğu "optional" — kaynak bazı liglerde eksik veri döndürebilir.
// UI katmanı eksik alanı asla uydurmamalı, "veri yok" olarak göstermeli.

export interface Team {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface Venue {
  name?: string;
  city?: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  season?: number;
  round?: string;
}

export type FixtureStatusShort =
  | "TBD" | "NS" | "1H" | "HT" | "2H" | "ET" | "P" | "FT" | "AET" | "PEN"
  | "BT" | "SUSP" | "INT" | "PST" | "CANC" | "ABD" | "AWD" | "WO" | "LIVE";

export interface FixtureStatus {
  short: FixtureStatusShort;
  long: string;
  elapsed: number | null; // canlı dakika, API sağlamazsa null
}

export interface Fixture {
  id: number;
  date: string; // ISO
  timestamp: number;
  status: FixtureStatus;
  venue?: Venue;
  league: League;
  home: Team;
  away: Team;
  goalsHome: number | null;
  goalsAway: number | null;
}

export function isLive(status: FixtureStatusShort): boolean {
  return ["1H", "HT", "2H", "ET", "P", "BT", "LIVE"].includes(status);
}

export interface MatchEvent {
  minute: number;
  extraMinute: number | null;
  team: Pick<Team, "id" | "name" | "logo">;
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: "Goal" | "Card" | "subst" | "Var" | string;
  detail: string; // örn: "Normal Goal", "Yellow Card", "Substitution 1"
  comments: string | null;
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number;
  position: string; // G, D, M, F
  grid: string | null; // "4:2" gibi saha koordinatı, yoksa null
}

export interface TeamLineup {
  team: Pick<Team, "id" | "name" | "logo">;
  coach: string | null;
  formation: string | null;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

// Resmi kadro açıklanmadıysa API hiçbir şey döndürmez.
// Uygulama bu durumda "predicted" ASLA üretmez, sadece boş durumu gösterir.
export interface LineupsResponse {
  official: boolean; // startXI doluysa true
  home: TeamLineup | null;
  away: TeamLineup | null;
}

export interface StatItem {
  type: string;
  home: string | number | null;
  away: string | number | null;
}

export interface PlayerSeasonStats {
  team: Pick<Team, "id" | "name" | "logo">;
  league: Pick<League, "id" | "name" | "season">;
  appearances: number | null;
  minutes: number | null;
  goals: number | null;
  assists: number | null;
  yellowCards: number | null;
  redCards: number | null;
  shotsTotal: number | null;
  shotsOn: number | null;
  passesTotal: number | null;
  passAccuracy: number | null;
  rating: string | null;
}

export interface PlayerProfile {
  id: number;
  name: string;
  photo: string;
  age: number | null;
  nationality: string | null;
  position: string | null;
  number: number | null;
  stats: PlayerSeasonStats[]; // sezon/takım bazlı, seçim UI'da yapılır
}

export interface TeamProfile {
  id: number;
  name: string;
  logo: string;
  country: string | null;
  founded: number | null;
  venue?: Venue;
}

export interface StandingRow {
  rank: number;
  team: Pick<Team, "id" | "name" | "logo">;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  form: string | null;
}

export interface SearchResult {
  teams: { id: number; name: string; logo: string }[];
  players: { id: number; name: string; photo: string; team: string | null }[];
}

// Ana sayfa/Ligler bölümünde sabit olarak gösterilecek lig id'leri (API-Football)
export const FEATURED_LEAGUES = [
  { id: 203, name: "Süper Lig" },
  { id: 39, name: "Premier League" },
  { id: 140, name: "La Liga" },
  { id: 78, name: "Bundesliga" },
  { id: 135, name: "Serie A" },
  { id: 61, name: "Ligue 1" },
  { id: 2, name: "Şampiyonlar Ligi" },
  { id: 3, name: "Avrupa Ligi" },
] as const;
