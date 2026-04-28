import type { PlanProgress, PlannedWeek, RunLogEntry } from "./types";

const PROGRESS_KEY = "hm_plan_progress";
const RUNS_KEY = "hm_run_log";

const isBrowser = () => typeof window !== "undefined";

export const PLAN: PlannedWeek[] = [
  {
    week: 1,
    phase: "Base",
    dates: "Apr 27 – May 3",
    runs: [
      { type: "Easy", distance: 5, paceLabel: "7:30–8:00/km" },
      { type: "Long", distance: 10, paceLabel: "7:30–8:00/km" },
    ],
  },
  {
    week: 2,
    phase: "Base",
    dates: "May 4 – May 10",
    runs: [
      { type: "Easy", distance: 5, paceLabel: "7:30–8:00/km" },
      { type: "Tempo", distance: 4, paceLabel: "6:20–6:45/km" },
      { type: "Long", distance: 11, paceLabel: "7:30–8:00/km" },
    ],
  },
  {
    week: 3,
    phase: "Base",
    dates: "May 11 – May 17",
    runs: [
      { type: "Easy", distance: 6, paceLabel: "7:30–8:00/km" },
      { type: "Long", distance: 12, paceLabel: "7:30–8:00/km" },
    ],
  },
  {
    week: 4,
    phase: "Base · Recovery",
    dates: "May 18 – May 24",
    runs: [
      { type: "Easy", distance: 5, paceLabel: "7:30–8:00/km" },
      { type: "Tempo", distance: 4, paceLabel: "6:20–6:45/km" },
      { type: "Long", distance: 11, paceLabel: "7:30–8:00/km" },
    ],
  },
  {
    week: 5,
    phase: "Build",
    dates: "May 25 – May 31",
    runs: [
      { type: "Easy", distance: 6, paceLabel: "7:30–8:00/km" },
      { type: "Tempo", distance: 5, paceLabel: "6:20–6:45/km" },
      { type: "Long", distance: 14, paceLabel: "7:30–8:00/km" },
    ],
  },
  {
    week: 6,
    phase: "Build",
    dates: "Jun 1 – Jun 7",
    runs: [
      { type: "Easy", distance: 7, paceLabel: "7:30–8:00/km" },
      { type: "Tempo", distance: 6, paceLabel: "6:20–6:45/km" },
      { type: "Long", distance: 15, paceLabel: "7:30–8:00/km" },
    ],
  },
  {
    week: 7,
    phase: "Build",
    dates: "Jun 8 – Jun 14",
    runs: [
      { type: "Easy", distance: 7, paceLabel: "7:30–8:00/km" },
      { type: "Tempo", distance: 7, paceLabel: "6:20–6:45/km" },
      { type: "Long", distance: 17, paceLabel: "7:30–8:00/km" },
    ],
  },
  {
    week: 8,
    phase: "Build · Recovery",
    dates: "Jun 15 – Jun 21",
    runs: [
      { type: "Easy", distance: 5, paceLabel: "7:30–8:00/km" },
      { type: "Tempo", distance: 5, paceLabel: "6:20–6:45/km" },
      { type: "Long", distance: 13, paceLabel: "7:30–8:00/km" },
    ],
  },
  {
    week: 9,
    phase: "Peak",
    dates: "Jun 22 – Jun 28",
    runs: [
      { type: "Easy", distance: 6, paceLabel: "7:30–8:00/km" },
      { type: "Tempo", distance: 6, paceLabel: "6:20–6:45/km" },
      { type: "Long", distance: 19, paceLabel: "7:30–8:00/km" },
    ],
  },
  {
    week: 10,
    phase: "Taper",
    dates: "Jun 29 – Jul 5",
    runs: [
      { type: "Easy", distance: 5, paceLabel: "7:30–8:00/km" },
      { type: "Long", distance: 12, paceLabel: "7:30–8:00/km" },
    ],
  },
  {
    week: 11,
    phase: "Race Week 🏁",
    dates: "Jul 6 – Jul 12",
    runs: [
      { type: "Shakeout", distance: 4, paceLabel: "7:30–8:00/km" },
      { type: "Race", distance: 21.1, paceLabel: "6:23/km target" },
    ],
  },
];

export function totalPlannedRuns(): number {
  return PLAN.reduce((sum, w) => sum + w.runs.length, 0);
}

export function progressKey(week: number, runIndex: number): string {
  return `${week}-${runIndex}`;
}

export function loadProgress(): PlanProgress {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as PlanProgress) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: PlanProgress): void {
  if (!isBrowser()) return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadRuns(): RunLogEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    return raw ? (JSON.parse(raw) as RunLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveRuns(runs: RunLogEntry[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
}

export function parseDuration(hms: string): number {
  const parts = hms.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  const [h, m, s] = parts.length === 3 ? parts : [0, parts[0] ?? 0, parts[1] ?? 0];
  return h * 3600 + m * 60 + s;
}

export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds < 0) return "0:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm || !Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return "—";
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}/km`;
}

export function paceSeconds(distance: number, durationSeconds: number): number {
  if (!distance || distance <= 0) return 0;
  return durationSeconds / distance;
}
