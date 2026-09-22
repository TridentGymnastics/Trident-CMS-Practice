import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

import {
  buildClassSelectorUrl,
  formatClassSessionTime,
  getClassRecommendation,
  getClassSessions,
  getClassSelectorOption,
} from '../src/data/classSelectorOptions.ts';
import type { ClassType } from '../src/data/classSelectorOptions.ts';

// Every bucket the wizard offers, as the FULL span of ages a parent could bring to
// it — not a representative age. A parent picking "6" may have a child anywhere from
// 6y0m to 6y11m, and every one of them must be able to enrol in what we recommend.
// `ageYears` is the value the bucket passes to getClassRecommendation; minAge/maxAge
// are what the label actually promises. Mirrors AGE_BUCKETS in ClassSelector.astro,
// which lives in a client-side script block and so cannot be imported — keep in step.
type AgeBandCheck = {
  ageYears: number;
  bucket: string;
  classType: ClassType;
  maxAge: number;
  minAge: number;
};

const AGE_BAND_CHECKS: AgeBandCheck[] = [
  { bucket: 'Under 2', minAge: 0, maxAge: 1.99, ageYears: 1, classType: 'free-play' },
  { bucket: '2 - 3½', minAge: 2, maxAge: 3.49, ageYears: 3, classType: 'free-play' },
  { bucket: '3½ - 5', minAge: 3.5, maxAge: 5.49, ageYears: 4.5, classType: 'independent' },
  { bucket: '5 - 6 (Prep)', minAge: 5, maxAge: 6.99, ageYears: 5.8, classType: 'structured' },
  { bucket: '5 - 6 (Prep)', minAge: 5, maxAge: 6.99, ageYears: 5.8, classType: 'energetic' },
  { bucket: '6', minAge: 6, maxAge: 6.99, ageYears: 6.5, classType: 'structured' },
  { bucket: '6', minAge: 6, maxAge: 6.99, ageYears: 6.5, classType: 'energetic' },
  { bucket: '7', minAge: 7, maxAge: 7.99, ageYears: 7.5, classType: 'structured' },
  { bucket: '7', minAge: 7, maxAge: 7.99, ageYears: 7.5, classType: 'energetic' },
  { bucket: '8', minAge: 8, maxAge: 8.99, ageYears: 8.5, classType: 'structured' },
  { bucket: '8', minAge: 8, maxAge: 8.99, ageYears: 8.5, classType: 'energetic' },
  { bucket: '9', minAge: 9, maxAge: 9.99, ageYears: 9.2, classType: 'structured' },
  { bucket: '9', minAge: 9, maxAge: 9.99, ageYears: 9.2, classType: 'energetic' },
  // Level 5+ tops out at 14 in iClassPro; over-14s have no recreational class.
  { bucket: '10 +', minAge: 10, maxAge: 14, ageYears: 10, classType: 'structured' },
  { bucket: '10 +', minAge: 10, maxAge: 14, ageYears: 10, classType: 'energetic' },
];

/** Parses an iClassPro age string — "5Y, 10M - 7Y, 0M" or "6Y - 8Y" — into years. */
function parseAgeBand(ageRange: string): { max: number; min: number } | null {
  const sides = ageRange.split('-').map((side) => side.trim());
  if (sides.length !== 2) {
    return null;
  }

  const toYears = (side: string): number | null => {
    const match = side.match(/^(\d+)Y(?:,\s*(\d+)M)?$/);
    if (!match) {
      return null;
    }

    return Number(match[1]) + Number(match[2] ?? 0) / 12;
  };

  const min = toYears(sides[0]);
  const max = toYears(sides[1]);
  if (min === null || max === null) {
    return null;
  }

  return { max, min };
}

/**
 * Asserts that a family following the wizard can actually enrol in what it
 * recommends. iClassPro enforces age at registration, so recommending a class whose
 * age band excludes the child is a dead end: the wizard says "this is your class",
 * the portal then shows nothing. That failure state defeats the tool entirely.
 *
 * Checks the FULL age span each bucket promises against EVERY session of the
 * recommended class — not a representative age, and not "at least one day works".
 * A parent who picks a bucket and then a day must be able to enrol in that class on
 * that day, whatever their child's age within the bucket.
 */
