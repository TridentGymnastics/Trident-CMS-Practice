import assert from 'node:assert/strict';
import { test } from 'node:test';
import { holidaySessionTime, holidayDateLabel, holidayWeeks, hasHolidaySessions, isHolidayDate, validateHolidaySchedule } from '../src/lib/holiday-schedule.ts';

test('dates remain calendar dates across daylight-saving boundaries', () => {
  assert.equal(holidayDateLabel('2026-10-04'), 'Sun, 4 Oct 2026');
  assert.equal(isHolidayDate('2028-02-29'), true);
  for (const date of ['2026-02-29', '2026-09-31', '2026-13-01', '2026-9-2', '']) assert.equal(isHolidayDate(date), false, date);
});

test('one program can run on different dates and times each week', () => {
  const schedule = {
    week_1: [{ date: '2026-09-23', start_time:"14:30",end_time:"16:00" }],
    week_2: [{ date: '2026-10-02', start_time:"13:00",end_time:"14:30" }],
  };
  assert.deepEqual(validateHolidaySchedule(schedule), []);
  assert.equal(hasHolidaySessions(schedule), true);
  assert.equal(holidaySessionTime(holidayWeeks(schedule)[1].sessions[0]), '1:00pm - 2:30pm');
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
    {week_1: [{date:'2026-09-31',start_time:"13:00",end_time:"14:30"}]},
    {week_1: [{date:'2026-09-21',start_time:"16:00",end_time:"14:30"}]},
    {week_1: [{date:'2026-09-21',start_time:"25:00",end_time:"14:30"}]},
    {week_1: [{date:'2026-09-21',start_time:"14:00",end_time:"14:00"}]},
    {week_1: [{date:'2026-09-21',start_time:"13:00",end_time:"14:30"}, {date:'2026-09-21',start_time:"13:00",end_time:"14:30"}]},
    {week_1: [{date:'2026-09-28',start_time:"13:00",end_time:"14:30"}],week_2:[{date:'2026-09-21',start_time:"13:00",end_time:"14:30"}]},
  ]) assert.ok(validateHolidaySchedule(schedule).length, JSON.stringify(schedule));
});

test('dates and multiple sessions sort chronologically without changing staff data', () => {
  const late={date:'2026-09-23',start_time:"14:30",end_time:"16:00",activity:'Flips'};
  const early={date:'2026-09-23',start_time:"09:00",end_time:"10:30",activity:'Cartwheels'};
  const first={date:'2026-09-21',start_time:"13:00",end_time:"14:30"};
  const saved=[late,early,first];
  assert.deepEqual(holidayWeeks({week_1:saved})[0].sessions,[first,early,late]);
  assert.deepEqual(saved,[late,early,first]);
});
