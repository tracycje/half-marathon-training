"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import PlanChecklist from "@/components/PlanChecklist";
import RunLogger from "@/components/RunLogger";
import RunHistory from "@/components/RunHistory";
import {
  loadProgress,
  loadRuns,
  saveProgress,
  saveRuns,
} from "@/lib/storage";
import type { PlanProgress, RunLogEntry } from "@/lib/types";

type Tab = "dashboard" | "plan" | "log" | "history";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { id: "plan", label: "Plan", icon: <PlanIcon /> },
  { id: "log", label: "Log", icon: <LogIcon /> },
  { id: "history", label: "History", icon: <HistoryIcon /> },
];

export default function Home() {
  const [active, setActive] = useState<Tab>("dashboard");
  const [hydrated, setHydrated] = useState(false);
  const [progress, setProgress] = useState<PlanProgress>({});
  const [runs, setRuns] = useState<RunLogEntry[]>([]);

  useEffect(() => {
    setProgress(loadProgress());
    setRuns(loadRuns());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProgress(progress);
  }, [progress, hydrated]);

  useEffect(() => {
    if (hydrated) saveRuns(runs);
  }, [runs, hydrated]);

  function toggleProgress(key: string) {
    setProgress((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function addRun(entry: RunLogEntry) {
    setRuns((prev) => [entry, ...prev]);
    setActive("history");
  }

  function deleteRun(id: string) {
    setRuns((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div
      className="mx-auto flex w-full max-w-xl flex-col"
      style={{ minHeight: "100dvh" }}
    >
      <main
        className="flex-1"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 6rem)",
          paddingLeft: "calc(env(safe-area-inset-left) + 1.25rem)",
          paddingRight: "calc(env(safe-area-inset-right) + 1.25rem)",
        }}
      >
        {!hydrated ? (
          <div className="flex h-64 items-center justify-center text-[#9b8e7e]">
            Loading…
          </div>
        ) : (
          <div key={active} className="fade-slide">
            {active === "dashboard" && (
              <Dashboard runs={runs} progress={progress} />
            )}
            {active === "plan" && (
              <PlanChecklist progress={progress} onToggle={toggleProgress} />
            )}
            {active === "log" && <RunLogger onSubmit={addRun} />}
            {active === "history" && (
              <RunHistory runs={runs} onDelete={deleteRun} />
            )}
          </div>
        )}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-[#ece4d6]"
        style={{
          background: "rgba(253, 248, 243, 0.72)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
        }}
      >
        <div
          className="mx-auto flex w-full max-w-xl items-stretch justify-around pt-1"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)",
            paddingLeft: "calc(env(safe-area-inset-left) + 0.5rem)",
            paddingRight: "calc(env(safe-area-inset-right) + 0.5rem)",
          }}
        >
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`relative flex flex-1 flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "text-orange-500"
                    : "text-[#b3a18d] hover:text-[#5e554a]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`absolute top-0 h-1 w-8 rounded-full bg-orange-400 transition-all duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    boxShadow: isActive
                      ? "0 0 12px rgba(251, 146, 60, 0.6)"
                      : undefined,
                  }}
                />
                <span
                  className={`flex h-6 w-6 items-center justify-center transition-transform ${
                    isActive ? "scale-110" : ""
                  }`}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h4v-6h6v6h4V10" />
    </svg>
  );
}

function PlanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5" />
    </svg>
  );
}

function LogIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}
