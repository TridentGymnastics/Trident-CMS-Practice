# Trident CMS practice website

This is the separate test website for TridentGymnastics/Trident-CMS-Practice. It contains an Astro website copied from live-source commit 24e7ee7eb7af0ec6a64cacecbf0e65a2c0486104, with practice safeguards. The existing .pages.yml and src/content/playgym.json are preserved from this repository.

The practice repository is connected to a separate Vercel project. A Pages CMS description change and its restoration have both deployed successfully. The permanent live website remains on its existing Netlify project and GitHub repository. This repository is for practice only.

## Current editor exercise

In Pages CMS, select Trident-CMS-Practice / main. The nine PRACTICE editors cover the site-wide notice, PlayGym, four program pages, the regular class finder timetable, news, and About/policies. See [CMS-STAFF-GUIDE.md](CMS-STAFF-GUIDE.md) for exercises and limits. Each editor saves JSON that the website actually reads. settings.content.merge remains true to preserve unmanaged keys.

The root-level pages.yml and playgym.json are earlier uploaded copies. They are retained, but the app uses only .pages.yml and src/content/playgym.json.

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
- Shared program and level labels now come from the CMS, including navigation, program cards and applicable class-finder results. Stable URLs and booking IDs are preserved. PlayGym age bounds, supervision labels, gallery sizes/crops and video switches are editable. Written prose, search copy, gallery headings, historical news and PDFs still require a wording review after renames or operational changes.
- Page visibility, other homepage content, seasonal holiday calendars/promotions, birthday parties, global contact details and arbitrary layout changes still need implementation. Current editors are a useful content pilot, not a complete no-code handover.
- The build validates CMS field types, required values, media paths, dates, link formats and timetable consistency before generating pages. This catches structural mistakes, not inaccurate prices, policies, descriptions or booking information. Uploaded PDFs are linked, not edited.

## Editor validation fixes

See [CMS-TEST-REPORT.md](CMS-TEST-REPORT.md) for the final practice audit, the empty-field fixes, and the remaining hosted/account checks.

Optional lists use required: false: in Pages CMS, required: true enforces at least one item even if list.min is zero. Photo crop positions use a select field with a centre default; the previous optional string pattern rejected the blank value that the CMS creates for omitted fields. Optional link patterns accept empty strings. Empty galleries and disabled videos are valid.

The previous failures were reproduced against the public Pages CMS field/schema validation functions at source commit 6f4e860a35d934406580287e7042e5e111e207a1. All nine updated editor forms, including empty-gallery states, passed that check. This verifies the schema and field values; the final hosted save/deploy test is still performed in Pages CMS after pushing this update.

The practice build and class-finder browser checks pass. Temporary content tests also verified shared renames, age limits, supervision, weekend sessions, empty galleries and video switches, then restored the original content. `astro check` separately reports 33 errors in existing code (including missing Node type declarations, untyped component props and legacy DOM handlers); it is not a passing check. Those diagnostics do not come from the new CMS fields or shared program-data module.

## Moving the finished CMS to the existing Netlify website

The intended permanent flow is staff → Pages CMS → TridentGymnastics/Trident-Gymnastics → existing Netlify project → existing domain. There is no need to move the domain or replace the Netlify project.

This step has NOT happened. First finish staff testing and agree the remaining editable content. Then prepare a branch in the original repository and selectively port the CMS schema, content files, media resolver, content validation and component wiring against the latest live source. Preserve newer live content. Review and build the branch, use an isolated preview, and verify contact forms, canonical URLs, navigation, booking links and mobile pages before merging to the live deployment branch.

Do not replace the production repository with this practice copy. Do not copy its practice-origin.mjs, Vercel configuration, preview-only Netlify configuration, noindex metadata/headers, robots restrictions, disabled careers form, practice badge, caches or package junction. For Layout.astro, only the SiteNotice import/render belongs to this CMS change. Production must retain its existing hosting and form setup. Connect Pages CMS to the original repository only after this migration is reviewed and ready: saves on its deployed branch can publish to the real site.

## References

- Pages CMS editing: https://pagescms.org/docs/
- Pages CMS validation source used for the form checks: https://github.com/hunvreus/pagescms/blob/6f4e860a35d934406580287e7042e5e111e207a1/lib/schema.ts
- Netlify repository connection: https://docs.netlify.com/start/quickstarts/deploy-from-repository/
- Netlify shared usage: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
- Cloudflare Pages build configuration: https://developers.cloudflare.com/pages/configuration/build-configuration/
- Vercel Astro support: https://vercel.com/docs/frameworks/frontend/astro
- Vercel plan eligibility: https://vercel.com/docs/limits/fair-use-guidelines
- Vercel Git permissions: https://vercel.com/docs/git
