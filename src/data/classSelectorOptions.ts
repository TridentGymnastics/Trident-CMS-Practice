import { programNames, levelName, levelDescription, playgymSupervision, playgymAcceptsAgeSpan } from './programContent.ts';
import timetable from '../content/class-timetable.json' with { type: 'json' };
import playgym from '../content/playgym.json' with { type: 'json' };

export const ICLASSPRO_CLASSES_URL =
  'https://portal.iclasspro.com/trident/classes';

export const DAY_CODE_BY_NAME = {
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
} as const;

export type DayName = keyof typeof DAY_CODE_BY_NAME;
export type ClassType = 'free-play' | 'parent-assisted' | 'independent' | 'structured' | 'energetic';

export interface ClassSession {
  day: DayName;
  startTime: string;
  endTime: string;
  ageRange?: string;
}

export interface ClassSelectorOption {
  key: string;
  displayName: string;
  levelId: number;
  availableDays: DayName[];
  sessions: ClassSession[];
}

export interface Recommendation {
  key: string;
  name: string;
  stream: 'PlayGym' | 'EduGym' | 'UrbanGym';
  streamLabel: string;
  requiresContact?: boolean;
  levelId: number | null;
  availableDays: DayName[];
  sessions: ClassSession[];
  programPage: string;
  fallbackMode: 'portal' | 'contact-page';
  summary: string;
  url: string | null;
}

function getAvailableDays(sessions: ClassSession[]): DayName[] {
  return Array.from(new Set(sessions.map((classSession) => classSession.day)));
}

function makeClassSelectorOption(
  option: Omit<ClassSelectorOption, 'availableDays'>,
): ClassSelectorOption {
  return {
    ...option,
    availableDays: getAvailableDays(option.sessions),
  };
}

export function formatClassSessionTime(classSession: ClassSession): string {
  return `${classSession.startTime} - ${classSession.endTime}`;
}

export const CLASS_SELECTOR_SESSIONS = {
  ...timetable as Record<keyof typeof timetable, ClassSession[]>,
  // One timetable drives the PlayGym page and the class finder.
  playgym: playgym.schedule.days.map(({ day, time }) => {
    const [startTime, endTime] = time.split(/\s*[–—-]\s*/);
    return { day: day.toLowerCase() as DayName, startTime, endTime };
  }),
} satisfies Record<string, ClassSession[]>;

export const CLASS_SELECTOR_OPTIONS: ClassSelectorOption[] = [
  makeClassSelectorOption({
    key: 'edu_adv',
    displayName: levelName('edu_adv'),
    levelId: 9,
    sessions: CLASS_SELECTOR_SESSIONS.edu_adv,
  }),
  makeClassSelectorOption({
    key: 'edu_found',
    displayName: levelName('edu_found'),
    levelId: 39,
    sessions: CLASS_SELECTOR_SESSIONS.edu_found,
  }),
  makeClassSelectorOption({
    key: 'edu_1',
    displayName: levelName('edu_1'),
    levelId: 10,
    sessions: CLASS_SELECTOR_SESSIONS.edu_1,
  }),
  makeClassSelectorOption({
    key: 'edu_2',
    displayName: levelName('edu_2'),
    levelId: 11,
    sessions: CLASS_SELECTOR_SESSIONS.edu_2,
  }),
  makeClassSelectorOption({
    key: 'edu_3',
    displayName: levelName('edu_3'),
    levelId: 12,
    sessions: CLASS_SELECTOR_SESSIONS.edu_3,
  }),
  makeClassSelectorOption({
    key: 'edu_4',
    displayName: levelName('edu_4'),
    levelId: 13,
    sessions: CLASS_SELECTOR_SESSIONS.edu_4,
  }),
  makeClassSelectorOption({
    key: 'edu_5',
    displayName: levelName('edu_5'),
    levelId: 36,
    sessions: CLASS_SELECTOR_SESSIONS.edu_5,
  }),
  makeClassSelectorOption({
    key: 'urban_beg',
    displayName: levelName('urban_beg'),
    levelId: 19,
    sessions: CLASS_SELECTOR_SESSIONS.urban_beg,
  }),
  makeClassSelectorOption({
    key: 'urban_int',
    displayName: levelName('urban_int'),
    levelId: 20,
    sessions: CLASS_SELECTOR_SESSIONS.urban_int,
  }),
  makeClassSelectorOption({
    key: 'urban_adv',
    displayName: levelName('urban_adv'),
    levelId: 21,
    sessions: CLASS_SELECTOR_SESSIONS.urban_adv,
  }),
];

