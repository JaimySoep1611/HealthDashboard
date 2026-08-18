"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WEEKDAY_LABELS, WEEKDAY_SHORT } from "@/lib/weekdays";
import { FootprintsIcon, CloseIcon, PushIcon, PullIcon, LegsIcon, TargetIcon, MoonIcon, CheckIcon } from "@/components/icons";
import { categorizeExercise, CATEGORY_COLORS, CARDIO_COLOR } from "@/lib/exerciseCategory";

type Log = {
  kg: number | null;
  sets: number | null;
  reps: number | null;
  km: number | null;
  stravaActivityId?: string | null;
  movingTimeSec?: number | null;
  elevationGainM?: number | null;
  avgSpeedMps?: number | null;
};
type Exercise = {
  id: string;
  name: string;
  weekday: number;
  kind: "weight" | "cardio";
  log: Log | null;
};

const CATEGORY_ICONS = {
  push: PushIcon,
  pull: PullIcon,
  legs: LegsIcon,
  core: TargetIcon,
} as const;

function exerciseIconAndColor(exercise: Exercise) {
  if (exercise.kind === "cardio") {
    return { Icon: FootprintsIcon, color: CARDIO_COLOR };
  }
  const category = categorizeExercise(exercise.name);
  return { Icon: CATEGORY_ICONS[category], color: CATEGORY_COLORS[category] };
}

function useTodayWeekday() {
  // Computed client-side from the browser's own clock (correct for whoever's
  // looking at it) — starts null and fills in post-mount to avoid a
  // server/client render mismatch, same pattern as the theme toggle.
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    const jsDay = new Date().getDay();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(jsDay === 0 ? 6 : jsDay - 1);
  }, []);
  return today;
}

