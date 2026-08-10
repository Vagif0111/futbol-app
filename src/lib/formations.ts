// x: 0 (sol) - 100 (sağ), y: 0 (rakip kale) - 100 (kendi kalesi)
export interface Slot {
  id: string;
  x: number;
  y: number;
  label: string;
}

export const FORMATIONS: Record<string, Slot[]> = {
  "4-3-3": [
    { id: "gk", x: 50, y: 92, label: "GK" },
    { id: "lb", x: 15, y: 72, label: "SL" },
    { id: "cb1", x: 37, y: 76, label: "STP" },
    { id: "cb2", x: 63, y: 76, label: "STP" },
    { id: "rb", x: 85, y: 72, label: "SĞ" },
    { id: "cm1", x: 30, y: 50, label: "OS" },
    { id: "cm2", x: 50, y: 46, label: "OS" },
    { id: "cm3", x: 70, y: 50, label: "OS" },
    { id: "lw", x: 18, y: 20, label: "SLK" },
    { id: "st", x: 50, y: 14, label: "FRV" },
    { id: "rw", x: 82, y: 20, label: "SĞK" },
  ],
  "4-4-2": [
    { id: "gk", x: 50, y: 92, label: "GK" },
    { id: "lb", x: 15, y: 72, label: "SL" },
    { id: "cb1", x: 37, y: 76, label: "STP" },
    { id: "cb2", x: 63, y: 76, label: "STP" },
    { id: "rb", x: 85, y: 72, label: "SĞ" },
    { id: "lm", x: 15, y: 46, label: "SL Orta" },
    { id: "cm1", x: 40, y: 50, label: "OS" },
    { id: "cm2", x: 60, y: 50, label: "OS" },
    { id: "rm", x: 85, y: 46, label: "SĞ Orta" },
    { id: "st1", x: 38, y: 16, label: "FRV" },
    { id: "st2", x: 62, y: 16, label: "FRV" },
  ],
  "4-2-3-1": [
    { id: "gk", x: 50, y: 92, label: "GK" },
    { id: "lb", x: 15, y: 72, label: "SL" },
    { id: "cb1", x: 37, y: 76, label: "STP" },
    { id: "cb2", x: 63, y: 76, label: "STP" },
    { id: "rb", x: 85, y: 72, label: "SĞ" },
    { id: "dm1", x: 38, y: 58, label: "DOS" },
    { id: "dm2", x: 62, y: 58, label: "DOS" },
    { id: "cam", x: 50, y: 36, label: "OOS" },
    { id: "lw", x: 18, y: 32, label: "SLK" },
    { id: "rw", x: 82, y: 32, label: "SĞK" },
    { id: "st", x: 50, y: 14, label: "FRV" },
  ],
  "3-5-2": [
    { id: "gk", x: 50, y: 92, label: "GK" },
    { id: "cb1", x: 28, y: 76, label: "STP" },
    { id: "cb2", x: 50, y: 80, label: "STP" },
    { id: "cb3", x: 72, y: 76, label: "STP" },
    { id: "lwb", x: 10, y: 50, label: "SL KB" },
    { id: "cm1", x: 35, y: 52, label: "OS" },
    { id: "cm2", x: 50, y: 46, label: "OS" },
    { id: "cm3", x: 65, y: 52, label: "OS" },
    { id: "rwb", x: 90, y: 50, label: "SĞ KB" },
    { id: "st1", x: 40, y: 16, label: "FRV" },
    { id: "st2", x: 60, y: 16, label: "FRV" },
  ],
  "3-4-3": [
    { id: "gk", x: 50, y: 92, label: "GK" },
    { id: "cb1", x: 28, y: 76, label: "STP" },
    { id: "cb2", x: 50, y: 80, label: "STP" },
    { id: "cb3", x: 72, y: 76, label: "STP" },
    { id: "lm", x: 12, y: 48, label: "SL Orta" },
    { id: "cm1", x: 38, y: 52, label: "OS" },
    { id: "cm2", x: 62, y: 52, label: "OS" },
    { id: "rm", x: 88, y: 48, label: "SĞ Orta" },
    { id: "lw", x: 20, y: 16, label: "SLK" },
    { id: "st", x: 50, y: 12, label: "FRV" },
    { id: "rw", x: 80, y: 16, label: "SĞK" },
  ],
  "5-3-2": [
    { id: "gk", x: 50, y: 92, label: "GK" },
    { id: "lwb", x: 8, y: 66, label: "SL KB" },
    { id: "cb1", x: 30, y: 78, label: "STP" },
    { id: "cb2", x: 50, y: 82, label: "STP" },
    { id: "cb3", x: 70, y: 78, label: "STP" },
    { id: "rwb", x: 92, y: 66, label: "SĞ KB" },
    { id: "cm1", x: 32, y: 48, label: "OS" },
    { id: "cm2", x: 50, y: 44, label: "OS" },
    { id: "cm3", x: 68, y: 48, label: "OS" },
    { id: "st1", x: 40, y: 16, label: "FRV" },
    { id: "st2", x: 60, y: 16, label: "FRV" },
  ],
};

export const FORMATION_NAMES = Object.keys(FORMATIONS);