function verifyAgeBands(): string[] {
  const failures: string[] = [];

  for (const check of AGE_BAND_CHECKS) {
    // Passes the span exactly as the wizard does, so this validates the days the
    // family is really offered — including any the span filter removed.
    const rec = getClassRecommendation(check.ageYears, check.classType, undefined, {
      max: check.maxAge,
      min: check.minAge,
    });

    // PlayGym is an unbooked drop-in with no age gate in the portal.
    if (rec.levelId === null) {
      continue;
    }

    const bands = rec.sessions.map((classSession) => ({
      band: classSession.ageRange ? parseAgeBand(classSession.ageRange) : null,
      day: classSession.day,
      raw: classSession.ageRange,
    }));

    const unparsable = bands.filter((entry) => entry.band === null);
    if (unparsable.length > 0) {
      failures.push(
        `[${check.bucket} | ${check.classType}] "${rec.name}" has ${unparsable.length} session(s) with no parsable age band ("${unparsable[0].raw ?? 'missing'}").`,
      );
      continue;
    }

    for (const entry of bands) {
      const band = entry.band!;
      if (check.minAge < band.min) {
        failures.push(
          `[${check.bucket} | ${check.classType}] recommends "${rec.name}", but its ${entry.day} session starts at ${band.min.toFixed(2)}y — a child aged ${check.minAge.toFixed(2)}y would be told this class and then not see it in the portal.`,
        );
      }

      if (check.maxAge > band.max) {
        failures.push(
          `[${check.bucket} | ${check.classType}] recommends "${rec.name}", but its ${entry.day} session ends at ${band.max.toFixed(2)}y — a child aged ${check.maxAge.toFixed(2)}y would be told this class and then not see it in the portal.`,
        );
      }
    }
  }

  return failures;
}

type ClassFlow = {
  classKey: string;
  path: string[];
};

type SpecialFlow = {
  expectedName: string;
  expectedPrimaryHref: string;
  expectedPrimaryText: string;
  path: string[];
};

type HarnessClassResult = {
  kind: 'class';
  classKey: string;
  path: string[];
  selectedDay: string;
  resultHeading: string;
  timeCardDay: string;
  timeCardTime: string;
  primaryTag: string | null;
  primaryText: string;
  primaryHref: string | null;
  primaryDisabled: boolean;
  learnMoreHref: string | null;
};

type HarnessSpecialResult = {
  kind: 'special';
  path: string[];
  resultHeading: string;
  primaryText: string;
  primaryHref: string | null;
};

type HarnessResult = HarnessClassResult | HarnessSpecialResult;

const DIST_DIR = resolve(process.cwd(), 'dist');

// Asserts the age -> class mapping the wizard offers. 'Under 2', '2 - 3½' and
// '3½ - 5' carry a defaultClassType and resolve in one click; '5 - 6' (Prep) upward
// pick a class style. Every class here must also admit the bucket's age under the
// iClassPro bands recorded in CLASS_SELECTOR_SESSIONS — see verifyAgeBands below.
const CLASS_FLOWS: ClassFlow[] = [
  { classKey: 'edu_adv', path: ['3½ - 5'] },
  { classKey: 'edu_found', path: ['5 - 6', 'Traditional gymnastics'] },
  { classKey: 'edu_1', path: ['6', 'Traditional gymnastics'] },
  { classKey: 'edu_2', path: ['7', 'Traditional gymnastics'] },
  { classKey: 'edu_3', path: ['8', 'Traditional gymnastics'] },
  { classKey: 'edu_4', path: ['9', 'Traditional gymnastics'] },
  { classKey: 'edu_5', path: ['10 +', 'Traditional gymnastics'] },
  { classKey: 'urban_beg', path: ['5 - 6', 'Urban / parkour style'] },
  { classKey: 'urban_beg', path: ['6', 'Urban / parkour style'] },
  { classKey: 'urban_int', path: ['7', 'Urban / parkour style'] },
  { classKey: 'urban_adv', path: ['8', 'Urban / parkour style'] },
  { classKey: 'urban_adv', path: ['9', 'Urban / parkour style'] },
  { classKey: 'urban_adv', path: ['10 +', 'Urban / parkour style'] },
];

const SPECIAL_FLOWS: SpecialFlow[] = [
  {
    expectedName: 'PlayGym',
    expectedPrimaryHref: '/playgym',
    expectedPrimaryText: 'View PlayGym details',
    path: ['Under 2'],
  },
  // Coached classes start at around 4, so 2-3 must land on PlayGym. This is the
  // regression guard for the retired 2-4 program: if anything ever routes this
  // bucket to a coached class again, the class no longer exists.
  {
    expectedName: 'PlayGym',
    expectedPrimaryHref: '/playgym',
    expectedPrimaryText: 'View PlayGym details',
    path: ['2 - 3½'],
  },
];

const MIME_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Chrome first: some managed Edge installs refuse to start headless and exit 0
// without ever opening a debugger socket, which looks like a site failure but isn't.
// Each candidate is tried in turn, so a broken browser is skipped rather than fatal.
function getBrowserPaths(): string[] {
  const browserCandidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];

  const found = browserCandidates.filter((candidate) => existsSync(candidate));
  if (found.length === 0) {
    throw new Error('Could not find a local Chrome or Edge executable for headless verification.');
  }

  return found;
}

function resolveDistPath(pathname: string): string | null {
  const normalizedPath = pathname === '/' ? '/index.html' : pathname;
  let candidatePath = normalizedPath;

  if (!extname(candidatePath)) {
    candidatePath = candidatePath.endsWith('/') ? `${candidatePath}index.html` : `${candidatePath}/index.html`;
  }

  const filePath = resolve(DIST_DIR, `.${candidatePath}`);
  if (!filePath.startsWith(DIST_DIR)) {
    return null;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }

  return filePath;
}

function buildHarnessHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Class Selector Verification Harness</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #111827; }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p { margin: 0 0 16px; line-height: 1.5; }
      #status { font-weight: 700; margin-bottom: 16px; }
      iframe { width: 1280px; height: 900px; border: 1px solid #d1d5db; }
    </style>
  </head>
  <body data-status="running">
    <h1>Class Selector Verification Harness</h1>
    <p id="status">Running headless wizard checks...</p>
    <iframe id="site-frame" src="/policies/"></iframe>
    <script id="results" type="application/json"></script>
    <script id="error" type="application/json"></script>
    <script>
      const CLASS_FLOWS = ${JSON.stringify(CLASS_FLOWS)};
      const SPECIAL_FLOWS = ${JSON.stringify(SPECIAL_FLOWS)};

      function normalizeText(value) {
        return (value || '')
          .replace(/[\\u2012-\\u2015\\u2212]/g, '-')
          .replace(/\\s+/g, ' ')
          .trim();
      }

      function getText(node) {
        return normalizeText(node ? node.textContent || '' : '');
      }

      function isFallbackChoiceLabel(label) {
        return label === 'None of these days work' || label === 'Neither option suits';
      }

      function waitFor(predicate, label, timeoutMs = 8000) {
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
          function check() {
            try {
              const value = predicate();
              if (value) {
                resolve(value);
                return;
              }
            } catch (error) {
              reject(error);
              return;
            }

            if (Date.now() - startTime > timeoutMs) {
              reject(new Error('Timed out waiting for ' + label));
              return;
            }

            setTimeout(check, 25);
          }

          check();
        });
      }

      async function getSiteDocument() {
        const frame = document.getElementById('site-frame');
        await waitFor(() => frame.contentWindow && frame.contentWindow.document.readyState === 'complete', 'iframe page load', 15000);
        const doc = frame.contentWindow.document;
        await waitFor(() => doc.querySelector('[data-open-class-selector]'), 'class selector trigger', 15000);
        return doc;
      }

      async function openWizard(doc) {
        const overlay = doc.getElementById('cs-overlay');
        if (overlay && !overlay.hasAttribute('hidden')) {
          return;
        }

        const trigger = doc.querySelector('[data-open-class-selector]');
        if (!trigger) {
          throw new Error('Could not find [data-open-class-selector] trigger.');
        }

        trigger.click();
        await waitFor(() => {
          const currentOverlay = doc.getElementById('cs-overlay');
          return currentOverlay && !currentOverlay.hasAttribute('hidden');
        }, 'wizard overlay open');
      }

      async function waitForAgeStep(doc) {
        await waitFor(() => getText(doc.querySelector('.cs-q-title')) === 'Find the right class for your child', 'age step');
      }

      function findChoiceButton(doc, label, sub) {
        const buttons = Array.from(doc.querySelectorAll('.cs-choice'));
        return buttons.find((button) => {
          const buttonLabel = getText(button.querySelector('.cs-choice-label'));
          const buttonSub = getText(button.querySelector('.cs-choice-sub'));
          if (buttonLabel !== normalizeText(label)) {
            return false;
          }

          if (sub === undefined) {
            return true;
          }

          return buttonSub === normalizeText(sub);
        }) || null;
      }

      async function clickChoice(doc, label, sub) {
        const button = await waitFor(() => findChoiceButton(doc, label, sub), 'choice "' + label + '"');
        button.click();
      }

      async function navigatePath(doc, path) {
        for (const label of path) {
          await clickChoice(doc, label);
        }
      }

      async function clickRestart(doc) {
        const restartButton = await waitFor(() => doc.getElementById('cs-restart'), 'restart button');
        restartButton.click();
        await waitForAgeStep(doc);
      }

      function collectClassResult(doc, flow, choice) {
        const summaryLines = Array.from(doc.querySelectorAll('.cs-selection-summary p')).map((node) => getText(node));
        const primary = doc.querySelector('.cs-btn-primary');
        const learnMore = doc.querySelector('.cs-btn-secondary');

        return {
          kind: 'class',
          classKey: flow.classKey,
          path: flow.path,
          buttonLabel: normalizeText(choice.label),
          buttonSub: normalizeText(choice.sub),
          resultHeading: getText(doc.querySelector('.cs-outcome-program')),
          recommendedSummary: summaryLines[0] || '',
          selectedDaySummary: summaryLines[1] || '',
          timeCardDay: getText(doc.querySelector('.cs-time-card-day')),
          timeCardTime: getText(doc.querySelector('.cs-time-card-time')),
          primaryTag: primary ? primary.tagName : null,
          primaryText: getText(primary),
          primaryHref: primary ? primary.getAttribute('href') : null,
          primaryDisabled: Boolean(primary && (primary.hasAttribute('disabled') || primary.getAttribute('aria-disabled') === 'true')),
          learnMoreHref: learnMore ? learnMore.getAttribute('href') : null,
        };
      }

      function collectSpecialResult(doc, flow) {
        const primary = doc.querySelector('.cs-btn-primary');

        return {
          kind: 'special',
          path: flow.path,
          resultHeading: getText(doc.querySelector('.cs-outcome-program')),
          primaryText: getText(primary),
          primaryHref: primary ? primary.getAttribute('href') : null,
        };
      }

      async function run() {
        const doc = await getSiteDocument();
        await openWizard(doc);
        await waitForAgeStep(doc);

        const results = [];

        for (const flow of CLASS_FLOWS) {
          await navigatePath(doc, flow.path);

          await waitFor(() => doc.querySelectorAll('.cs-choice').length > 0, 'day choices for ' + flow.classKey);
          const dayChoices = Array.from(doc.querySelectorAll('.cs-choice'))
            .map((button) => ({
              label: getText(button.querySelector('.cs-choice-label')),
              sub: getText(button.querySelector('.cs-choice-sub')),
            }))
            .filter((choice) => choice.label && !isFallbackChoiceLabel(choice.label));

          if (dayChoices.length === 0) {
            throw new Error('No day choices rendered for class flow ' + flow.classKey);
          }

          await clickRestart(doc);

          for (const choice of dayChoices) {
            await navigatePath(doc, flow.path);
            await clickChoice(doc, choice.label, choice.sub);
            await waitFor(() => doc.querySelector('.cs-outcome'), 'result outcome for ' + flow.classKey + ' ' + choice.label);
            results.push(collectClassResult(doc, flow, choice));
            await clickRestart(doc);
          }
        }

        for (const flow of SPECIAL_FLOWS) {
          await navigatePath(doc, flow.path);
          await waitFor(() => doc.querySelector('.cs-outcome'), 'special result for ' + flow.path.join(' > '));
          results.push(collectSpecialResult(doc, flow));
          await clickRestart(doc);
        }

        document.body.dataset.status = 'passed';
        document.getElementById('status').textContent = 'Headless verification completed.';
        document.getElementById('results').textContent = JSON.stringify(results);
      }

      run().catch((error) => {
        document.body.dataset.status = 'failed';
        document.getElementById('status').textContent = 'Headless verification failed.';
        document.getElementById('error').textContent = JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : null,
        });
      });
    </script>
  </body>
