import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { holidayPrograms, type ProgramBlock } from '../src/data/holidayPrograms';

type ProgramId = 'playgym' | 'opengym' | 'skill-workshops';
type Accent = 'teal' | 'blue' | 'navy';

type Poster = {
  id: string;
  title: string;
  age: string;
  accent: Accent;
  intro: string;
  why: string;
  booking: string;
  priceLines: string[];
  timeLines: string[];
  footer: string;
  art?: 'handstands' | 'flips' | 'parkour';
};

type Session = {
  day: string;
  date: string;
  title?: string;
  time?: string;
};

const outputDir = path.resolve('print-artifacts', 'winter-holiday-a4-posters');
const htmlPath = path.join(outputDir, 'winter-holiday-a4-posters.html');
const pdfPath = path.join(outputDir, 'winter-holiday-a4-posters.pdf');
const bookingPath = 'tridentgymnastics.com.au/school-holidays';

const pngNames = {
  opengym: '01-opengym-a4.png',
  playgym: '02-playgym-a4.png',
  'skill-sessions': '03-skill-sessions-a4.png',
  'handstands-cartwheels': '04-handstands-cartwheels-a4.png',
  'flips-tricks': '05-flips-tricks-a4.png',
  parkour: '06-parkour-a4.png'
} as const;

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

function getProgram(id: ProgramId) {
  const program = holidayPrograms.find((item) => item.id === id);
  if (!program) throw new Error(`Missing holiday program: ${id}`);
  return program;
}

function allSessions(program: ProgramBlock) {
  return (program.fullView.schedule?.weeks ?? []).flatMap((week) => week.sessions);
}

function byTitle(title: string) {
  return allSessions(getProgram('skill-workshops')).filter((session) => cleanText(session.title ?? '') === title);
}

function shortDate(date: string) {
  return cleanText(date).replace(' 2026', '');
}

function dateList(sessions: Session[]) {
  return sessions.map((session) => `${cleanText(session.day)} ${shortDate(session.date)}`);
}

function price(program: ProgramBlock, index = 0) {
  return cleanText(program.fullView.pricing?.items[index]?.price ?? '');
}

function buildPosters(): Poster[] {
  const playgym = getProgram('playgym');
  const opengym = getProgram('opengym');
  const skills = getProgram('skill-workshops');
  const opengymSessions = allSessions(opengym);
  const handstands = byTitle('Handstands & Cartwheels');
  const flips = byTitle('Flips & Tricks');
  const parkour = byTitle('Parkour');

  return [
    {
      id: 'opengym',
      title: 'OpenGym',
      age: cleanText(opengym.ages),
      accent: 'blue',
      intro: 'A supervised free-play session for children to explore equipment, practise skills, and have fun at their own pace. Open to all skill levels.',
      why: 'Great for building confidence, staying active, and enjoying extra gym time in a safe supervised space.',
      booking: cleanText(opengym.bookingType),
      priceLines: [`${price(opengym)} per session`],
      timeLines: opengymSessions.map((session) => `${cleanText(session.day)} ${shortDate(session.date)} - ${cleanText(session.time ?? '')}`),
      footer: `Book Now: ${bookingPath}`
    },
    {
      id: 'playgym',
      title: 'PlayGym',
      age: cleanText(playgym.ages),
      accent: 'teal',
      intro: 'A fun, parent-supervised play session where children can explore the gymnastics facility at their own pace.',
      why: 'Supports movement, confidence, imagination, and school readiness through play.',
      booking: 'No booking required - just drop in',
      priceLines: (playgym.fullView.pricing?.items ?? []).map((item) => `${cleanText(item.label)} - ${cleanText(item.price)}`),
      timeLines: ['Monday to Friday', cleanText(playgym.time ?? ''), '29 June - 10 July'],
      footer: `More info: ${bookingPath}`
    },
    {
      id: 'skill-sessions',
      title: 'Skill Sessions',
      age: cleanText(skills.ages),
      accent: 'navy',
      intro: 'Focused coaching sessions designed to help children build, practise, and improve specific gymnastics skills.',
      why: 'Great for building confidence, technique, strength, and body control in a fun and supportive environment.',
      booking: cleanText(skills.bookingType),
      priceLines: [`${price(skills)} per session`],
      timeLines: [
        `Handstands & Cartwheels - ${handstands.map((session) => shortDate(session.date)).join(', ')}`,
        `Flips & Tricks - ${flips.map((session) => shortDate(session.date)).join(', ')}`,
        `Parkour - ${parkour.map((session) => shortDate(session.date)).join(', ')}`,
        cleanText(skills.time ?? '')
      ],
      footer: `Book Now: ${bookingPath}`
    },
    {
      id: 'handstands-cartwheels',
      title: 'Handstands & Cartwheels',
      age: cleanText(skills.ages),
      accent: 'navy',
      intro: 'A focused coaching session designed to build strong fundamentals in handstands and cartwheels.',
      why: 'A great way to build confidence, body control, strength, and technique.',
      booking: cleanText(skills.bookingType),
      priceLines: [`${price(skills)} per session`],
      timeLines: [...dateList(handstands), cleanText(skills.time ?? '')],
      footer: `Book Now: ${bookingPath}`,
      art: 'handstands'
    },
    {
      id: 'flips-tricks',
      title: 'Flips & Tricks',
      age: cleanText(skills.ages),
      accent: 'blue',
      intro: 'A high-energy coaching session for children working toward walkovers, round-offs, aerials, and flips.',
      why: 'Perfect for children who want to challenge themselves and work on exciting gymnastics skills safely.',
      booking: cleanText(skills.bookingType),
      priceLines: [`${price(skills)} per session`],
      timeLines: [...dateList(flips), cleanText(skills.time ?? '')],
      footer: `Book Now: ${bookingPath}`,
      art: 'flips'
    },
    {
      id: 'parkour',
      title: 'Parkour',
      age: cleanText(skills.ages),
      accent: 'teal',
      intro: 'A dynamic workshop focused on obstacle-based movement, jumping, vaulting, climbing, balance, and safe landings.',
      why: 'Builds agility, confidence, coordination, and problem-solving in an active and adventurous setting.',
      booking: cleanText(skills.bookingType),
      priceLines: [`${price(skills)} per session`],
      timeLines: [...dateList(parkour), cleanText(skills.time ?? '')],
      footer: `Book Now: ${bookingPath}`,
      art: 'parkour'
    }
  ];
}

