"use client";

import { useState, useEffect, useCallback } from "react";
import { FORMATIONS, FORMATION_NAMES } from "@/lib/formations";
import { Pitch, type SlotMap } from "@/components/tactics/Pitch";
import { Bench } from "@/components/tactics/Bench";
import { PlayerSearch, type SquadPlayer } from "@/components/tactics/PlayerSearch";
import { getDragData, type DragPayload } from "@/components/tactics/dnd";

interface SavedPlan {
  id: string;
  name: string;
  formation: string;
  slots: SlotMap;
  bench: (SquadPlayer | null)[];
}

const STORAGE_KEY = "tactics-plans";
const BENCH_SIZE = 7;

function emptySlots(formation: string): SlotMap {
  const map: SlotMap = {};
  for (const s of FORMATIONS[formation]) map[s.id] = null;
  return map;
}

export default function TacticsPage() {
  const [formation, setFormation] = useState("4-3-3");
  const [slots, setSlots] = useState<SlotMap>(() => emptySlots("4-3-3"));
  const [bench, setBench] = useState<(SquadPlayer | null)[]>(Array(BENCH_SIZE).fill(null));
  const [pool, setPool] = useState<SquadPlayer[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  useEffect(() => {
    try {
      setSavedPlans(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
    } catch {
      setSavedPlans([]);
    }
  }, []);

  const changeFormation = (f: string) => {
    // Mevcut yerleştirilmiş oyuncuları havuza geri koy, yeni formasyonla boş başla.
    const placed = Object.values(slots).filter((p): p is SquadPlayer => !!p);
    setPool((prev) => [...prev, ...placed]);
    setFormation(f);
    setSlots(emptySlots(f));
  };

  const addToPool = (p: SquadPlayer) => {
    setPool((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
  };

  const clearSource = useCallback((source: DragPayload["source"]) => {
    if (source.type === "pool") return; // pool ayrıca aşağıda ele alınıyor
    if (source.type === "slot") setSlots((prev) => ({ ...prev, [source.slotId]: null }));
    if (source.type === "bench")
      setBench((prev) => prev.map((x, i) => (i === source.index ? null : x)));
  }, []);

  const handleDropToSlot = (slotId: string, payload: DragPayload) => {
    const displaced = slots[slotId];
    if (payload.source.type === "slot" && payload.source.slotId === slotId) return;

    setSlots((prev) => ({ ...prev, [slotId]: payload.player }));
    if (payload.source.type === "pool") {
      setPool((prev) => prev.filter((p) => p.id !== payload.player.id));
    } else {
      clearSource(payload.source);
    }
    if (displaced) setPool((prev) => [...prev, displaced]);
  };

  const handleDropToBench = (index: number, payload: DragPayload) => {
    const displaced = bench[index];
    if (payload.source.type === "bench" && payload.source.index === index) return;

    setBench((prev) => {
      const next = [...prev];
      next[index] = payload.player;
      return next;
    });
    if (payload.source.type === "pool") {
      setPool((prev) => prev.filter((p) => p.id !== payload.player.id));
    } else {
      clearSource(payload.source);
    }
    if (displaced) setPool((prev) => [...prev, displaced]);
  };

  const handleDropToPool = (e: React.DragEvent) => {
    e.preventDefault();
    const payload = getDragData(e);
    if (!payload || payload.source.type === "pool") return;
    clearSource(payload.source);
    setPool((prev) => [...prev, payload.player]);
  };

  const savePlan = () => {
    const name = window.prompt("Taktiğe bir isim ver:", `Taktik ${savedPlans.length + 1}`);
    if (!name) return;
    const plan: SavedPlan = { id: crypto.randomUUID(), name, formation, slots, bench };
    const next = [...savedPlans, plan];
    setSavedPlans(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const loadPlan = (plan: SavedPlan) => {
    setFormation(plan.formation);
    setSlots(plan.slots);
    setBench(plan.bench);
  };

  const deletePlan = (id: string) => {
    const next = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div className="p-3">
      <h1 className="mb-3 text-lg font-semibold text-ink">Taktik Tahtası</h1>

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {FORMATION_NAMES.map((f) => (
          <button
            key={f}
            onClick={() => changeFormation(f)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
              formation === f ? "bg-accent text-white" : "border border-border text-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Pitch slots={FORMATIONS[formation]} placed={slots} onDrop={handleDropToSlot} />

      <div className="mt-3">
        <Bench bench={bench} onDrop={handleDropToBench} />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropToPool}
        className="mt-3 min-h-[52px] rounded-md border border-dashed border-border p-2"
      >
        <p className="mb-1.5 text-xs font-medium text-muted">
          Oyuncu Havuzu <span className="text-muted">(sahaya sürükle)</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {pool.length === 0 && <span className="text-xs text-muted">Havuz boş</span>}
          {pool.map((p) => (
            <div
              key={p.id}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData(
                  "application/json",
                  JSON.stringify({ player: p, source: { type: "pool" } })
                )
              }
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-ink"
            >
              {p.name}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <PlayerSearch onAdd={addToPool} />
      </div>

      <button
        onClick={savePlan}
        className="mt-3 w-full rounded-md bg-accent py-2.5 text-sm font-medium text-white"
      >
        Taktiği Kaydet
      </button>

      {savedPlans.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-muted">Kayıtlı Taktikler</p>
          <ul className="space-y-1.5">
            {savedPlans.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2"
              >
                <button onClick={() => loadPlan(p)} className="text-left text-sm text-ink">
                  {p.name} <span className="text-xs text-muted">({p.formation})</span>
                </button>
                <button onClick={() => deletePlan(p.id)} className="text-xs text-red-400">
                  Sil
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
