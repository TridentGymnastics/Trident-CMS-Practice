import { readFileSync } from 'node:fs';
import path from 'node:path';

const layoutPath = path.join(process.cwd(), 'src', 'layouts', 'Layout.astro');
const layoutSource = readFileSync(layoutPath, 'utf8');

const failures: string[] = [];
const globalInitImports = layoutSource.match(/import\s+['"]\.\.\/scripts\/global-init['"]/g) ?? [];

if (globalInitImports.length !== 1) {
  failures.push(`Expected exactly 1 global-init import in Layout.astro, found ${globalInitImports.length}.`);
}

const inlineNavChecks: Array<{ label: string; pattern: RegExp }> = [
  {
    label: 'legacy inline mobile-nav marker',
    pattern: /Mobile navigation script - inline for reliability/
  },
  {
    label: 'inline initMobileNav function in Layout.astro',
    pattern: /<script[^>]*is:inline[\s\S]*?\binitMobileNav\b[\s\S]*?<\/script>/
  },
  {
    label: 'inline mobile toggle click binding in Layout.astro',
    pattern: /<script[^>]*is:inline[\s\S]*?querySelector\(['"]\.mobile-toggle['"]\)[\s\S]*?addEventListener\(['"]click['"]/ 
  },
  {
    label: 'inline primary-nav show class toggling in Layout.astro',
    pattern: /<script[^>]*is:inline[\s\S]*?primaryNav\.classList\.(add|remove)\(['"]show['"]\)/
  }
];

for (const check of inlineNavChecks) {
  if (check.pattern.test(layoutSource)) {
    failures.push(`Found forbidden ${check.label}.`);
  }
}

if (failures.length > 0) {
  console.error('Mobile nav verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Mobile nav verification passed.');
