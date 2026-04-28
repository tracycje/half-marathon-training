export type RunType = "Easy" | "Tempo" | "Long" | "Race" | "Shakeout";

export interface PlannedRun {
  type: RunType;
  distance: number;
  paceLabel: string;
}

export interface PlannedWeek {
  week: number;
  phase: string;
  dates: string;
  runs: PlannedRun[];
}

export interface RunLogEntry {
  id: string;
  date: string;
  distance: number;
  durationSeconds: number;
  type: RunType;
  notes?: string;
}

export type PlanProgress = Record<string, boolean>;
