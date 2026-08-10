"use client";

import type { SquadPlayer } from "./PlayerSearch";
import { setDragData, getDragData, type DragPayload } from "./dnd";

interface Props {
  bench: (SquadPlayer | null)[];
  onDrop: (index: number, payload: DragPayload) => void;
}

export function Bench({ bench, onDrop }: Props) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-neutral-500">Yedek Kulübesi</p>
      <div className="grid grid-cols-4 gap-2">
        {bench.map((player, i) => (
          <div
            key={i}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const payload = getDragData(e);
              if (payload) onDrop(i, payload);
            }}
            className="flex h-14 flex-col items-center justify-center rounded-md border border-border bg-surface p-1 text-center"
          >
            {player ? (
              <div
                draggable
                onDragStart={(e) => setDragData(e, { player, source: { type: "bench", index: i } })}
                className="w-full"
              >
                <p className="truncate text-[10px] text-neutral-200">{player.name}</p>
              </div>
            ) : (
              <span className="text-[9px] text-neutral-600">Boş</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
