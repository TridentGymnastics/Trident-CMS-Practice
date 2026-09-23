# Trident CMS practice website

This is the separate test website for TridentGymnastics/Trident-CMS-Practice. It contains an Astro website copied from live-source commit 24e7ee7eb7af0ec6a64cacecbf0e65a2c0486104, with practice safeguards. The existing .pages.yml and src/content/playgym.json are preserved from this repository.

The practice repository is connected to a separate Vercel project. A Pages CMS description change and its restoration have both deployed successfully. The permanent live website remains on its existing Netlify project and GitHub repository. This repository is for practice only.

## Current staff editor

The practice site has 13 focused editors in three groups. Essential comes first with Holiday Program, Policies and Site-wide Notices; Program information and Club information hold less frequent changes. See [CMS-STAFF-GUIDE.md](CMS-STAFF-GUIDE.md).

The custom class finder is replaced by direct iClassPro links. Holiday pages share one simple template with a status selector, program switches and separate Week 1 / Week 2 session lists per program. All three program sections and session rows start collapsed. Dates use a date picker; start/finish times use 15-minute dropdowns, and workshops require a name. One season selector applies snow, leaves, flowers or summer sunshine to the active holiday website sections. The old calendar remains inactive. Program layout is fixed, with a header-colour preset and photo crop choices. Birthday parties use a simple editable package list. PlayGym savings calculations are no longer displayed, so staff update each price only once.

The old class finder, calendar data and poster scripts remain in the repository for reversibility, but are not used on active pages. The snow, leaf and flower decorations are reused by the new shared season component. The old verify:class-selector, verify:holidays and winter-poster commands describe that legacy implementation; they do not test the simplified active website.

Each editor saves JSON read by the website. settings.content.merge remains true to preserve unmanaged keys. The root-level pages.yml and playgym.json are earlier uploaded copies; the app uses .pages.yml and src/content/playgym.json. Saves still commit and trigger the configured hosting build; a draft/publish workflow has not been implemented.

Policies now live in src/content/policies.json, shared by /policies and /playgym. The former about.json policies property was migrated without changing its content. The current holiday dates were recovered from the retained legacy timetable, then stored in holidays.json; that legacy timetable is no longer a runtime source. Update both the website schedule and iClassPro when moving/cancelling sessions.

Run npm run verify:holiday-schedule for date, ordering, duplicate and empty-week checks, alongside the build and CMS content validation. See the 23 September section of CMS-TEST-REPORT.md for verification and limitations.

## Local preview

Use Node 24. In a normal standalone clone, run npm ci, npm run build, then npm run preview. Open http://127.0.0.1:4323/playgym. For development, npm run dev reads local content changes directly.

The prepared local clone uses a junction to the original checkout's installed packages for testing. Do not run npm install, npm ci, npm update, or dependency cleanup in that prepared clone while the junction is present. Build output and caches are isolated. A fresh clone has no junction and can use npm ci normally.

## Connect a separate test website

1. First push this prepared practice repository using a GitHub account with write access.
2. Create a NEW preview hosting project connected only to TridentGymnastics/Trident-CMS-Practice, branch main. Keep its default vercel.app, netlify.app or pages.dev address. Do not change the live project's repository connection, domains, DNS, environment variables, or credentials.
3. Build command: npm run build. Output directory: dist. Node: 24. Set PUPPETEER_SKIP_DOWNLOAD=true and ASTRO_TELEMETRY_DISABLED=1 in the preview build environment. Netlify reads these settings from this repository's preview-only netlify.toml.
4. Host usage must also be isolated from the live site. In a Netlify team using credit-based billing, exhausting the shared allowance can pause all projects. Use separate preview billing/quota, or a separate hosting service, after confirming the setup.
5. Verify the deployed /playgym page has the CMS PRACTICE banner, noindex headers and the saved description. This check must happen on the actual host; a successful local build does not prove the online connection.
6. Change one description in Pages CMS, save, wait for the practice deployment to succeed, and check the preview. Restore the text and verify a second deployment. Only then is the automatic editing flow proven.

### Vercel setup

Vercel supports this static Astro website without an adapter. Confirm plan eligibility before deploying: Hobby is restricted to personal, non-commercial use. A test copy of a club website advertising paid classes should not be assumed eligible. Preparing this configuration does not create a Vercel project or start a paid plan.

In Vercel, import TridentGymnastics/Trident-CMS-Practice as a NEW project. Use framework Astro, root directory unchanged, Node 24.x and production branch main. vercel.json supplies the install/build commands, dist output and preview headers; Vercel does not apply public/_headers as hosting configuration. Keep system environment variables exposed so the build can use the separate practice address and check the connected repository. Do not attach the real Trident domain.