function snowflake(x: number, y: number, size: number, color: string, rotate = 0) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate}) scale(${size})" stroke="${color}" stroke-width="5" stroke-linecap="round" opacity="0.9">
      <line x1="-22" y1="0" x2="22" y2="0" />
      <line x1="0" y1="-22" x2="0" y2="22" />
      <line x1="-16" y1="-16" x2="16" y2="16" />
      <line x1="-16" y1="16" x2="16" y2="-16" />
      <circle cx="0" cy="0" r="4" fill="${color}" stroke="none" />
    </g>
  `;
}

function winterTop() {
  return `
    <svg class="winter-top" viewBox="0 0 800 190" aria-hidden="true" preserveAspectRatio="none">
      <path d="M0 0H800V76C704 52 642 92 556 67C469 42 418 14 318 58C222 100 153 75 72 93C40 100 17 109 0 120V0Z" fill="#d9f2ff" opacity="0.95" />
      <path d="M0 0H800V42C685 71 620 28 522 50C429 70 363 78 276 39C185 0 103 56 0 33V0Z" fill="#ebf9ff" />
      ${snowflake(64, 72, 1.55, '#009ca6', 12)}
      ${snowflake(160, 42, 0.9, '#86c8ef', -18)}
      ${snowflake(642, 56, 1.25, '#151957', 9)}
      ${snowflake(725, 92, 0.86, '#009ca6', -12)}
      <circle cx="250" cy="34" r="7" fill="#ffffff" />
      <circle cx="604" cy="116" r="5" fill="#ffffff" />
      <circle cx="492" cy="36" r="4" fill="#009ca6" opacity="0.7" />
    </svg>
  `;
}

function art(type: Poster['art']) {
  if (!type) return '';

  const common = 'fill="none" stroke="#8f98aa" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"';
  const fill = '#a5adba';

  if (type === 'handstands') {
    return `
      <svg class="poster-art poster-art--handstands" viewBox="0 0 360 150" aria-hidden="true">
        <circle cx="92" cy="35" r="13" fill="${fill}" />
        <path ${common} d="M92 50v48M92 72l-42-22M92 72l42-22M92 98l-31 31M92 98l31 31" />
        <circle cx="242" cy="118" r="13" fill="${fill}" />
        <path ${common} d="M232 106l-55-46M232 106l-20-65M232 106l55-38M232 106l62 24" />
      </svg>
    `;
  }

  if (type === 'flips') {
    return `
      <svg class="poster-art poster-art--flips" viewBox="0 0 360 150" aria-hidden="true">
        <path d="M55 83C92 22 174 15 220 60" ${common} stroke-width="7" opacity="0.7" />
        <circle cx="112" cy="74" r="12" fill="${fill}" />
        <path ${common} d="M124 82l40 21M142 55l34-25M140 91l-11 35M157 100l32 26" />
        <circle cx="255" cy="82" r="12" fill="${fill}" />
        <path ${common} d="M246 75l-38-22M236 95l-30 31M266 94l36 25M266 72l28-30" />
      </svg>
    `;
  }

  return `
    <svg class="poster-art poster-art--parkour" viewBox="0 0 360 150" aria-hidden="true">
      <rect x="36" y="105" width="58" height="25" rx="3" fill="${fill}" opacity="0.75" />
      <rect x="246" y="100" width="72" height="30" rx="3" fill="${fill}" opacity="0.75" />
      <circle cx="164" cy="36" r="12" fill="${fill}" />
      <path ${common} d="M157 50l-44 42M159 62l50 20M134 72l-34-19M178 70l-6 52M198 83l41 35" />
    </svg>
  `;
}

function renderLines(lines: string[]) {
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
}

function renderPoster(poster: Poster) {
  const hasArt = poster.art ? ' poster--with-art' : '';

  return `
    <section class="poster poster--${poster.accent}${hasArt}" data-poster-id="${poster.id}">
      ${winterTop()}
      <div class="poster-body">
        <p class="season">Winter Holiday Program</p>
        <h1>${escapeHtml(poster.title)}</h1>
        <p class="age">${escapeHtml(poster.age)}</p>
        <p class="intro">${escapeHtml(poster.intro)}</p>

        <h2>Why families love it</h2>
        <p class="why">${escapeHtml(poster.why)}</p>

        <p class="booking">${escapeHtml(poster.booking)}</p>

        <div class="details">
          <section>
            <h3>Pricing</h3>
            ${renderLines(poster.priceLines)}
          </section>
          <section>
            <h3>Times</h3>
            ${renderLines(poster.timeLines)}
          </section>
        </div>

        ${art(poster.art)}

        <p class="book-line">${escapeHtml(poster.footer)}</p>
      </div>
    </section>
  `;
}

function buildHtml(posters: Poster[]) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Winter Holiday A4 Posters</title>
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
      size: A4 portrait;
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
      background: #2b2b2b;
      color: #151957;
    }

    body {
      display: grid;
      justify-content: center;
      gap: 24px;
      padding: 24px;
    }

    .poster {
      --accent: #009ca6;
      --accent-soft: #dff8fb;
      position: relative;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      background: #ffffff;
      page-break-after: always;
      box-shadow: 0 18px 70px rgba(0, 0, 0, 0.28);
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    .poster--blue {
      --accent: #4f93d7;
      --accent-soft: #e5f4ff;
    }

    .poster--navy {
      --accent: #151957;
      --accent-soft: #eef0ff;
    }

    .poster:last-child {
      page-break-after: auto;
    }

    .winter-top {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 50mm;
      display: block;
    }

    .poster-body {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      padding: 24mm 18mm 12mm;
      text-align: center;
    }

    .season {
      margin: 3mm 0 2mm;
      font-size: 11pt;
      line-height: 1;
      font-weight: 800;
      color: var(--accent);
      text-transform: uppercase;
    }

    h1 {
      max-width: 168mm;
      margin: 0;
      font-size: clamp(34pt, 12vw, 48pt);
      line-height: 0.96;
      font-weight: 800;
      color: var(--accent);
      letter-spacing: 0;
    }

    .poster--navy h1 {
      color: #151957;
    }

    .age {
      margin: 4mm 0 0;
      font-size: 14pt;
      line-height: 1;
      font-weight: 800;
      color: var(--accent);
    }

    .intro,
    .why {
      max-width: 145mm;
      margin: 8mm 0 0;
      font-size: 12.2pt;
      line-height: 1.42;
      font-weight: 600;
      color: #4e5876;
    }

    h2 {
      margin: 9mm 0 0;
      font-size: 13pt;
      line-height: 1;
      font-weight: 800;
      color: #151957;
    }

    .why {
      margin-top: 3mm;
    }

    .booking {
      margin: 8mm 0 0;
      font-size: 12.2pt;
      line-height: 1.25;
      font-weight: 800;
      color: #151957;
    }

    .details {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10mm;
      width: 100%;
      margin-top: auto;
      padding-inline: 8mm;
      text-align: center;
    }

    .details section {
      min-height: 44mm;
      padding: 0;
    }

    .details h3 {
      margin: 0 0 3mm;
      font-size: 12pt;
      line-height: 1;
      font-weight: 800;
      color: #151957;
    }

    .details p {
      margin: 0 0 2mm;
      font-size: 10pt;
      line-height: 1.22;
      font-weight: 700;
      color: #5b6480;
    }

    .poster--with-art .details {
      margin-top: 16mm;
    }

    .poster-art {
      width: 92mm;
      max-height: 34mm;
      margin-top: 3mm;
    }

    .book-line {
      width: 100%;
      margin: 6mm 0 0;
      padding-top: 4mm;
      border-top: 0.4mm solid #d7deea;
      font-size: 10.8pt;
      line-height: 1.2;
      font-weight: 800;
      color: var(--accent);
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
  ${posters.map(renderPoster).join('')}
</body>
</html>`;
}

async function exportPrintFiles(posters: Poster[]) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts?.ready);
    await page.emulateMediaType('print');

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true
    });

    await page.emulateMediaType('screen');

    for (const poster of posters) {
      const posterElement = await page.$(`[data-poster-id="${poster.id}"]`);
      if (!posterElement) throw new Error(`Could not find poster element: ${poster.id}`);
      await posterElement.screenshot({
        path: path.join(outputDir, pngNames[poster.id as keyof typeof pngNames])
      });
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const posters = buildPosters();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(htmlPath, buildHtml(posters), 'utf8');
  await exportPrintFiles(posters);

  console.log(`Created ${path.relative(process.cwd(), htmlPath)}`);
  console.log(`Created ${path.relative(process.cwd(), pdfPath)}`);
  for (const name of Object.values(pngNames)) {
    console.log(`Created ${path.relative(process.cwd(), path.join(outputDir, name))}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
