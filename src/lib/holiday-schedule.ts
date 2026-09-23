export interface HolidaySession {
  date: string;
  time: string;
  activity?: string;
}

export interface HolidaySchedule {
  week_1?: HolidaySession[];
  week_2?: HolidaySession[];
}

export function isHolidayDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function minutes(value: string): number {
  const match = /^([1-9]|1[0-2]):([0-5]\d) ?(am|pm)$/i.exec(value.trim());
  return match ? (Number(match[1]) % 12 + (match[3].toLowerCase() === 'pm' ? 12 : 0)) * 60 + Number(match[2]) : NaN;
}

function timeRange(value: string): number[] {
  return value.split(/\s*[\u2013\u2014-]\s*/).map(minutes);
}

export function validateHolidaySchedule(schedule: HolidaySchedule = {}): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const [key, label] of [['week_1', 'Week 1'], ['week_2', 'Week 2']] as const) {
    for (const session of schedule[key] ?? []) {
      if (!isHolidayDate(session.date)) errors.push(`${label}: choose a real calendar date.`);
      const [start, end, extra] = timeRange(session.time);
      if (!(end > start) || extra !== undefined) errors.push(`${label}, ${session.date}: use a valid time range with the finish after the start.`);
      const identity = `${session.date}/${start}/${end}/${session.activity?.trim().toLowerCase() ?? ''}`;
      if (seen.has(identity)) errors.push(`${label}, ${session.date}: this session is listed twice.`);
      seen.add(identity);
    }
  }
  const first = (schedule.week_1 ?? []).map(row => row.date).filter(isHolidayDate).sort();
  const second = (schedule.week_2 ?? []).map(row => row.date).filter(isHolidayDate).sort();
  if (first.length && second.length && first.at(-1)! >= second[0]) {
    errors.push('Week 2 dates must come after Week 1 dates.');
  }
  return errors;
}

export function holidayWeeks(schedule: HolidaySchedule = {}) {
  return (['week_1', 'week_2'] as const).map((key, index) => ({
    key,
    label: `Week ${index + 1}`,
    sessions: [...(schedule[key] ?? [])].sort((a, b) => a.date.localeCompare(b.date) || timeRange(a.time)[0] - timeRange(b.time)[0]),
  }));
}

export function hasHolidaySessions(schedule: HolidaySchedule = {}): boolean {
  return Boolean(schedule.week_1?.length || schedule.week_2?.length);
}

export function holidayDateLabel(date: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
