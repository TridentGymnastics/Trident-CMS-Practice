import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJSON = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const config = parse(readFileSync(resolve(root, '.pages.yml'), 'utf8'));
const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

function validate(fields, data, where) {
  for (const field of fields) {
    const value = data?.[field.name];
    const at = `${where}.${field.name}`;
    if (value === undefined || value === null || value === '') {
      if (field.required) fail(at, 'is required');
      continue;
    }
    if (field.list) {
      if (!Array.isArray(value)) { fail(at, 'must be a list'); continue; }
      if (value.length < (field.list.min ?? 0) || value.length > (field.list.max ?? Infinity)) fail(at, 'has an invalid number of items');
      value.forEach((item, index) => validate([{ ...field, list: false }], { [field.name]: item }, `${where}[${index + 1}]`));
      continue;
    }
    if (field.type === 'object') {
      if (typeof value !== 'object' || Array.isArray(value)) fail(at, 'must be an object');
      else validate(field.fields, value, at);
    } else if (field.type === 'boolean') {
      if (typeof value !== 'boolean') fail(at, 'must be on or off');
    } else if (field.type === 'number') {
      if (!Number.isInteger(value) || value < (field.options?.min ?? -Infinity) || value > (field.options?.max ?? Infinity)) fail(at, 'must be a whole number within the allowed range');
    } else {
      if (typeof value !== 'string') { fail(at, 'must be text'); continue; }
      if (field.required && !value.trim()) fail(at, 'must not be blank');
      if (field.pattern && !new RegExp(field.pattern.regex ?? field.pattern).test(value)) fail(at, field.pattern.message ?? 'has an invalid format');
      if (field.type === 'select' && !field.options.values.some(option => (option.name ?? option) === value)) fail(at, 'must be one of the listed choices');
      if (field.type === 'image' || field.type === 'file') {
        const library = config.media.find(item => item.name === field.options.media);
        const prefix = `${library.output}/`;
        const relative = value.slice(prefix.length);
        if (!value.startsWith(prefix) || relative.split('/').some(part => ['.', '..', ''].includes(part)) || /[\\?#]/.test(relative)) {
          fail(at, `must be selected from ${library.label}`);
        } else if (!library.extensions.includes(extname(value).slice(1).toLowerCase()) || !existsSync(resolve(root, library.input, relative))) {
          fail(at, `file not found or unsupported: ${value}`);
        }
      }
    }
  }
}

for (const entry of config.content) {
  try { validate(entry.fields, readJSON(entry.path), entry.path); }
  catch (error) { fail(entry.path, error.message); }
}

const minutes = time => {
  const match = /^(\d{1,2}):([0-5]\d)(am|pm)$/.exec(time);
  return match ? (Number(match[1]) % 12 + (match[3] === 'pm' ? 12 : 0)) * 60 + Number(match[2]) : NaN;
};
function checkSessions(sessions, where) {
  const seen = new Set();
  for (const session of sessions) {
    if (!(minutes(session.endTime) > minutes(session.startTime))) fail(where, 'each finish time must be after its start time');
    const key = `${session.day}/${session.startTime}/${session.endTime}`;
    if (seen.has(key)) fail(where, `duplicate session: ${key}`);
    seen.add(key);
    if (session.ageRange) {
      const bounds = session.ageRange.split(' - ').map(side => {
        const match = /^(\d+)Y(?:, (\d+)M)?$/.exec(side);
        return match ? Number(match[1]) * 12 + Number(match[2] ?? 0) : NaN;
      });
      if (bounds.length !== 2 || !(bounds[1] > bounds[0])) fail(where, 'age range must run from younger to older');
    }
  }
}

// Check relationships that field-by-field validation cannot express.
if (!errors.length) {
  const notice = readJSON('src/content/site-notice.json');
  if (!!notice.link_text !== !!notice.link_href) fail('Site-wide notice', 'supply both link text and link destination, or leave both blank');
  const news = readJSON('src/content/announcements.json').items;
  if (new Set(news.map(item => item.id)).size !== news.length) fail('News updates', 'reference names must be unique');
  for (const item of news) {
    const date = new Date(`${item.dateISO}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== item.dateISO) fail(`News ${item.id}`, 'use a real calendar date');
  }
  const playgym = readJSON('src/content/playgym.json');
  checkSessions(playgym.schedule.days.map(({ day, time }) => {
    const [startTime, endTime] = time.split(/\s*[–—-]\s*/);
    return { day, startTime, endTime };
  }), 'PlayGym timetable');
  for (const [name, sessions] of Object.entries(readJSON('src/content/class-timetable.json'))) checkSessions(sessions, `Class timetable ${name}`);
}

if (errors.length) {
  console.error('CMS content needs attention before the site can build:\n' + errors.map(error => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`CMS content validated: ${config.content.length} editors, media files, dates, links and timetables.`);
}
