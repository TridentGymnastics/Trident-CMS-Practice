import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { holidayPrograms } from '../src/data/holidayPrograms';

type ProgramId = 'playgym' | 'opengym' | 'skill-workshops';

type CalendarDay = {
  week: 1 | 2;
  day: string;
  date: string;
};

type PosterSession = {
  programId: ProgramId;
  sessionTitle: string;
  time: string;
};

const outputDir = path.resolve('print-artifacts', 'winter-holiday-calendar-a3');
const htmlPath = path.join(outputDir, 'winter-holiday-calendar-a3.html');
const pdfPath = path.join(outputDir, 'winter-holiday-calendar-a3.pdf');
const pngPath = path.join(outputDir, 'winter-holiday-calendar-a3.png');

const calendarDays: CalendarDay[] = [
  { week: 1, day: 'Monday', date: '29 June' },
  { week: 1, day: 'Tuesday', date: '30 June' },
  { week: 1, day: 'Wednesday', date: '1 July' },
  { week: 1, day: 'Thursday', date: '2 July' },
  { week: 1, day: 'Friday', date: '3 July' },
  { week: 2, day: 'Monday', date: '6 July' },
  { week: 2, day: 'Tuesday', date: '7 July' },
  { week: 2, day: 'Wednesday', date: '8 July' },
  { week: 2, day: 'Thursday', date: '9 July' },
  { week: 2, day: 'Friday', date: '10 July' }
];

