import type { SquadPlayer } from "./PlayerSearch";

export type DragSource =
  | { type: "pool" }
  | { type: "slot"; slotId: string }
  | { type: "bench"; index: number };

export interface DragPayload {
  player: SquadPlayer;
  source: DragSource;
}

export function setDragData(e: React.DragEvent, payload: DragPayload) {
  e.dataTransfer.setData("application/json", JSON.stringify(payload));
}

export function getDragData(e: React.DragEvent): DragPayload | null {
  const raw = e.dataTransfer.getData("application/json");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
