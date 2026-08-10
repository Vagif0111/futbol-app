"use client";

export type FavoriteKind = "team" | "player" | "league";

export interface FavoriteItem {
  kind: FavoriteKind;
  id: number;
  name: string;
  logo: string;
}

const KEY = "favorites";

export function getFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isFavorite(kind: FavoriteKind, id: number): boolean {
  return getFavorites().some((f) => f.kind === kind && f.id === id);
}

export function toggleFavorite(item: FavoriteItem): FavoriteItem[] {
  const current = getFavorites();
  const exists = current.some((f) => f.kind === item.kind && f.id === item.id);
  const next = exists
    ? current.filter((f) => !(f.kind === item.kind && f.id === item.id))
    : [...current, item];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