</html>`;
}

function buildBrowserVerificationExpression(): string {
  return `(async () => {
    const CLASS_FLOWS = ${JSON.stringify(CLASS_FLOWS)};
    const SPECIAL_FLOWS = ${JSON.stringify(SPECIAL_FLOWS)};

    function normalizeText(value) {
      return (value || '')
        .replace(/[\\u2012-\\u2015\\u2212]/g, '-')
        .replace(/\\s+/g, ' ')
        .trim();
    }

    function getText(node) {
      return normalizeText(node ? node.textContent || '' : '');
    }

    function isFallbackChoiceLabel(label) {
      return label === 'None of these days work' || label === 'Neither option suits';
    }

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function waitFor(predicate, label, timeoutMs = 10000) {
      const startTime = Date.now();
      return new Promise((resolve, reject) => {
        function check() {
          try {
            const value = predicate();
            if (value) {
              resolve(value);
              return;
            }
          } catch (error) {
            reject(error);
            return;
          }

          if (Date.now() - startTime > timeoutMs) {
            reject(new Error('Timed out waiting for ' + label));
            return;
          }

          setTimeout(check, 25);
        }

        check();
      });
    }

    async function openWizard() {
      const trigger = await waitFor(
        () => document.querySelector('[data-open-class-selector]'),
        'class selector trigger',
        20000,
      );
      const overlay = await waitFor(
        () => document.getElementById('cs-overlay'),
        'class selector overlay element',
        20000,
      );

      const timeoutAt = Date.now() + 10000;
      while (Date.now() < timeoutAt) {
        if (!overlay.hasAttribute('hidden')) {
          return;
        }

        trigger.click();
        await sleep(50);

        if (!overlay.hasAttribute('hidden')) {
          return;
        }
      }

      throw new Error('Timed out waiting for wizard overlay to open');
    }

    async function waitForAgeStep() {
      await waitFor(() => getText(document.querySelector('.cs-q-title')) === 'Find the right class', 'age step');
    }

    function findChoiceButton(label, sub) {
      const buttons = Array.from(document.querySelectorAll('.cs-choice'));
      return buttons.find((button) => {
        const buttonLabel = getText(button.querySelector('.cs-choice-label'));
        const buttonSub = getText(button.querySelector('.cs-choice-sub'));
        if (buttonLabel !== normalizeText(label)) {
          return false;
        }

        if (sub === undefined) {
          return true;
        }

        return buttonSub === normalizeText(sub);
      }) || null;
    }

    async function clickChoice(label, sub) {
      const button = await waitFor(() => findChoiceButton(label, sub), 'choice "' + label + '"');
      button.click();
    }

    async function clickDay(day) {
      const button = await waitFor(
        () => document.querySelector('.cs-day-pill[data-day="' + day + '"]'),
        'day "' + day + '"',
      );
      button.click();
    }

    async function navigatePath(path) {
      for (const label of path) {
        await clickChoice(label);
      }
    }

    async function clickRestart() {
      const restartButton = await waitFor(() => document.getElementById('cs-restart'), 'restart button');
      restartButton.click();
      await waitForAgeStep();
    }

    function collectClassResult(flow, choice) {
      const primary = document.querySelector('.cs-btn-primary');
      const learnMore = document.querySelector('.cs-btn-secondary');

      return {
        kind: 'class',
        classKey: flow.classKey,
        path: flow.path,
        selectedDay: normalizeText(choice.label),
        resultHeading: getText(document.querySelector('.cs-outcome-program')),
        timeCardDay: getText(document.querySelector('.cs-time-card-day')),
        timeCardTime: getText(document.querySelector('.cs-time-card-time')),
        primaryTag: primary ? primary.tagName : null,
        primaryText: getText(primary),
        primaryHref: primary ? primary.getAttribute('href') : null,
        primaryDisabled: Boolean(primary && (primary.hasAttribute('disabled') || primary.getAttribute('aria-disabled') === 'true')),
        learnMoreHref: learnMore ? learnMore.getAttribute('href') : null,
      };
    }

    function collectSpecialResult(flow) {
      const primary = document.querySelector('.cs-btn-primary');

      return {
        kind: 'special',
        path: flow.path,
        resultHeading: getText(document.querySelector('.cs-outcome-program')),
        primaryText: getText(primary),
        primaryHref: primary ? primary.getAttribute('href') : null,
      };
    }

    await waitFor(() => document.readyState === 'complete', 'document ready', 20000);
    await openWizard();
    await waitForAgeStep();

    const results = [];

    for (const flow of CLASS_FLOWS) {
      await navigatePath(flow.path);
      await waitFor(() => document.querySelector('.cs-outcome'), 'result outcome for ' + flow.classKey);

      await waitFor(() => document.querySelectorAll('.cs-day-pill').length > 0, 'day choices for ' + flow.classKey);
      const dayChoices = Array.from(document.querySelectorAll('.cs-day-pill'))
        .map((button) => ({
          label: getText(button),
          day: button.getAttribute('data-day'),
        }))
        .filter((choice) => choice.label && choice.day && !isFallbackChoiceLabel(choice.label));

      if (dayChoices.length === 0) {
        throw new Error('No day choices rendered for class flow ' + flow.classKey);
      }

      await clickRestart();

      for (const choice of dayChoices) {
        await navigatePath(flow.path);
        await waitFor(() => document.querySelector('.cs-outcome'), 'result outcome for ' + flow.classKey + ' ' + choice.label);
        await clickDay(choice.day);
        await waitFor(() => getText(document.querySelector('.cs-time-card-day')) === choice.label, 'time preview for ' + choice.label);
        results.push(collectClassResult(flow, choice));
        await clickRestart();
      }
    }

    for (const flow of SPECIAL_FLOWS) {
      await navigatePath(flow.path);
      await waitFor(() => document.querySelector('.cs-outcome'), 'special result for ' + flow.path.join(' > '));
      results.push(collectSpecialResult(flow));
      await clickRestart();
    }

    window.__classSelectorResults = JSON.stringify(results);
    return window.__classSelectorResults.length;
  })()`;
}

function normalizeText(value: string): string {
  return value
    .replace(/[\u2012-\u2015\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDayLabel(dayName: string): string {
  const normalized = normalizeText(dayName).toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function serveHarnessRequest(pathname: string): string | null {
  if (pathname === '/__verify/class-selector') {
    return buildHarnessHtml();
  }

  return null;
}

async function startServer() {
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    const harnessHtml = serveHarnessRequest(requestUrl.pathname);
    if (harnessHtml !== null) {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(harnessHtml);
      return;
    }

    const filePath = resolveDistPath(requestUrl.pathname);
    if (!filePath) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const extension = extname(filePath).toLowerCase();
    const fileContents = readFileSync(filePath);
    response.writeHead(200, {
      'content-type': MIME_TYPES[extension] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    response.end(fileContents);
  });

  await new Promise<void>((resolvePromise, rejectPromise) => {
    server.once('error', rejectPromise);
    server.listen(0, '127.0.0.1', () => resolvePromise());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Could not determine verification server port.');
  }

  return {
    close: () =>
      new Promise<void>((resolvePromise, rejectPromise) => {
        server.close((error) => {
          if (error) {
            rejectPromise(error);
            return;
          }

          resolvePromise();
        });
      }),
    port: address.port,
  };
}

type CdpResponse = {
  error?: { message?: string };
  result?: unknown;
};

class CdpClient {
  private readonly socket: WebSocket;
  private nextMessageId = 1;
  private readonly pending = new Map<
    number,
    {
      reject: (error: Error) => void;
      resolve: (value: unknown) => void;
    }
  >();

  constructor(debuggerUrl: string) {
    this.socket = new WebSocket(debuggerUrl);
  }

  async connect(): Promise<void> {
    await new Promise<void>((resolvePromise, rejectPromise) => {
      this.socket.addEventListener('open', () => resolvePromise(), { once: true });
      this.socket.addEventListener(
        'error',
        () => rejectPromise(new Error('Could not connect to the browser debugging websocket.')),
        { once: true },
      );
    });

    this.socket.addEventListener('message', (event) => {
      const payload = JSON.parse(String(event.data)) as CdpResponse & { id?: number };
      if (payload.id === undefined) {
        return;
      }

      const pendingRequest = this.pending.get(payload.id);
      if (!pendingRequest) {
        return;
      }

      this.pending.delete(payload.id);

      if (payload.error) {
        pendingRequest.reject(new Error(payload.error.message ?? 'Unknown CDP error.'));
        return;
      }

      pendingRequest.resolve(payload.result);
    });

    this.socket.addEventListener('close', () => {
      for (const pendingRequest of this.pending.values()) {
        pendingRequest.reject(new Error('Browser debugging socket closed unexpectedly.'));
      }
      this.pending.clear();
    });
  }

  async close(): Promise<void> {
    if (this.socket.readyState === WebSocket.CLOSED) {
      return;
    }

    await new Promise<void>((resolvePromise) => {
      this.socket.addEventListener('close', () => resolvePromise(), { once: true });
      this.socket.close();
    });
  }

  async send<T>(
    method: string,
    params: Record<string, unknown> = {},
    sessionId?: string,
  ): Promise<T> {
    const messageId = this.nextMessageId++;
    const payload: Record<string, unknown> = {
      id: messageId,
      method,
      params,
    };

    if (sessionId) {
      payload.sessionId = sessionId;
    }

    return new Promise<T>((resolvePromise, rejectPromise) => {
      this.pending.set(messageId, {
        reject: rejectPromise,
        resolve: (value) => resolvePromise(value as T),
      });
      this.socket.send(JSON.stringify(payload));
    });
  }
}

async function waitForDebuggerUrl(
  browserProcess: ReturnType<typeof spawn>,
): Promise<string> {
  return new Promise<string>((resolvePromise, rejectPromise) => {
    let stderrBuffer = '';

    const cleanup = () => {
      browserProcess.stderr.off('data', handleStderr);
      browserProcess.off('exit', handleExit);
      browserProcess.off('error', handleError);
    };

    const handleError = (error: Error) => {
      cleanup();
      rejectPromise(error);
    };

    const handleExit = (code: number | null) => {
      cleanup();
      rejectPromise(
        new Error(`Headless browser exited before exposing a debugger websocket. Exit code: ${code}`),
      );
    };

    const handleStderr = (chunk: string | Buffer) => {
      stderrBuffer += String(chunk);
      const match = stderrBuffer.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (!match) {
        return;
      }

      cleanup();
      resolvePromise(match[1]);
    };

    browserProcess.stderr.setEncoding('utf8');
    browserProcess.stderr.on('data', handleStderr);
    browserProcess.once('exit', handleExit);
    browserProcess.once('error', handleError);
  });
}

async function getPageDebuggerUrl(browserDebuggerUrl: string): Promise<string> {
  const debugHttpBase = browserDebuggerUrl
    .replace(/^ws:\/\//, 'http://')
    .replace(/\/devtools\/browser\/.+$/, '');

  const pageListResponse = await fetch(`${debugHttpBase}/json/list`);
  if (!pageListResponse.ok) {
    throw new Error(`Could not fetch Chrome DevTools page list: ${pageListResponse.status}`);
  }

  const pageTargets = await pageListResponse.json() as Array<{
    type?: string;
    webSocketDebuggerUrl?: string;
  }>;
  const pageTarget = pageTargets.find(
    (target) => target.type === 'page' && typeof target.webSocketDebuggerUrl === 'string',
  );

  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('Could not find a page websocket debugger URL.');
  }

  return pageTarget.webSocketDebuggerUrl;
}

async function evaluateExpression<T>(
  client: CdpClient,
  expression: string,
  sessionId?: string,
): Promise<T> {
  const evaluation = await client.send<Record<string, unknown>>(
    'Runtime.evaluate',
    {
      expression,
      returnByValue: false,
    },
    sessionId,
  );

  if ('exceptionDetails' in evaluation && evaluation.exceptionDetails) {
    throw new Error(`Runtime.evaluate threw: ${JSON.stringify(evaluation.exceptionDetails).slice(0, 1000)}`);
  }

  const nestedResult = evaluation.result;
  if (!nestedResult || typeof nestedResult !== 'object') {
    throw new Error(`Unexpected Runtime.evaluate result: ${JSON.stringify(evaluation).slice(0, 1000)}`);
  }

  if (
    'subtype' in nestedResult &&
    nestedResult.subtype === 'promise' &&
    'objectId' in nestedResult &&
    typeof nestedResult.objectId === 'string'
  ) {
    const awaitedPromise = await client.send<Record<string, unknown>>(
      'Runtime.awaitPromise',
      {
        promiseObjectId: nestedResult.objectId,
        returnByValue: true,
      },
      sessionId,
    );

    if ('exceptionDetails' in awaitedPromise && awaitedPromise.exceptionDetails) {
      throw new Error(`Runtime.awaitPromise threw: ${JSON.stringify(awaitedPromise.exceptionDetails).slice(0, 1000)}`);
    }

    const awaitedResult = awaitedPromise.result;
    if (
      awaitedResult &&
      typeof awaitedResult === 'object' &&
      'value' in awaitedResult
    ) {
      return (awaitedResult as { value: T }).value;
    }

    throw new Error(`Unexpected Runtime.awaitPromise result: ${JSON.stringify(awaitedPromise).slice(0, 1000)}`);
  }

  if ('value' in nestedResult) {
    return (nestedResult as { value: T }).value;
  }

  if (
    'description' in nestedResult &&
    typeof (nestedResult as { description?: unknown }).description === 'string'
  ) {
    return (nestedResult as { description: T }).description;
  }

  throw new Error(`Unexpected Runtime.evaluate response: ${JSON.stringify(evaluation).slice(0, 1000)}`);
}

async function runHeadlessVerification(port: number): Promise<HarnessResult[]> {
  const browserPaths = getBrowserPaths();
  let lastError: unknown = null;

  for (const browserPath of browserPaths) {
    try {
      return await runHeadlessVerificationWith(browserPath, port);
    } catch (error) {
      lastError = error;
      const detail = error instanceof Error ? error.message : String(error);
      console.log(`  note: ${browserPath.split('\\').pop()} could not be driven headlessly (${detail}), trying the next browser.`);
    }
  }

  throw lastError ?? new Error('No usable browser for headless verification.');
}

async function runHeadlessVerificationWith(
  browserPath: string,
  port: number,
): Promise<HarnessResult[]> {
  const targetUrl = `http://127.0.0.1:${port}/policies/`;
  // Without a dedicated profile, launching a browser while the user already has one
  // open just hands the URL to the running instance and exits 0 — no debugger socket,
  // and verification fails for reasons that have nothing to do with the site.
  const browserProfileDir = mkdtempSync(join(tmpdir(), 'trident-verify-'));
  const browserProcess = spawn(
    browserPath,
    [
      // Explicitly the new headless implementation: bare --headless is deprecated
      // and silently no-ops on some builds.
      '--headless=new',
      `--user-data-dir=${browserProfileDir}`,
      '--disable-gpu',
      '--blink-settings=imagesEnabled=false',
      '--disable-background-networking',
      '--disable-extensions',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=0',
      'about:blank',
    ],
    {
      stdio: ['ignore', 'ignore', 'pipe'],
    },
  );

  let client: CdpClient | null = null;

  try {
    const browserDebuggerUrl = await waitForDebuggerUrl(browserProcess);
    const pageDebuggerUrl = await getPageDebuggerUrl(browserDebuggerUrl);
    client = new CdpClient(pageDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Page.navigate', { url: targetUrl });
    const evaluationSummary = await evaluateExpression<unknown>(
      client,
      buildBrowserVerificationExpression(),
    );

    const resultLength = typeof evaluationSummary === 'number' ? evaluationSummary : null;

    if (resultLength === null) {
      throw new Error(
        `Unexpected verification summary payload: ${JSON.stringify(evaluationSummary).slice(0, 500)}`,
      );
    }

    let serializedResults = '';
    for (let offset = 0; offset < resultLength; offset += 5000) {
      const chunk = await evaluateExpression<string>(
        client,
        `window.__classSelectorResults.slice(${offset}, ${offset + 5000})`,
      );
      serializedResults += chunk;
    }

    return JSON.parse(serializedResults) as HarnessResult[];
  } finally {
    if (client) {
      await client.close().catch(() => undefined);
    }

    browserProcess.kill();
    try {
      rmSync(browserProfileDir, { force: true, recursive: true });
    } catch {
      // A leftover temp profile is harmless; never fail verification over cleanup.
    }
  }
}