export const CLASS_SELECTOR_OPTIONS_BY_KEY: Record<string, ClassSelectorOption> =
  Object.fromEntries(
    CLASS_SELECTOR_OPTIONS.map((option) => [option.key, option]),
  );

export function normalizeDayName(dayName: string): DayName | null {
  const normalizedDayName = dayName.trim().toLowerCase();
  if (!(normalizedDayName in DAY_CODE_BY_NAME)) {
    return null;
  }

  return normalizedDayName as DayName;
}

export function formatDayName(dayName: string): string {
  const normalizedDayName = normalizeDayName(dayName);
  if (!normalizedDayName) {
    return dayName;
  }

  return normalizedDayName.charAt(0).toUpperCase() + normalizedDayName.slice(1);
}

export function getClassSelectorOption(classKey: string): ClassSelectorOption | null {
  return CLASS_SELECTOR_OPTIONS_BY_KEY[classKey] ?? null;
}

export function getClassSessions(classKey: string, dayName?: string): ClassSession[] {
  const classOption = getClassSelectorOption(classKey);
  if (!classOption) {
    return [];
  }

  if (!dayName) {
    return classOption.sessions;
  }

  const normalizedDayName = normalizeDayName(dayName);
  if (!normalizedDayName) {
    return [];
  }

  return classOption.sessions.filter((classSession) => classSession.day === normalizedDayName);
}

export function isClassDayAvailable(classKey: string, dayName: string): boolean {
  const classOption = getClassSelectorOption(classKey);
  const normalizedDayName = normalizeDayName(dayName);

  if (!classOption || !normalizedDayName) {
    return false;
  }

  return classOption.availableDays.includes(normalizedDayName);
}

export function buildIClassProUrl(levelId: number, dayName: string): string | null {
  const normalizedDayName = normalizeDayName(dayName);
  if (!normalizedDayName) {
    return null;
  }

  const dayCode = DAY_CODE_BY_NAME[normalizedDayName];
  return `${ICLASSPRO_CLASSES_URL}?levels=${levelId}&days=${dayCode}`;
}

export function buildClassSelectorUrl(classKey: string, dayName: string): string | null {
  const classOption = getClassSelectorOption(classKey);
  if (!classOption || !isClassDayAvailable(classKey, dayName)) {
    return null;
  }

  return buildIClassProUrl(classOption.levelId, dayName);
}

// ─── Recommendation engine ────────────────────────────────────────────────────

type ClassBase = Omit<Recommendation, 'url'>;

/** Parses an iClassPro age string — "5Y, 10M - 7Y, 0M" or "6Y - 8Y" — into years. */
function parseAgeBand(ageRange: string): { max: number; min: number } | null {
  const sides = ageRange.split('-').map((side) => side.trim());
  if (sides.length !== 2) {
    return null;
  }

  const toYears = (side: string): number | null => {
    const parsed = side.match(/^(\d+)Y(?:,\s*(\d+)M)?$/);
    return parsed ? Number(parsed[1]) + Number(parsed[2] ?? 0) / 12 : null;
  };

  const min = toYears(sides[0]);
  const max = toYears(sides[1]);
  return min === null || max === null ? null : { max, min };
}

/**
 * Drops any session that cannot admit every child the bucket covers.
 *
 * The wizard knows the age bucket a parent picked, not the child's exact age, so a
 * day is only safe to offer if its class accepts the whole span. Sibling classes do
 * not always share a band — UrbanGym Beginner runs 5y–6y9m on Monday but 5y–8y11m
 * on Wednesday — and offering the narrow one would tell a 6y10m family "this is your
 * class, Monday", then show them nothing in the portal. Hiding a day costs a little
 * choice; the alternative breaks the tool's whole promise.
 *
 * This is data-driven: widen a band in iClassPro, update the sessions above, and the
 * day returns on its own.
 */
