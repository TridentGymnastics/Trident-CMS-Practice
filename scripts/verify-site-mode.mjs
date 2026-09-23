import assert from 'node:assert/strict';
import {test} from 'node:test';
import {resolveSiteMode} from '../site-mode.mjs';

test('production keeps the real domain and permits production form rendering', () => {
  const mode = resolveSiteMode({mode:'production'}, {CONTEXT:'production'});
  assert.equal(mode.siteUrl, 'https://www.tridentgymnastics.com.au');
  assert.equal(mode.isNonProduction, false);
});
test('Netlify branch and PR previews disable forms and indexing', () => {
  for (const CONTEXT of ['branch-deploy','deploy-preview']) assert.equal(resolveSiteMode({mode:'production'}, {CONTEXT}).isNonProduction, true);
});
test('practice cannot become production or use the real domain', () => {
  assert.equal(resolveSiteMode({mode:'practice'}, {}).isNonProduction, true);
  assert.throws(() => resolveSiteMode({mode:'practice'}, {PRACTICE_SITE_URL:'https://www.tridentgymnastics.com.au'}));
  assert.throws(() => resolveSiteMode({mode:'production'}, {REPOSITORY_URL:'https://github.com/TridentGymnastics/Trident-CMS-Practice.git'}));
  assert.throws(() => resolveSiteMode({mode:'practice'}, {REPOSITORY_URL:'https://github.com/TridentGymnastics/Trident-Gymnastics.git'}));
});