function verifyClassResult(result: HarnessClassResult): string[] {
  const failures: string[] = [];
  const classOption = getClassSelectorOption(result.classKey);
  const normalizedDay = normalizeText(result.selectedDay).toLowerCase();
  const expectedUrl = buildClassSelectorUrl(result.classKey, normalizedDay);

  if (!classOption) {
    failures.push(`Unknown class key "${result.classKey}".`);
    return failures;
  }

  if (!expectedUrl) {
    failures.push(`Could not build expected URL for ${result.classKey} on ${result.selectedDay}.`);
    return failures;
  }

  if (result.resultHeading !== classOption.displayName) {
    failures.push(`Expected result heading "${classOption.displayName}", found "${result.resultHeading}".`);
  }

  if (result.timeCardDay !== formatDayLabel(normalizedDay)) {
    failures.push(
      `Expected time card day "${formatDayLabel(normalizedDay)}", found "${result.timeCardDay}".`,
    );
  }

  const expectedTimeCardTime = Array.from(
    new Set(getClassSessions(result.classKey, normalizedDay).map(formatClassSessionTime)),
  ).join(', ');
  if (result.timeCardTime !== expectedTimeCardTime) {
    failures.push(
      `Expected time card time "${expectedTimeCardTime}", found "${result.timeCardTime}".`,
    );
  }

  if (result.primaryTag !== 'A') {
    failures.push(`Expected primary CTA to render as an anchor, found "${result.primaryTag ?? 'null'}".`);
  }

  if (result.primaryDisabled) {
    failures.push('Primary CTA was disabled for a valid class/day result.');
  }

  const expectedPrimaryText = `View ${formatDayLabel(normalizedDay)} classes`;
  if (result.primaryText !== expectedPrimaryText) {
    failures.push(
      `Expected primary CTA text "${expectedPrimaryText}", found "${result.primaryText}".`,
    );
  }

  if (result.primaryHref !== expectedUrl) {
    failures.push(`Expected CTA href "${expectedUrl}", found "${result.primaryHref}".`);
  }

  if (!result.learnMoreHref || !result.learnMoreHref.startsWith('/')) {
    failures.push(`Expected learn-more href to be a site path, found "${result.learnMoreHref}".`);
  }

  return failures;
}

