import playgym from '../content/playgym.json' with { type: 'json' };
import preschool from '../content/program-preschool.json' with { type: 'json' };
import edugym from '../content/program-edugym.json' with { type: 'json' };
import urbangym from '../content/program-urbangym.json' with { type: 'json' };
import agc from '../content/program-agc.json' with { type: 'json' };

export { playgym };
export const programNames = {
  playgym: playgym.title, preschool: preschool.title,
  edugym: edugym.title, urbangym: urbangym.title, agc: agc.title,
};

type Level = { id: string; name: string; tag?: string; description: string; tagBg?: string; tagColor?: string };
const levelRecords: Record<string, { program: 'edugym' | 'urbangym' | 'agc'; level: Level }> = {
  edu_adv: { program: 'edugym', level: preschool.adventurers },
  ...Object.fromEntries(edugym.levels.map(level => [level.id, { program: 'edugym', level }])),
  ...Object.fromEntries(urbangym.levels.map(level => [level.id, { program: 'urbangym', level }])),
  ...Object.fromEntries(agc.levels.map(level => [level.id, { program: 'agc', level }])),
};
export function levelName(id: string): string {
  const record = levelRecords[id];
  if (!record) throw new Error(`Unknown class identity: ${id}`);
  return `${programNames[record.program]} ${record.level.name}`;
}
export function levelTag(id: string): string { return levelRecords[id]?.level.tag ?? ''; }
export function levelDescription(id: string): string { return levelRecords[id]?.level.description ?? ''; }

// The duplicated Foundation card shares its identity/name with EduGym. Its
// preschool-specific description is still independently editable.
const foundation = edugym.levels.find(level => level.id === 'edu_found')!;
export const programPages = {
  preschool: { ...preschool, levels: [
    { ...preschool.adventurers, name: levelName('edu_adv') },
    { ...foundation, ...preschool.foundation, name: levelName('edu_found') },
  ] },
  edugym,
  urbangym: { ...urbangym, levels: urbangym.levels.map(level => ({ ...level, name: levelName(level.id) })) },
  agc: { ...agc, levels: agc.levels.map(level => ({ ...level, name: levelName(level.id) })) },
};

export const playgymSupervision = playgym.adult_helper_required ? 'Parent-supervised play' : 'Independent play';
export const playgymSupervisionDetail = playgym.adult_helper_required
  ? 'Parent/guardian supervision required at all times' : 'No adult helper required';
export const playgymAgeBounds = (() => {
  const match = /^(\d+(?:\.\d+)?)[–-](\d+(?:\.\d+)?) years$/.exec(playgym.age_range);
  if (!match) throw new Error('Use a PlayGym age range such as 0–6 years.');
  return { min: Number(match[1]), max: Number(match[2]) };
})();
export function playgymAcceptsAgeSpan(min: number, max = min): boolean {
  return min >= playgymAgeBounds.min && max <= playgymAgeBounds.max;
}
