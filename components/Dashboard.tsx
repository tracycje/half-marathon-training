"use client";

import { useEffect, useState } from "react";
import type { PlanProgress, RunLogEntry, RunType } from "@/lib/types";
import {
  PLAN,
  formatDuration,
  formatPace,
  paceSeconds,
  progressKey,
  totalPlannedRuns,
} from "@/lib/storage";

interface Props {
  runs: RunLogEntry[];
  progress: PlanProgress;
}

const TYPE_DOT: Record<RunType, string> = {
  Easy: "bg-emerald-300",
  Tempo: "bg-amber-300",
  Long: "bg-sky-300",
  Race: "bg-rose-300",
  Shakeout: "bg-zinc-300",
};

function computeStreak(runs: RunLogEntry[]): number {
  if (runs.length === 0) return 0;
  const days = new Set(runs.map((r) => r.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;

  let streak = 0;
  const cursor = new Date(today);
  if (!days.has(fmt(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(fmt(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function pickCurrentWeek(progress: PlanProgress) {
  for (const w of PLAN) {
    const allDone = w.runs.every((_, i) => progress[progressKey(w.week, i)]);
    if (!allDone) return w;
  }
  return PLAN[PLAN.length - 1];
}

export default function Dashboard({ runs, progress }: Props) {
  const totalRuns = runs.length;
  const totalKm = runs.reduce((sum, r) => sum + r.distance, 0);
  const totalSeconds = runs.reduce((sum, r) => sum + r.durationSeconds, 0);

  const planTotal = totalPlannedRuns();
  const checkedCount = Object.values(progress).filter(Boolean).length;
  const completionPct =
    planTotal > 0 ? Math.round((checkedCount / planTotal) * 100) : 0;

  const bestPaceSeconds = runs.reduce<number | null>((best, r) => {
    const p = paceSeconds(r.distance, r.durationSeconds);
    if (!p) return best;
    if (best === null || p < best) return p;
    return best;
  }, null);

  const streak = computeStreak(runs);
  const currentWeek = pickCurrentWeek(progress);

  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setBarWidth(completionPct));
    return () => cancelAnimationFrame(id);
  }, [completionPct]);

  return (
    <div className="space-y-7">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#b3a18d]">
          Training
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2a2118]">
          Dashboard
        </h1>
      </header>

      {/* Progress hero */}
      <section className="rounded-2xl border border-[#ece4d6] bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-[#9b8e7e]">
            Plan completion
          </span>
          <span
            className="text-3xl font-semibold text-[#2a2118]"
            style={{ fontFamily: "var(--font-dm-mono)" }}
          >
            {completionPct}%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f7efe3]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-300 transition-[width] duration-700 ease-out"
            style={{
              width: `${barWidth}%`,
              boxShadow: "0 0 12px rgba(251, 146, 60, 0.45)",
            }}
          />
        </div>
        <p className="mt-2 text-xs text-[#9b8e7e]">
          {checkedCount} of {planTotal} runs complete
        </p>
      </section>

      {/* Streak */}
      <section className="space-y-3">
        <div
          className="flex items-center justify-between rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-100 to-orange-50 p-5 shadow-sm"
          style={{ boxShadow: "inset 0 0 32px rgba(251, 146, 60, 0.08)" }}
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-orange-600">
              Current Streak
            </p>
            <p className="mt-1 text-xs text-[#9b8e7e]">
              {streak === 0
                ? "Start your streak today"
                : `${streak === 1 ? "day" : "days"} in a row`}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl">🔥</span>
            <span
              className="text-5xl font-semibold leading-none text-[#2a2118]"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              {streak}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Runs" value={totalRuns.toString()} />
          <StatCard
            label="Distance"
            value={`${totalKm.toFixed(1)}`}
            unit="km"
          />
          <StatCard label="Time" value={formatDuration(totalSeconds)} small />
          <StatCard
            label="Best Pace"
            value={
              bestPaceSeconds
                ? formatPace(bestPaceSeconds).replace("/km", "")
                : "—"
            }
            unit={bestPaceSeconds ? "/km" : undefined}
            accent
            small
          />
        </div>
      </section>

      {/* Weekly day strip */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-[#2a2118]">
            This week · Week {currentWeek.week}
          </h2>
          <span className="text-[11px] uppercase tracking-wider text-[#9b8e7e]">
            {currentWeek.phase}
          </span>
        </div>
        <p
          className="mt-0.5 text-xs text-orange-500"
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          {currentWeek.dates}
        </p>

        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {currentWeek.runs.map((run, i) => {
            const k = progressKey(currentWeek.week, i);
            const done = !!progress[k];
            return (
              <div
                key={k}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all shadow-sm ${
                  done
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-[#ece4d6] bg-white text-[#2a2118]"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${TYPE_DOT[run.type]}`} />
                <span className="font-medium">{run.type}</span>
                <span
                  className="text-[#9b8e7e]"
                  style={{ fontFamily: "var(--font-dm-mono)" }}
                >
                  {run.distance}km
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {runs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#ece4d6] p-8 text-center text-sm text-[#9b8e7e]">
          Log your first run to see stats here.
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  accent,
  small,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#ece4d6] bg-white p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-wider text-[#9b8e7e]">
        {label}
      </p>
      <p
        className={`mt-2 leading-none ${
          accent ? "text-orange-500" : "text-[#2a2118]"
        } ${small ? "text-[26px]" : "text-3xl"}`}
        style={{ fontFamily: "var(--font-dm-mono)", fontWeight: 500 }}
      >
        {value}
        {unit && (
          <span
            className="ml-1 text-sm text-[#9b8e7e]"
            style={{ fontWeight: 400 }}
          >
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
