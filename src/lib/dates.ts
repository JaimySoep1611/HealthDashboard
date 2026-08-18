// Both users are in the Netherlands, but the server runs in UTC — setHours(0,0,0,0)
// would anchor to midnight UTC, which is 1-2 hours *after* midnight in the
// Netherlands, so entries logged right after midnight local time would land on
// the wrong day. Resolve the calendar day in Europe/Amsterdam explicitly instead.
const TIME_ZONE = "Europe/Amsterdam";

export function startOfDay(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

// Calendar week starting Monday
export function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  const day = result.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - diffToMonday);
  return result;
}

// 0 = Monday ... 6 = Sunday, matching TrainingExercise.weekday
export function weekdayIndex(date: Date): number {
  const day = date.getDay(); // 0 = Sunday
  return day === 0 ? 6 : day - 1;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Local clock time in Amsterdam — correctly accounts for the CET/CEST
// daylight-saving switch (unlike a fixed UTC offset), same reason startOfDay
// above resolves the calendar day via Intl instead of a hardcoded offset.
export function amsterdamHourMinute(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return {
    hour: Number(parts.find((p) => p.type === "hour")!.value),
    minute: Number(parts.find((p) => p.type === "minute")!.value),
  };
}

export function isAtOrAfterAmsterdamTime(date: Date, hour: number, minute: number): boolean {
  const local = amsterdamHourMinute(date);
  return local.hour * 60 + local.minute >= hour * 60 + minute;
}
