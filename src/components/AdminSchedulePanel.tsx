"use client";

import { useState } from "react";
import React from "react";

interface Helper {
  id: number;
  name: string;
}

interface ScheduleAssignment {
  id: number;
  date: string;
  helper_id: number;
  helper_name: string;
}

interface Props {
  helpers: Helper[];
  assignments: ScheduleAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<ScheduleAssignment[]>>;
  scheduleLastDay: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWeeks(year: number, month: number, lastDay: number): (string | null)[][] {
  const firstDow = new Date(year, month, 1).getDay();
  const weeks: (string | null)[][] = [];
  let week: (string | null)[] = new Array(firstDow).fill(null);

  for (let d = 1; d <= lastDay; d++) {
    week.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

function getMonths(scheduleLastDay: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Default range: current month through end of next month
  const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  let endDate = defaultEnd;

  if (scheduleLastDay) {
    const ld = new Date(scheduleLastDay + "T00:00:00");
    if (ld < endDate) endDate = ld;
  }

  const months: { year: number; month: number; weeks: (string | null)[][] }[] = [];
  let cur = new Date(today.getFullYear(), today.getMonth(), 1);

  while (cur <= endDate) {
    const year = cur.getFullYear();
    const month = cur.getMonth();
    const monthEnd = new Date(year, month + 1, 0);
    const cutoff = endDate < monthEnd ? endDate.getDate() : monthEnd.getDate();
    months.push({ year, month, weeks: buildWeeks(year, month, cutoff) });
    cur = new Date(year, month + 1, 1);
  }

  return months;
}

export default function AdminSchedulePanel({
  helpers,
  assignments,
  setAssignments,
  scheduleLastDay,
}: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState<Record<string, boolean>>({});

  const today = new Date().toISOString().split("T")[0] as string;
  const months = getMonths(scheduleLastDay);

  const byDate = assignments.reduce<Record<string, ScheduleAssignment[]>>((acc, a) => {
    (acc[a.date] ??= []).push(a);
    return acc;
  }, {});

  async function addAssignment(date: string) {
    const helper_id = parseInt(selected[date] ?? "", 10);
    if (!helper_id) return;

    setAdding((p) => ({ ...p, [date]: true }));
    const res = await fetch("/api/admin/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, helper_id }),
    });
    if (res.ok) {
      const a: ScheduleAssignment = await res.json();
      setAssignments((p) => [...p, a].sort((x, y) =>
        x.date.localeCompare(y.date) || x.helper_name.localeCompare(y.helper_name)
      ));
      setSelected((p) => ({ ...p, [date]: "" }));
    }
    setAdding((p) => ({ ...p, [date]: false }));
  }

  async function removeAssignment(id: number) {
    setAssignments((p) => p.filter((a) => a.id !== id));
    await fetch(`/api/admin/schedule/${id}`, { method: "DELETE" });
  }

  if (helpers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="text-3xl mb-3">🫐</div>
        <p className="text-gray-600 font-medium">No helpers yet.</p>
        <p className="text-sm text-gray-400 mt-1">Add helpers on the Helpers tab first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {months.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="text-3xl mb-3">📅</div>
          <p className="text-gray-600 font-medium">No dates in range.</p>
          <p className="text-sm text-gray-400 mt-1">
            The last order date may be in the past. Update it in Settings.
          </p>
        </div>
      )}

      {months.map(({ year, month, weeks }) => (
        <section key={`${year}-${month}`}>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            {MONTH_NAMES[month]} {year}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className="grid grid-cols-7 border-b border-gray-100 last:border-b-0"
              >
                {week.map((date, di) => {
                  if (!date) {
                    return (
                      <div
                        key={di}
                        className="min-h-[120px] bg-gray-50/60 border-r border-gray-100 last:border-r-0"
                      />
                    );
                  }

                  const isToday = date === today;
                  const isPast = date < today;
                  const dayAssignments = byDate[date] ?? [];
                  const assignedIds = new Set(dayAssignments.map((a) => a.helper_id));
                  const available = helpers.filter((h) => !assignedIds.has(h.id));
                  const dayNum = parseInt(date.split("-")[2] ?? "0", 10);

                  return (
                    <div
                      key={date}
                      className={`min-h-[120px] p-2 border-r border-gray-100 last:border-r-0 flex flex-col gap-1 ${
                        isToday
                          ? "bg-honey-50"
                          : isPast
                          ? "bg-gray-50/60"
                          : "bg-white"
                      }`}
                    >
                      {/* Day number */}
                      <div className="mb-1">
                        {isToday ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-honey-500 text-white text-xs font-bold">
                            {dayNum}
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-semibold ${
                              isPast ? "text-gray-400" : "text-gray-700"
                            }`}
                          >
                            {dayNum}
                          </span>
                        )}
                      </div>

                      {/* Assigned helpers */}
                      <div className="flex flex-col gap-0.5 flex-1">
                        {dayAssignments.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center gap-1 text-xs bg-berry-100 text-berry-800 rounded px-1.5 py-0.5"
                          >
                            <span className="flex-1 truncate">{a.helper_name}</span>
                            <button
                              onClick={() => removeAssignment(a.id)}
                              className="text-berry-400 hover:text-red-600 font-bold leading-none shrink-0 transition-colors"
                              aria-label={`Remove ${a.helper_name}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add helper control */}
                      {available.length > 0 && (
                        <div className="flex items-center gap-1 mt-auto pt-1">
                          <select
                            value={selected[date] ?? ""}
                            onChange={(e) =>
                              setSelected((p) => ({ ...p, [date]: e.target.value }))
                            }
                            className="flex-1 text-xs border border-gray-200 rounded px-1 py-0.5 bg-white min-w-0 outline-none focus:ring-1 focus:ring-honey-400"
                          >
                            <option value="">Add…</option>
                            {available.map((h) => (
                              <option key={h.id} value={String(h.id)}>
                                {h.name}
                              </option>
                            ))}
                          </select>
                          {selected[date] && (
                            <button
                              onClick={() => addAssignment(date)}
                              disabled={adding[date]}
                              className="text-xs bg-honey-500 hover:bg-honey-600 disabled:opacity-60 text-white px-1.5 py-0.5 rounded shrink-0 font-semibold transition-colors"
                            >
                              {adding[date] ? "…" : "Add"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