function verifySpecialResult(result: HarnessSpecialResult, expectedFlow: SpecialFlow): string[] {
  const failures: string[] = [];

  if (result.resultHeading !== expectedFlow.expectedName) {
    failures.push(
      `Expected special result heading "${expectedFlow.expectedName}", found "${result.resultHeading}".`,
    );
  }

  if (result.primaryText !== expectedFlow.expectedPrimaryText) {
    failures.push(
      `Expected special CTA text "${expectedFlow.expectedPrimaryText}", found "${result.primaryText}".`,
    );
  }

  if (result.primaryHref !== expectedFlow.expectedPrimaryHref) {
    failures.push(
      `Expected special CTA href "${expectedFlow.expectedPrimaryHref}", found "${result.primaryHref}".`,
    );
  }

  return failures;
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    throw new Error('dist/ does not exist. Run `npm run build` before verifying the class selector.');
  }

  console.log('Checking recommendations against iClassPro age bands...');
  const ageBandFailures = verifyAgeBands();
  if (ageBandFailures.length > 0) {
    console.error('Class selector age-band verification failed:');
    for (const failure of ageBandFailures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }
  console.log(`- All ${AGE_BAND_CHECKS.length} wizard outcomes are registerable.`);

  const server = await startServer();

  try {
    const results = await runHeadlessVerification(server.port);
    const failures: string[] = [];

    const classResults = results.filter((result): result is HarnessClassResult => result.kind === 'class');
    const specialResults = results.filter((result): result is HarnessSpecialResult => result.kind === 'special');

    for (const classResult of classResults) {
      const resultFailures = verifyClassResult(classResult);
      for (const failure of resultFailures) {
        failures.push(
          `[class ${classResult.classKey} | ${classResult.selectedDay}] ${failure}`,
        );
      }
    }

    for (const specialFlow of SPECIAL_FLOWS) {
      const resultKey = specialFlow.path.join(' > ');
      const matchingResult = specialResults.find(
        (result) => result.path.join(' > ') === resultKey,
      );

      if (!matchingResult) {
        failures.push(`[special ${resultKey}] No result was captured.`);
        continue;
      }

      const resultFailures = verifySpecialResult(matchingResult, specialFlow);
      for (const failure of resultFailures) {
        failures.push(`[special ${resultKey}] ${failure}`);
      }
    }

    if (classResults.length === 0) {
      failures.push('No class CTA results were captured by the harness.');
    }

    if (failures.length > 0) {
      console.error('Class selector verification failed:');
      for (const failure of failures) {
        console.error(`- ${failure}`);
      }
      process.exit(1);
    }

    console.log('Class selector verification passed.');
    console.log(`- Verified ${classResults.length} class day/time results end to end.`);
    console.log(`- Verified ${specialResults.length} special-case flows.`);
    console.log(`- Verified CTA URLs against src/data/classSelectorOptions.ts.`);
  } finally {
    await server.close();
  }
}

main().catch((error) => {
  console.error('Class selector verification failed to run:');
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
