export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

// Calendar week starting Monday
export function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  const day = result.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - diffToMonday);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