function cleanText(value = '') {
  return value
    .replace(/â€“|â€”|–|—/g, '-')
    .replace(/â€™|’/g, "'")
    .replace(/â€œ|â€�|“|”/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value = '') {
  return cleanText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function timeSort(time = '') {
  if (time.startsWith('11:00')) return 0;
  if (time.startsWith('1:00')) return 1;
  if (time.startsWith('2:30')) return 2;
  return 3;
}

function getSessionsForDay(day: CalendarDay): PosterSession[] {
  const fullDate = `${day.date} 2026`;

  return holidayPrograms
    .flatMap((program) =>
      (program.fullView.schedule?.weeks ?? []).flatMap((week) =>
        week.sessions
          .filter((session) => session.date === fullDate)
          .map((session) => ({
            programId: program.id,
            sessionTitle: session.title ?? program.title,
            time: session.time ?? program.time ?? ''
          }))
      )
    )
    .sort((a, b) => timeSort(a.time) - timeSort(b.time));
}

function renderSession(session: PosterSession) {
  return `
    <div class="session session--${session.programId}">
      <span class="session__time">${escapeHtml(session.time)}</span>
      <span class="session__name">${escapeHtml(session.sessionTitle)}</span>
    </div>
  `;
}

function renderDay(day: CalendarDay) {
  const sessions = getSessionsForDay(day);

  return `
    <article class="day-card">
      <header class="day-card__header">
        <span class="day-card__day">${escapeHtml(day.day)}</span>
        <span class="day-card__date">${escapeHtml(day.date)}</span>
      </header>
      <div class="day-card__sessions">
        ${sessions.map(renderSession).join('')}
      </div>
    </article>
  `;
}

function renderWeek(week: 1 | 2) {
  const label = week === 1 ? 'Week 1: 29 June - 3 July' : 'Week 2: 6 - 10 July';
  const days = calendarDays.filter((day) => day.week === week);

  return `
    <section class="week">
      <h2>${label}</h2>
      <div class="week__grid">
        ${days.map(renderDay).join('')}
      </div>
    </section>
  `;
}

function buildHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Winter Holiday Calendar A3</title>
  <style>
    @font-face {
      font-family: 'Montserrat';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('../../public/fonts/montserrat/montserrat-v31-latin-regular.woff2') format('woff2');
    }

    @font-face {
      font-family: 'Montserrat';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: url('../../public/fonts/montserrat/montserrat-v31-latin-600.woff2') format('woff2');
    }

    @font-face {
      font-family: 'Montserrat';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('../../public/fonts/montserrat/montserrat-v31-latin-700.woff2') format('woff2');
    }

    @page {
      size: A3 landscape;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
      font-family: 'Montserrat', Arial, sans-serif;
      background: #dff4ff;
      color: #151957;
    }

    body {
      display: grid;
      place-items: center;
      padding: 18px;
    }

    .poster {
      width: 420mm;
      height: 297mm;
      overflow: hidden;
      padding: 7mm;
      background:
        radial-gradient(circle at 4% 4%, rgba(0, 156, 166, 0.16), transparent 22%),
        radial-gradient(circle at 96% 96%, rgba(79, 147, 215, 0.18), transparent 24%),
        linear-gradient(180deg, #eef9ff 0%, #ffffff 46%, #f4fbff 100%);
      box-shadow: 0 18px 70px rgba(8, 18, 58, 0.24);
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    .calendar {
      display: grid;
      grid-template-rows: repeat(2, minmax(0, 1fr));
      gap: 5mm;
      width: 100%;
      height: 100%;
    }

    .week {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: 4mm;
      min-height: 0;
      padding: 5mm;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.84);
      border: 1.2mm solid rgba(147, 210, 255, 0.62);
      box-shadow: 0 10px 28px rgba(21, 115, 194, 0.09);
    }

    .week h2 {
      margin: 0;
      font-size: 24pt;
      line-height: 1;
      font-weight: 800;
      color: #151957;
    }

    .week__grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 4mm;
      min-height: 0;
    }

    .day-card {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: 4mm;
      min-height: 0;
      padding: 4mm;
      border-radius: 7px;
      background: #ffffff;
      border: 0.7mm solid rgba(21, 25, 87, 0.14);
    }

    .day-card__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 3mm;
      padding-bottom: 3mm;
      border-bottom: 0.6mm solid rgba(21, 25, 87, 0.13);
    }

    .day-card__day {
      font-size: 21pt;
      line-height: 1;
      font-weight: 800;
      color: #151957;
    }

    .day-card__date {
      font-size: 15pt;
      line-height: 1;
      font-weight: 800;
      color: #4f93d7;
      white-space: nowrap;
    }

    .day-card__sessions {
      display: flex;
      flex-direction: column;
      gap: 3mm;
      min-height: 0;
    }

    .session {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1.4mm;
      min-height: 24mm;
      padding: 3.2mm 3.6mm;
      border-radius: 5px;
      color: white;
      box-shadow: 0 4px 12px rgba(8, 18, 58, 0.13);
    }

    .session--playgym {
      background: linear-gradient(180deg, #18b9b5, #008f9a);
    }

    .session--skill-workshops {
      background: linear-gradient(180deg, #26306f, #151957);
    }

    .session--opengym {
      background: linear-gradient(180deg, #69afe8, #3d80cc);
    }

    .session__time {
      font-size: 12.5pt;
      line-height: 1;
      font-weight: 800;
    }

    .session__name {
      font-size: 17pt;
      line-height: 1.06;
      font-weight: 800;
    }

    @media print {
      body {
        display: block;
        padding: 0;
        background: white;
      }

      .poster {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <main class="poster">
    <section class="calendar" aria-label="Winter holiday timetable">
      ${renderWeek(1)}
      ${renderWeek(2)}
    </section>
  </main>
</body>
</html>`;
}

async function exportPrintFiles() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
    const page = await browser.newPage();
    await page.setViewport({ width: 1588, height: 1123, deviceScaleFactor: 2 });
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts?.ready);
    await page.emulateMediaType('print');

    await page.pdf({
      path: pdfPath,
      format: 'A3',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true
    });

    await page.screenshot({
      path: pngPath,
      fullPage: true,
      omitBackground: false
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(htmlPath, buildHtml(), 'utf8');

  try {
    await exportPrintFiles();
    console.log(`Created ${path.relative(process.cwd(), htmlPath)}`);
    console.log(`Created ${path.relative(process.cwd(), pdfPath)}`);
    console.log(`Created ${path.relative(process.cwd(), pngPath)}`);
  } catch (error) {
    console.warn('Created the poster HTML, but PDF/PNG export failed.');
    console.warn(error instanceof Error ? error.message : error);
    console.log(`Created ${path.relative(process.cwd(), htmlPath)}`);
  }
}

main();
