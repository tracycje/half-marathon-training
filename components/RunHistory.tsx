"use client";

import { useRef, useState } from "react";
import type { RunLogEntry, RunType } from "@/lib/types";
import { formatDuration, formatPace, paceSeconds } from "@/lib/storage";

interface Props {
  runs: RunLogEntry[];
  onDelete: (id: string) => void;
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

function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const REVEAL_PX = 88;
const SWIPE_TRIGGER = 60;
const LONG_PRESS_MS = 500;

export default function RunHistory({ runs, onDelete }: Props) {
  const sorted = [...runs].sort((a, b) => (a.date < b.date ? 1 : -1));
  const [revealedId, setRevealedId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <header>
        <p
          className="text-[11px] uppercase tracking-[0.2em] text-[#b3a18d]"
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          {runs.length} run{runs.length === 1 ? "" : "s"}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2a2118]">
          History
        </h1>
      </header>

      {sorted.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {sorted.map((r) => (
            <HistoryRow
              key={r.id}
              run={r}
              revealed={revealedId === r.id}
              onReveal={() => setRevealedId(r.id)}
              onClose={() => setRevealedId(null)}
              onDelete={() => {
                onDelete(r.id);
                setRevealedId(null);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function HistoryRow({
  run,
  revealed,
  onReveal,
  onClose,
  onDelete,
}: {
  run: RunLogEntry;
  revealed: boolean;
  onReveal: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const pace = paceSeconds(run.distance, run.durationSeconds);
  const [dragX, setDragX] = useState(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const longPressTimer = useRef<number | null>(null);
  const movedRef = useRef(false);

  function clearLongPress() {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    draggingRef.current = true;
    movedRef.current = false;
    longPressTimer.current = window.setTimeout(() => {
      if (!movedRef.current) onReveal();
    }, LONG_PRESS_MS);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || startX.current === null) return;
    const dx = e.clientX - startX.current;
    const dy =
      (startY.current ?? 0) === 0 ? 0 : e.clientY - (startY.current ?? 0);

    if (!movedRef.current && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      movedRef.current = true;
      clearLongPress();
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      const next = Math.max(-REVEAL_PX, Math.min(0, dx));
      setDragX(next);
    }
  }

  function handlePointerUp() {
    clearLongPress();
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (dragX <= -SWIPE_TRIGGER) {
      onReveal();
    }
    setDragX(0);
    startX.current = null;
    startY.current = null;
  }

  function handlePointerCancel() {
    clearLongPress();
    draggingRef.current = false;
    setDragX(0);
    startX.current = null;
    startY.current = null;
  }

  function handleRowClick() {
    if (revealed) onClose();
  }

  const offset = revealed ? -REVEAL_PX : dragX;

  return (
    <li className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 right-0 flex w-[88px] items-stretch">
        <button
          type="button"
          onClick={onDelete}
          className="flex w-full items-center justify-center rounded-2xl bg-rose-300 text-sm font-semibold text-rose-900 transition hover:bg-rose-400"
          aria-label="Delete run"
        >
          Delete
        </button>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerUp}
        onClick={handleRowClick}
        className={`relative touch-pan-y select-none rounded-2xl border border-[#ece4d6] bg-white border-l-4 p-4 shadow-sm transition-transform ${
          TYPE_BORDER[run.type]
        }`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: draggingRef.current
            ? "none"
            : "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[#2a2118]">
                {formatDateLabel(run.date)}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  TYPE_TEXT[run.type]
                }`}
              >
                {run.type}
              </span>
            </div>

            <p
              className="mt-2 text-3xl leading-none text-[#2a2118]"
              style={{ fontFamily: "var(--font-dm-mono)", fontWeight: 500 }}
            >
              {formatPace(pace)}
            </p>

            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-[#9b8e7e]">
              <span style={{ fontFamily: "var(--font-dm-mono)" }}>
                {run.distance.toFixed(2)}km
              </span>
              <span style={{ fontFamily: "var(--font-dm-mono)" }}>
                {formatDuration(run.durationSeconds)}
              </span>
            </div>

            {run.notes && (
              <p className="mt-2 text-sm text-[#5e554a]">{run.notes}</p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ece4d6] bg-white py-14 px-6 text-center shadow-sm">
      <svg
        viewBox="0 0 96 96"
        className="h-20 w-20 text-orange-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="58" cy="20" r="6" />
        <path d="M55 30 L46 48 L36 50" />
        <path d="M46 48 L34 40" />
        <path d="M55 30 L66 38 L72 32" />
        <path d="M46 48 L40 70 L30 76" />
        <path d="M50 42 L62 60 L72 62" />
        <path d="M14 36 L24 36" opacity="0.5" />
        <path d="M10 46 L22 46" opacity="0.4" />
        <path d="M16 56 L26 56" opacity="0.3" />
      </svg>
      <p className="mt-4 text-sm font-medium text-[#2a2118]">
        No runs logged yet
      </p>
      <p className="mt-1 text-xs text-[#9b8e7e]">
        Tap Log to add your first run.
      </p>
    </div>
  );
}
