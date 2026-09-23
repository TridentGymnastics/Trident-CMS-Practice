export interface HolidaySession {
  date: string;
  start_time: string;
  end_time: string;
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
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? Number(value.slice(0,2))*60+Number(value.slice(3)) : NaN;
}
export function holidayTimeLabel(value: string): string {
  const hour = Number(value.slice(0, 2));
  return (hour % 12 || 12) + value.slice(2) + (hour >= 12 ? 'pm' : 'am');
}
export function holidaySessionTime(session: HolidaySession): string {
  return holidayTimeLabel(session.start_time) + ' - ' + holidayTimeLabel(session.end_time);
}

export function validateHolidaySchedule(schedule: HolidaySchedule = {}): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const [key, label] of [['week_1', 'Week 1'], ['week_2', 'Week 2']] as const) {
    for (const session of schedule[key] ?? []) {
      if (!isHolidayDate(session.date)) errors.push(`${label}: choose a real calendar date.`);
      const start = minutes(session.start_time), end = minutes(session.end_time);
      if (!(end > start)) errors.push(`${label}, ${session.date}: use a valid time range with the finish after the start.`);
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
    sessions: [...(schedule[key] ?? [])].sort((a, b) => a.date.localeCompare(b.date) || minutes(a.start_time) - minutes(b.start_time)),
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