Sign in through the GitHub account that owns the practice repository when importing it. Verify that a Pages CMS save triggers a deployment as well as a manual push: commit-author permissions can affect Vercel deployment behaviour. A main-branch deployment is called Production in Vercel, but it is still only this separate practice project.

## Safeguards and limits

- No original .github workflows, live Netlify configuration, production site IDs, environment files or credentials are included.
- Every generated page has noindex metadata. robots.txt disallows crawling; public/_headers supplies preview headers on Netlify/Cloudflare, and vercel.json supplies them on Vercel. Noindex is not password protection.
- The careers form is replaced by disabled controls. Booking, phone, email, map and social links are still real links; this is a content and appearance exercise.
- Canonical URLs use the practice host. practice-origin.mjs rejects custom domains and checks the practice repository when Netlify or Vercel provides its Git metadata.
- These build safeguards do not control hosting-account permissions. Do not import into or relink the existing live hosting project.
- Shared program/level labels, gallery headings and search descriptions derive from the edited program content. Stable URLs and booking IDs remain fixed. Written paragraphs, historical news and PDFs still need review after a rename or operational change.
- Holiday visibility, party packages, term-calendar image and shared phone/email/opening-hours information are editable. Branding, homepage hero/general copy, street address/maps, new page types and a general page-hiding switch remain outside the staff editor. A free-trial policy change also needs review of retained trial buttons/copy.
- The build validates CMS field types, required values, media paths, dates, link formats and timetable consistency before generating pages. This catches structural mistakes, not inaccurate prices, policies, descriptions or booking information. Uploaded PDFs are linked, not edited.

## Editor validation fixes

See [CMS-TEST-REPORT.md](CMS-TEST-REPORT.md) for the final practice audit, the empty-field fixes, and the remaining hosted/account checks.

Optional lists use required: false: in Pages CMS, required: true enforces at least one item even if list.min is zero. Photo crop positions use a select field with a centre default; the previous optional string pattern rejected the blank value that the CMS creates for omitted fields. Optional link patterns accept empty strings. Empty galleries and disabled videos are valid.

The previous failures were reproduced against the public Pages CMS field/schema validation functions at source commit 6f4e860a35d934406580287e7042e5e111e207a1. The 12 simplified editor forms from the 22 September audit, including empty-gallery states, passed that check. This verifies the schema and field values; the final hosted save/deploy test is still performed in Pages CMS after pushing this update.

See CMS-TEST-REPORT.md for the current simplified-site validation, temporary content-change tests and remaining limitations. The earlier class-finder audit is historical; the active site now links directly to iClassPro.

## Moving the finished CMS to the existing Netlify website

The intended permanent flow is staff → Pages CMS → TridentGymnastics/Trident-Gymnastics → existing Netlify project → existing domain. There is no need to move the domain or replace the Netlify project.

This step has NOT happened. First finish staff testing and agree the remaining editable content. Then prepare a branch in the original repository and selectively port the CMS schema, content files, media resolver, content validation and component wiring against the latest live source. Preserve newer live content. Review and build the branch, use an isolated preview, and verify contact forms, canonical URLs, navigation, booking links and mobile pages before merging to the live deployment branch.

Do not replace the production repository with this practice copy. Do not copy its practice-origin.mjs, Vercel configuration, preview-only Netlify configuration, noindex metadata/headers, robots restrictions, disabled careers form, practice badge, caches or package junction. Review Layout.astro selectively: its notice and shared names belong to the CMS; removing the ClassSelector belongs to the simplification. Keep production form, canonical and indexing behaviour. Production must retain its existing hosting and form setup. Connect Pages CMS to the original repository only after this migration is reviewed and ready: saves on its deployed branch can publish to the real site.

## References

- Pages CMS editing: https://pagescms.org/docs/
- Pages CMS validation source used for the form checks: https://github.com/hunvreus/pagescms/blob/6f4e860a35d934406580287e7042e5e111e207a1/lib/schema.ts
- Netlify repository connection: https://docs.netlify.com/start/quickstarts/deploy-from-repository/
- Netlify shared usage: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
- Cloudflare Pages build configuration: https://developers.cloudflare.com/pages/configuration/build-configuration/
- Vercel Astro support: https://vercel.com/docs/frameworks/frontend/astro
- Vercel plan eligibility: https://vercel.com/docs/limits/fair-use-guidelines
- Vercel Git permissions: https://vercel.com/docs/git
