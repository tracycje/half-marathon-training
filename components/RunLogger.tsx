"use client";

import { useMemo, useState } from "react";
import type { RunLogEntry, RunType } from "@/lib/types";
import { formatPace, parseDuration, paceSeconds } from "@/lib/storage";

interface Props {
  onSubmit: (entry: RunLogEntry) => void;
}

const RUN_TYPES: RunType[] = ["Easy", "Tempo", "Long", "Race"];

function todayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const inputBase =
  "w-full bg-[#f7efe3] text-[#2a2118] placeholder-[#b3a18d] rounded-lg px-3 py-3 text-base outline-none border-0 border-b-2 border-transparent transition-colors focus:border-orange-400";

export default function RunLogger({ onSubmit }: Props) {
  const [date, setDate] = useState(todayIso());
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [type, setType] = useState<RunType>("Easy");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const distanceNum = parseFloat(distance);
  const durationSeconds = useMemo(() => parseDuration(duration), [duration]);
  const livePace = useMemo(() => {
    if (
      !Number.isFinite(distanceNum) ||
      distanceNum <= 0 ||
      durationSeconds <= 0
    ) {
      return null;
    }
    return paceSeconds(distanceNum, durationSeconds);
  }, [distanceNum, durationSeconds]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Pick a date.");
      return;
    }
    if (!Number.isFinite(distanceNum) || distanceNum <= 0) {
      setError("Distance must be greater than zero.");
      return;
    }
    if (durationSeconds <= 0) {
      setError("Duration must be in hh:mm:ss (e.g. 0:55:30).");
      return;
    }

    const entry: RunLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date,
      distance: distanceNum,
      durationSeconds,
      type,
      notes: notes.trim() || undefined,
    };

    onSubmit(entry);

    setDistance("");
    setDuration("");
    setNotes("");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#b3a18d]">
          New entry
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2a2118]">
          Log a Run
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputBase}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Distance (km)">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="10.0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className={inputBase}
              style={{ fontFamily: "var(--font-dm-mono)" }}
            />
          </Field>
          <Field label="Duration (hh:mm:ss)">
            <input
              type="text"
              inputMode="numeric"
              placeholder="0:55:30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={inputBase}
              style={{ fontFamily: "var(--font-dm-mono)" }}
            />
          </Field>
        </div>

        <Field label="Run type">
          <div className="grid grid-cols-4 gap-2">
            {RUN_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg px-2 py-2.5 text-sm font-medium transition ${
                  type === t
                    ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300"
                    : "bg-[#f7efe3] text-[#9b8e7e] hover:text-[#2a2118]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Notes (optional)">
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel?"
            className={`${inputBase} resize-none`}
          />
        </Field>

        {/* Live pace readout */}
        <div className="rounded-2xl border border-[#ece4d6] bg-white px-5 py-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b8e7e]">
            Live pace
          </p>
          <p
            className={`mt-1 text-4xl leading-none ${
              livePace ? "text-orange-500" : "text-[#d6c8b6]"
            }`}
            style={{ fontFamily: "var(--font-dm-mono)", fontWeight: 500 }}
          >
            {livePace ? formatPace(livePace) : "—:——/km"}
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="cta-glow w-full rounded-xl bg-orange-400 py-3.5 text-base font-semibold text-white transition hover:bg-orange-500 active:bg-orange-500"
        >
          {savedFlash ? "Saved ✓" : "Save run"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b8e7e]">
        {label}
      </span>
      {children}
    </label>
  );
}
