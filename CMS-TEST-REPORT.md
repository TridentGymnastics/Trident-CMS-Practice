# Practice CMS verification — 22 September 2026

The CMS editing path passed the checks below after fixing the handling of empty optional fields. This is a practice-site result, not approval to replace the live site or a complete website handover.

Latest staff edits included: `fd76838` (UrbanGym), `f731496` (EduGym) and `9a19f9e` (AGC). GitHub reports the Vercel deployment of `f731496` succeeded. The deployed address redirects an unauthenticated request to Vercel login, so the automated rendered-page checks used a local build plus this commit's fixes. The UrbanGym rename arrived during the audit and received a fresh build, page and class-finder check. No extra hosted deployments were triggered.

## Results

| Check | Result |
| --- | --- |
| CMS editor validation | All 9 forms pass the pinned Pages CMS validation functions, including reopening the current saved content and empty galleries/disabled videos. |
| Empty optional fields | Removing 19 optional lists and blank optional values still validates and builds. An omitted class timetable produces a contact-the-team result instead of a booking link or crash. Original content restored byte for byte after the test. |
| Website build | Passed with the original staff test content restored; 19 pages generated, including the error page. |
| Rendered pages | All 18 normal pages checked at 1440px and 390px: no page JavaScript errors, broken loaded images, missing requested assets or horizontal page overflow. |
| Navigation | Mobile menu, Classes submenu, program link and actual homepage class finder passed. Class finder shows the saved EduGym name. |
| Class-finder checks | All 15 configured age-band outcomes, 54 class day/time results and 2 special flows passed against the stored timetable and booking IDs. No bookings submitted; live portal availability was not audited. |
| Practice protections | Every normal page has noindex metadata and the practice label; no active HTML forms. |
| Internal links | One known test-content issue: the notice's TEST link points to `/homepage`, which is not a page. Use `/` for the homepage. Existing linked PDFs resolve to local files. |
| Visual inspection | Inspected the phone homepage and desktop EduGym screenshots; content, notice, gallery and layout render as expected. |
| Type check | `astro check` still reports 33 existing errors. It is not a passing check; see README. The CMS empty-field fixes introduce no additional diagnostics. |

## Fixes found by the audit

Pages CMS removes empty optional keys when saving. Clearing all news items could crash content validation and rendering; clearing a class's final session could crash the class finder. Empty affiliation logos and parent-guide lists also needed fallbacks. These cases now behave as empty lists. Disabled video types now accept omitted source/poster/title fields, matching actual CMS saves.

The staff's notice, AGC test description, EduGym name and description, and UrbanGym rename were preserved. No production files, Netlify settings or domain configuration were changed.

## Remaining checks and decisions

- Push this practice-only fix, wait for the single Vercel deployment, then make one final save/reopen check in Pages CMS.
- Change the notice link to `/` and restore the test wording when the exercise is finished.
- Written callouts, gallery headings, search descriptions and PDFs remain separate wording. For example, the EduGym Adventurers callout does not automatically rewrite itself when the program title changes.
- A genuinely new photo/PDF/video upload and staff account permissions still need a short hands-on check. This audit verifies the current files and editing schema, not every future upload or account.
- Drafts plus a Publish button were discussed but have not been implemented. Saves still follow the existing Git-to-host deployment flow.
- Production migration and the remaining editor coverage described in the staff guide are separate work. Retain the live hosting, indexing and form settings during any later selective migration.

The practice copy uses the original checkout's package junction. Do not install or update dependencies in this prepared copy. Build/cache output is isolated.
