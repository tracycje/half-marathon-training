"use client";

import { useState } from "react";
import type { PlanProgress, RunType } from "@/lib/types";
import { PLAN, progressKey } from "@/lib/storage";

interface Props {
  progress: PlanProgress;
  onToggle: (key: string) => void;
}

const TYPE_BORDER: Record<RunType, string> = {
  Easy: "border-l-emerald-300",
  Tempo: "border-l-amber-300",
  Long: "border-l-sky-300",
  Race: "border-l-rose-300",
  Shakeout: "border-l-zinc-300",
};

const TYPE_TEXT: Record<RunType, string> = {
  Easy: "text-emerald-600",
  Tempo: "text-amber-600",
  Long: "text-sky-600",
  Race: "text-rose-600",
  Shakeout: "text-zinc-500",
};

function phasePill(phase: string): { label: string; classes: string } {
  if (phase.startsWith("Race"))
    return {
      label: phase,
      classes: "bg-rose-100 text-rose-700 border-rose-200",
    };
  if (phase.startsWith("Taper"))
    return {
      label: phase,
      classes: "bg-teal-100 text-teal-700 border-teal-200",
    };
  if (phase.startsWith("Peak"))
    return {
      label: phase,
      classes: "bg-orange-100 text-orange-700 border-orange-200",
    };
  if (phase.startsWith("Build"))
    return {
      label: phase,
      classes: "bg-amber-100 text-amber-700 border-amber-200",
    };
  return {
    label: phase,
    classes: "bg-slate-100 text-slate-700 border-slate-200",
  };
}

function pickInitialOpenWeek(progress: PlanProgress): number {
  for (const w of PLAN) {
    const allDone = w.runs.every((_, i) => progress[progressKey(w.week, i)]);
    if (!allDone) return w.week;
  }
  return PLAN[PLAN.length - 1].week;
}

export default function PlanChecklist({ progress, onToggle }: Props) {
  const [open, setOpen] = useState<Set<number>>(
    () => new Set([pickInitialOpenWeek(progress)]),
  );

  function toggleOpen(week: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#b3a18d]">
          11 weeks
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2a2118]">
          Training Plan
        </h1>
      </header>

      <div className="space-y-3">
        {PLAN.map((week) => {
          const weekDoneCount = week.runs.filter(
            (_, i) => progress[progressKey(week.week, i)],
          ).length;
          const allDone = weekDoneCount === week.runs.length;
          const isOpen = open.has(week.week);
          const pill = phasePill(week.phase);

          return (
            <section
              key={week.week}
              className="overflow-hidden rounded-2xl border border-[#ece4d6] bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleOpen(week.week)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#fdf8f3]"
                aria-expanded={isOpen}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#2a2118]">
                      Week {week.week}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${pill.classes}`}
                    >
                      {pill.label}
                    </span>
                  </div>
                  <p
                    className="mt-0.5 text-xs text-orange-500"
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                  >
                    {week.dates}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      allDone ? "text-emerald-600" : "text-[#9b8e7e]"
                    }`}
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                  >
                    {weekDoneCount}/{week.runs.length}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-4 w-4 text-[#b3a18d] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 8l4 4 4-4"
                    />
                  </svg>
                </div>
              </button>

              <div className={`collapse-grid ${isOpen ? "open" : ""}`}>
                <div className="collapse-inner">
                  <ul className="border-t border-[#ece4d6] divide-y divide-[#f1ebe0]">
                    {week.runs.map((run, idx) => {
                      const key = progressKey(week.week, idx);
                      const checked = !!progress[key];
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() => onToggle(key)}
                            className={`flex w-full items-center gap-3 border-l-4 pr-4 py-3 pl-3 text-left transition-all hover:bg-[#fdf8f3] ${
                              TYPE_BORDER[run.type]
                            } ${
                              checked
                                ? "border-l-emerald-400 bg-emerald-50/60 opacity-70"
                                : ""
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                                checked
                                  ? "border-emerald-400 bg-emerald-400"
                                  : "border-[#ece4d6] bg-white"
                              }`}
                            >
                              {checked && (
                                <svg
                                  viewBox="0 0 20 20"
                                  className="h-4 w-4 text-white"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4L8.5 12l6.8-6.7a1 1 0 011.4 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </span>
                            <div className="flex flex-1 items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p
                                  className={`text-sm font-medium ${
                                    checked
                                      ? "text-[#9b8e7e] line-through"
                                      : "text-[#2a2118]"
                                  }`}
                                >
                                  <span
                                    style={{
                                      fontFamily: "var(--font-dm-mono)",
                                    }}
                                  >
                                    {run.distance}km
                                  </span>{" "}
                                  {run.type}
                                </p>
                                <p className="text-xs text-[#9b8e7e] truncate">
                                  {run.paceLabel}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider ${
                                  TYPE_TEXT[run.type]
                                }`}
                              >
                                {run.type}
                              </span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
