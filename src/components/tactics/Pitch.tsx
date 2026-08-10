"use client";

import type { Slot } from "@/lib/formations";
import type { SquadPlayer } from "./PlayerSearch";
import { setDragData, getDragData, type DragPayload } from "./dnd";

export type SlotMap = Record<string, SquadPlayer | null>;

interface Props {
  slots: Slot[];
  placed: SlotMap;
  onDrop: (targetSlotId: string, payload: DragPayload) => void;
}

export function Pitch({ slots, placed, onDrop }: Props) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-border bg-[#0f2e1a]">
      <div className="absolute inset-2 rounded border border-white/15" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
      <div className="absolute left-0 right-0 top-1/2 border-t border-white/15" />

      {slots.map((slot) => {
        const player = placed[slot.id];
        return (
          <div
            key={slot.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const payload = getDragData(e);
              if (payload) onDrop(slot.id, payload);
            }}
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          >
            {player ? (
              <div
                draggable
                onDragStart={(e) =>
                  setDragData(e, { player, source: { type: "slot", slotId: slot.id } })
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-black"
                title={player.name}
              >
                {player.name.split(" ").slice(-1)[0].slice(0, 3).toUpperCase()}
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-white/30 text-[9px] text-white/40">
                {slot.label}
              </div>
            )}
            <span className="mt-0.5 max-w-[64px] truncate text-[9px] text-white/70">
              {player?.name ?? ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