export function WeeklySchedule({
  exercises,
  editable,
}: {
  exercises: Exercise[];
  // Adding/removing exercises is only allowed from the "Edit Goals" page —
  // the dashboard is for logging what you did, not changing the schedule.
  editable: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [weekday, setWeekday] = useState("0");
  const [kind, setKind] = useState<"weight" | "cardio">("weight");
  const [adding, setAdding] = useState(false);
  const todayWeekday = useTodayWeekday();

  async function addExercise(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    await fetch("/api/training/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, weekday: Number(weekday), kind }),
    });
    setName("");
    setAdding(false);
    router.refresh();
  }

  async function removeExercise(exerciseId: string) {
    if (!confirm("Remove this exercise from the schedule?")) return;
    await fetch(`/api/training/exercises/${exerciseId}`, { method: "DELETE" });
    router.refresh();
  }

  const byDay = new Map<number, Exercise[]>();
  for (const exercise of exercises) {
    const list = byDay.get(exercise.weekday) ?? [];
    list.push(exercise);
    byDay.set(exercise.weekday, list);
  }

  return (
    <div className="tile flex flex-col gap-4 p-6">
      <h3 className="font-medium">Training schedule</h3>

      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-7 sm:overflow-visible sm:px-0 sm:pb-0">
        {WEEKDAY_SHORT.map((label, day) => {
          const dayExercises = byDay.get(day) ?? [];
          const isToday = day === todayWeekday;
          const isRestDay = dayExercises.length === 0;
          // A rest day only counts as "done" once it's actually today or in
          // the past — a rest day later this week hasn't happened yet, so it
          // shouldn't look complete before it's even here. todayWeekday is
          // null pre-hydration, which correctly keeps every rest day
          // non-done until then rather than flashing green.
          const isPastOrToday = todayWeekday !== null && day <= todayWeekday;
          const isDone = (isRestDay && isPastOrToday) || (!isRestDay && dayExercises.every((exercise) => exercise.log));

          return (
            <div
              key={day}
              className={`flex w-28 flex-none snap-start flex-col gap-2 rounded-xl border p-3 transition-colors sm:w-auto ${
                isDone
                  ? "border-emerald-400/50 bg-emerald-400/10"
                  : isToday
                    ? "border-navy-light bg-navy-light/10"
                    : "border-border bg-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    isToday ? "text-foreground" : "text-muted"
                  }`}
                >
                  {label}
                </span>
                {isDone && (
                  <span className="flex-none text-emerald-400">
                    <CheckIcon size={12} />
                  </span>
                )}
              </div>

              {isRestDay ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-5 text-center text-muted">
                  <MoonIcon size={16} className="opacity-60" />
                  <span className="text-[10px]">Rest</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayExercises.map((exercise) =>
                    editable ? (
                      <ScheduleOnlyChip
                        key={exercise.id}
                        exercise={exercise}
                        onRemove={() => removeExercise(exercise.id)}
                      />
                    ) : (
                      <ExerciseChip key={exercise.id} exercise={exercise} />
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editable ? (
        <form onSubmit={addExercise} className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Bench press"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-navy-light"
          />
          <select
            value={weekday}
            onChange={(event) => setWeekday(event.target.value)}
            className="rounded-lg border border-border bg-surface-raised px-2 py-2 text-sm outline-none focus:border-navy-light"
          >
            {WEEKDAY_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as "weight" | "cardio")}
            className="rounded-lg border border-border bg-surface-raised px-2 py-2 text-sm outline-none focus:border-navy-light"
          >
            <option value="weight">Power training (kg)</option>
            <option value="cardio">Running (km)</option>
          </select>
          <button
            type="submit"
            disabled={adding || !name.trim()}
            className="flex-none rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
          >
            Add
          </button>
        </form>
      ) : (
        <p className="border-t border-border pt-3 text-xs text-muted">
          Add or remove exercises from &quot;Edit Goals&quot; in the header.
        </p>
      )}
    </div>
  );
}

// Edit Goals only edits the schedule (what's assigned to which day) — no
// logging UI here at all, so it can't be confused with the dashboard's
// "log what you did" view.
function ScheduleOnlyChip({ exercise, onRemove }: { exercise: Exercise; onRemove: () => void }) {
  const { Icon, color } = exerciseIconAndColor(exercise);

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised p-2">
      <span className="flex-none" style={{ color }}>
        <Icon size={12} />
      </span>
      <span className="min-w-0 flex-1 text-[11px] font-medium break-words">{exercise.name}</span>
      <button
        onClick={onRemove}
        aria-label={`Remove ${exercise.name}`}
        className="flex-none text-[11px] leading-none text-muted hover:text-red-400"
      >
        ×
      </button>
    </div>
  );
}

function ExerciseChip({ exercise }: { exercise: Exercise }) {
  const router = useRouter();
  // Always start collapsed, logged or not — a day with several exercises would
  // otherwise show several expanded input stacks at once and balloon in height.
  const [editing, setEditing] = useState(false);
  const [kg, setKg] = useState(exercise.log?.kg?.toString() ?? "");
  const [sets, setSets] = useState(exercise.log?.sets?.toString() ?? "");
  const [reps, setReps] = useState(exercise.log?.reps?.toString() ?? "");
  const [km, setKm] = useState(exercise.log?.km?.toString() ?? "");
  const [liveLog, setLiveLog] = useState(exercise.log);
  const [detailsOpen, setDetailsOpen] = useState(false);

  function save() {
    const payload = {
      kg: kg ? Number(kg) : null,
      sets: sets ? Number(sets) : null,
      reps: reps ? Number(reps) : null,
      km: km ? Number(km) : null,
    };
    setLiveLog(payload);
    setEditing(false);

    fetch(`/api/training/exercises/${exercise.id}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => router.refresh());
  }

  function clearLog() {
    setKg("");
    setSets("");
    setReps("");
    setKm("");
    setLiveLog(null);
    setEditing(false);

    // Deletes the row outright (rather than just nulling its fields) so this
    // exercise — and the day it belongs to — correctly count as "not logged"
    // again, matching how "Training days logged" is computed.
    fetch(`/api/training/exercises/${exercise.id}/log`, { method: "DELETE" }).then(() => router.refresh());
  }

  const inputClass =
    "w-full min-w-0 rounded-md border border-border bg-surface-raised px-1.5 py-1 text-[10px] outline-none focus:border-navy-light";
  const { Icon, color } = exerciseIconAndColor(exercise);

  return (
    <div className="rounded-lg border border-border bg-surface-raised p-2">
      <div className="mb-1.5 flex items-center gap-1">
        <span className="flex-none" style={{ color }}>
          <Icon size={12} />
        </span>
        <span className="min-w-0 flex-1 text-[11px] font-medium break-words">{exercise.name}</span>
        {liveLog?.stravaActivityId && (
          <button
            onClick={() => setDetailsOpen(true)}
            aria-label="View synced run details"
            title="Synced from Strava — tap for details"
            className="flex-none rounded-full px-1 py-0.5 text-[8px] font-bold leading-none text-white"
            style={{ backgroundColor: "#fc4c02" }}
          >
            S
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-1">
          {exercise.kind === "weight" ? (
            <>
              <input
                type="number"
                inputMode="decimal"
                value={kg}
                onChange={(event) => setKg(event.target.value)}
                placeholder="kg"
                className={inputClass}
              />
              <input
                type="number"
                inputMode="numeric"
                value={sets}
                onChange={(event) => setSets(event.target.value)}
                placeholder="sets"
                className={inputClass}
              />
              <input
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(event) => setReps(event.target.value)}
                placeholder="reps"
                className={inputClass}
              />
            </>
          ) : (
            <input
              type="number"
              inputMode="decimal"
              value={km}
              onChange={(event) => setKm(event.target.value)}
              placeholder="km"
              className={inputClass}
            />
          )}
          <div className="flex gap-1">
            <button
              onClick={save}
              className="flex-1 rounded-md bg-navy py-1 text-[10px] font-medium text-white transition hover:bg-navy-light"
            >
              Log
            </button>
            {liveLog && (
              <button
                onClick={clearLog}
                className="flex-none rounded-md border border-border px-2 py-1 text-[10px] text-muted transition hover:border-red-400 hover:text-red-400"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className={`w-full rounded-md border py-1 text-[10px] transition hover:border-navy-light ${
            liveLog ? "border-border text-foreground" : "border-dashed border-border text-muted hover:text-foreground"
          }`}
        >
          {liveLog
            ? exercise.kind === "weight"
              ? [
                  liveLog.kg != null ? `${liveLog.kg}kg` : null,
                  liveLog.sets != null && liveLog.reps != null
                    ? `${liveLog.sets}×${liveLog.reps}`
                    : liveLog.sets != null
                      ? `${liveLog.sets} sets`
                      : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : `${liveLog.km}km`
            : "Tap to log"}
        </button>
      )}

      {detailsOpen && liveLog && (
        <StravaDetailsModal name={exercise.name} log={liveLog} onClose={() => setDetailsOpen(false)} />
      )}
    </div>
  );
}

function StravaDetailsModal({ name, log, onClose }: { name: string; log: Log; onClose: () => void }) {
  const km = log.km ?? 0;
  const movingTimeSec = log.movingTimeSec ?? 0;
  const elevationGainM = log.elevationGainM ?? 0;
  const avgSpeedMps = log.avgSpeedMps ?? 0;

  const hours = Math.floor(movingTimeSec / 3600);
  const minutes = Math.floor((movingTimeSec % 3600) / 60);
  const seconds = Math.floor(movingTimeSec % 60);
  const durationText =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${minutes}:${String(seconds).padStart(2, "0")}`;

  const paceSecPerKm = avgSpeedMps > 0 ? 1000 / avgSpeedMps : 0;
  const paceMin = Math.floor(paceSecPerKm / 60);
  const paceSec = Math.round(paceSecPerKm % 60);
  const paceText = avgSpeedMps > 0 ? `${paceMin}:${String(paceSec).padStart(2, "0")} /km` : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="tile flex w-full max-w-xs flex-col gap-3 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{name}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-muted transition hover:text-foreground"
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <p className="text-xs" style={{ color: "#fc4c02" }}>
          Synced from Strava
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <DetailStat label="Distance" value={`${km.toFixed(2)} km`} />
          <DetailStat label="Duration" value={durationText} />
          <DetailStat label="Pace" value={paceText} />
          <DetailStat label="Elevation" value={`${Math.round(elevationGainM)} m`} />
        </div>
      </div>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
