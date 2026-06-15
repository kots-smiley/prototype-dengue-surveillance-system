/** Monday-based week boundaries for surveillance rollups. */
export function startOfWeekMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function buildWeeklyBuckets(weeksCount: number, anchor = new Date()) {
  const thisWeekStart = startOfWeekMonday(anchor);
  return Array.from({ length: weeksCount }, (_, idx) => {
    const start = addDays(thisWeekStart, -(weeksCount - 1 - idx) * 7);
    const end = addDays(start, 7);
    return {
      start,
      end,
      label: `${formatShortDate(start)}-${formatShortDate(addDays(end, -1))}`,
    };
  });
}
