import assert from 'node:assert/strict';
import { test } from 'node:test';
import { holidayDateLabel, holidayWeeks, hasHolidaySessions, isHolidayDate, validateHolidaySchedule } from '../src/lib/holiday-schedule.ts';

test('dates remain calendar dates across daylight-saving boundaries', () => {
  assert.equal(holidayDateLabel('2026-10-04'), 'Sun, 4 Oct 2026');
  assert.equal(isHolidayDate('2028-02-29'), true);
  for (const date of ['2026-02-29', '2026-09-31', '2026-13-01', '2026-9-2', '']) assert.equal(isHolidayDate(date), false, date);
});

test('one program can run on different dates and times each week', () => {
  const schedule = {
    week_1: [{ date: '2026-09-23', time: '2:30pm - 4:00pm' }],
    week_2: [{ date: '2026-10-02', time: '1:00 pm - 2:30 pm' }],
  };
  assert.deepEqual(validateHolidaySchedule(schedule), []);
  assert.equal(hasHolidaySessions(schedule), true);
  assert.equal(holidayWeeks(schedule)[1].sessions[0].time, '1:00 pm - 2:30 pm');
});

test('empty and omitted lists are safe after CMS saves', () => {
  for (const schedule of [undefined, {}, {week_1: [], week_2: []}]) {
    assert.deepEqual(validateHolidaySchedule(schedule), []);
    assert.equal(hasHolidaySessions(schedule), false);
    assert.deepEqual(holidayWeeks(schedule).map(w => w.sessions), [[], []]);
  }
});

test('invalid dates, reversed times, duplicates and reversed weeks are rejected', () => {
  for (const schedule of [
    {week_1: [{date:'2026-09-31',time:'1:00pm - 2:30pm'}]},
    {week_1: [{date:'2026-09-21',time:'4:00pm - 2:30pm'}]},
    {week_1: [{date:'2026-09-21',time:'13:00pm - 2:30pm'}]},
    {week_1: [{date:'2026-09-21',time:'2:00pm - 2:00pm'}]},
    {week_1: [{date:'2026-09-21',time:'1:00pm - 2:30pm'}, {date:'2026-09-21',time:'1:00 pm - 2:30 pm'}]},
    {week_1: [{date:'2026-09-28',time:'1:00pm - 2:30pm'}],week_2:[{date:'2026-09-21',time:'1:00pm - 2:30pm'}]},
  ]) assert.ok(validateHolidaySchedule(schedule).length, JSON.stringify(schedule));
});

test('dates and multiple sessions sort chronologically without changing staff data', () => {
  const late={date:'2026-09-23',time:'2:30pm - 4:00pm',activity:'Flips'};
  const early={date:'2026-09-23',time:'9:00am - 10:30am',activity:'Cartwheels'};
  const first={date:'2026-09-21',time:'1:00pm - 2:30pm'};
  const saved=[late,early,first];
  assert.deepEqual(holidayWeeks({week_1:saved})[0].sessions,[first,early,late]);
  assert.deepEqual(saved,[late,early,first]);
});