function restrictToAgeSpan(base: ClassBase, ageSpan?: { max: number; min: number }): ClassBase {
  if (!ageSpan) {
    return base;
  }

  const sessions = base.sessions.filter((classSession) => {
    if (!classSession.ageRange) {
      return true;
    }

    const band = parseAgeBand(classSession.ageRange);
    return band ? ageSpan.min >= band.min && ageSpan.max <= band.max : true;
  });

  return { ...base, availableDays: getAvailableDays(sessions), sessions };
}

function addUrl(base: ClassBase, selectedDay?: DayName): Recommendation {
  let url: string | null = null;
  if (base.levelId !== null) {
    if (selectedDay) {
      url = buildIClassProUrl(base.levelId, selectedDay) ?? `${ICLASSPRO_CLASSES_URL}?levels=${base.levelId}`;
    } else {
      url = `${ICLASSPRO_CLASSES_URL}?levels=${base.levelId}`;
    }
  }
  return { ...base, url };
}

const PLAYGYM: ClassBase = {
  key: 'playgym',
  name: programNames.playgym,
  stream: 'PlayGym',
  streamLabel: programNames.playgym,
  levelId: null,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.playgym),
  sessions: CLASS_SELECTOR_SESSIONS.playgym,
  programPage: '/playgym',
  fallbackMode: 'contact-page',
  summary: `${playgym.tagline} Ages ${playgym.age_range}. ${playgymSupervision}.`,
};

const EDUGYM_ADV: ClassBase = {
  key: 'edu_adv',
  name: levelName('edu_adv'),
  stream: 'EduGym',
  streamLabel: programNames.edugym,
  levelId: 9,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.edu_adv),
  sessions: CLASS_SELECTOR_SESSIONS.edu_adv,
  programPage: '/preschool',
  fallbackMode: 'portal',
  summary: levelDescription('edu_adv'),
};

const EDUGYM_FOUND: ClassBase = {
  key: 'edu_found',
  name: levelName('edu_found'),
  stream: 'EduGym',
  streamLabel: programNames.edugym,
  levelId: 39,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.edu_found),
  sessions: CLASS_SELECTOR_SESSIONS.edu_found,
  programPage: '/edugym',
  fallbackMode: 'portal',
  summary: levelDescription('edu_found'),
};

const EDUGYM_1: ClassBase = {
  key: 'edu_1',
  name: levelName('edu_1'),
  stream: 'EduGym',
  streamLabel: programNames.edugym,
  levelId: 10,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.edu_1),
  sessions: CLASS_SELECTOR_SESSIONS.edu_1,
  programPage: '/edugym',
  fallbackMode: 'portal',
  summary: levelDescription('edu_1'),
};

const EDUGYM_2: ClassBase = {
  key: 'edu_2',
  name: levelName('edu_2'),
  stream: 'EduGym',
  streamLabel: programNames.edugym,
  levelId: 11,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.edu_2),
  sessions: CLASS_SELECTOR_SESSIONS.edu_2,
  programPage: '/edugym',
  fallbackMode: 'portal',
  summary: levelDescription('edu_2'),
};

const EDUGYM_3: ClassBase = {
  key: 'edu_3',
  name: levelName('edu_3'),
  stream: 'EduGym',
  streamLabel: programNames.edugym,
  levelId: 12,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.edu_3),
  sessions: CLASS_SELECTOR_SESSIONS.edu_3,
  programPage: '/edugym',
  fallbackMode: 'portal',
  summary: levelDescription('edu_3'),
};

const EDUGYM_4: ClassBase = {
  key: 'edu_4',
  name: levelName('edu_4'),
  stream: 'EduGym',
  streamLabel: programNames.edugym,
  levelId: 13,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.edu_4),
  sessions: CLASS_SELECTOR_SESSIONS.edu_4,
  programPage: '/edugym',
  fallbackMode: 'portal',
  summary: levelDescription('edu_4'),
};

const EDUGYM_5: ClassBase = {
  key: 'edu_5',
  name: levelName('edu_5'),
  stream: 'EduGym',
  streamLabel: programNames.edugym,
  levelId: 36,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.edu_5),
  sessions: CLASS_SELECTOR_SESSIONS.edu_5,
  programPage: '/edugym',
  fallbackMode: 'portal',
  summary: levelDescription('edu_5'),
};

const URBAN_BEG: ClassBase = {
  key: 'urban_beg',
  name: levelName('urban_beg'),
  stream: 'UrbanGym',
  streamLabel: programNames.urbangym,
  levelId: 19,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.urban_beg),
  sessions: CLASS_SELECTOR_SESSIONS.urban_beg,
  programPage: '/urbangym',
  fallbackMode: 'portal',
  summary: levelDescription('urban_beg'),
};

const URBAN_INT: ClassBase = {
  key: 'urban_int',
  name: levelName('urban_int'),
  stream: 'UrbanGym',
  streamLabel: programNames.urbangym,
  levelId: 20,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.urban_int),
  sessions: CLASS_SELECTOR_SESSIONS.urban_int,
  programPage: '/urbangym',
  fallbackMode: 'portal',
  summary: levelDescription('urban_int'),
};

const URBAN_ADV: ClassBase = {
  key: 'urban_adv',
  name: levelName('urban_adv'),
  stream: 'UrbanGym',
  streamLabel: programNames.urbangym,
  levelId: 21,
  availableDays: getAvailableDays(CLASS_SELECTOR_SESSIONS.urban_adv),
  sessions: CLASS_SELECTOR_SESSIONS.urban_adv,
  programPage: '/urbangym',
  fallbackMode: 'portal',
  summary: levelDescription('urban_adv'),
};

/**
 * Picks the class for a family, and the days they can actually book it.
 *
 * `ageSpan` is the full range of ages the chosen bucket covers. Pass it wherever it
 * is known: it filters out days whose class would reject part of that range, so the
 * wizard never recommends a class the portal then refuses to show.
 */
export function getClassRecommendation(
  ageYears: number,
  classType: ClassType,
  selectedDay?: DayName,
  ageSpan?: { max: number; min: number },
): Recommendation {
  const recommend = (base: ClassBase) => {
    const filtered = restrictToAgeSpan(base, ageSpan);
    const playgymFits = base.key !== 'playgym' || playgymAcceptsAgeSpan(ageSpan?.min ?? ageYears, ageSpan?.max ?? ageYears);
    if (!playgymFits || filtered.sessions.length === 0) {
      return { ...filtered, requiresContact: true, url: null, sessions: [], availableDays: [] };
    }
    return addUrl(filtered, selectedDay);
  };
  if (classType === 'free-play' || classType === 'parent-assisted') return recommend(PLAYGYM);

  // Adventurers takes children from 3y6m, so coached classes start at 3½ — below
  // that, PlayGym is the only option regardless of what the family asks for.
  if (ageYears < 3.5) {
    return recommend(PLAYGYM);
  }
  // Kinder — not at school yet.
  if (ageYears < 5.5) {
    return recommend(EDUGYM_ADV);
  }
  // Prep. Deliberately keyed off a Prep-specific bucket rather than age, because a
  // 5-year-old may be in kinder or in Prep (Victoria's cutoff is "turns 5 by 30
  // April") and those are different classes. This is the ONLY place the school year
  // is needed — every band below is age-based, which is what iClassPro enforces at
  // registration, so an age-driven recommendation is always one the family can
  // actually enrol in. Mapping the wider year level onto these narrower bands would
  // send half of each cohort to a class that rejects them.
  if (ageYears < 6) {
    return classType === 'energetic' ? recommend(URBAN_BEG) : recommend(EDUGYM_FOUND);
  }
  // Age 6 — Grade 1
  if (ageYears < 7) {
    return classType === 'energetic' ? recommend(URBAN_BEG) : recommend(EDUGYM_1);
  }
  // Age 7 — Grade 2
  if (ageYears < 8) {
    return classType === 'energetic' ? recommend(URBAN_INT) : recommend(EDUGYM_2);
  }
  // Age 8 — Grade 3
  if (ageYears < 9) {
    return classType === 'energetic' ? recommend(URBAN_ADV) : recommend(EDUGYM_3);
  }
  // Age 9 — Grade 4
  if (ageYears < 9.5) {
    return classType === 'energetic' ? recommend(URBAN_ADV) : recommend(EDUGYM_4);
  }
  // Age 10+ — Grade 5 and above
  return classType === 'energetic' ? recommend(URBAN_ADV) : recommend(EDUGYM_5);
}
