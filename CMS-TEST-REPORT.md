# Simplified practice website verification - 22 September 2026

This report supersedes the earlier nine-editor/class-finder audit. The current practice website uses the simpler staff workflow. The live Netlify repository remains unchanged at 24e7ee7eb7af0ec6a64cacecbf0e65a2c0486104.

## What changed

- 12 focused editors in three groups replace the previous nine large forms. Visible field definitions dropped from 248 to 135 (about 46%); excluding object headings, actual input definitions dropped from 200 to 104. Repeated list rows are not counted as new definitions.
- Direct iClassPro class links replace the website's custom class finder and duplicate timetable editor.
- A fixed holiday page and homepage promotion use one status selector, program switches and editable factual information. Existing holiday subpage URLs use the same content and status.
- Simple party packages, a term-calendar image and shared club contact details are now editable.
- Program layout is fixed; staff retain colour presets, names, descriptions, levels and photo choices. Search descriptions and gallery headings follow shared content. Duplicated PlayGym savings claims are no longer displayed.
- Original class-finder/seasonal components, data and legacy scripts are retained for reversibility but are not active on the website.

## Results

| Check | Result |
| --- | --- |
| Pages CMS field validation | All 12 forms pass the pinned upstream field/schema validation functions, including empty galleries and the disabled-video state. Rechecked after the latest AGC upload. |
| Build | Passed: 19 pages including the error page. Latest AGC image was optimised successfully. |
| Holiday states | Open, Coming soon and Closed tested using temporary local edits/builds. Inactive states hide old dates and bookings on all four holiday URLs and hide the dated homepage promotion. |
| Program switches | Disabling the booked holiday programs removes their cards and booking links, including on their old direct URLs. The remaining PlayGym card uses its shared name/price. |
| Shared content | Temporary program name/search-description, PlayGym price, party price/time, term-calendar heading, contact phone/email/hours and news-date changes reached generated HTML. A news item without a technical ID works. |
| Empty fields | Removed 18 optional keys, including program galleries. Validation and build passed. |
| Restoration | All temporary content changes restored byte for byte. Existing staff test wording and later AGC upload retained. |
| Browser checks | All 18 normal routes at 1440px and 390px: no page JavaScript errors, broken loaded images, missing requested assets or horizontal page overflow. |
| Navigation | Mobile menu/submenu and program navigation pass. Header/homepage class links point to iClassPro. Holiday booking links match the configured destination. No class-finder overlay remains. |
| Visual inspection | Desktop/phone holiday pages and phone birthday page inspected. Corrected the holiday hero paragraph contrast, rebuilt and rechecked all four holiday routes. |
| Practice safeguards | All normal pages have noindex metadata, the practice label and no active HTML forms. External requests blocked in browser tests; no bookings submitted. |
| Source hygiene | Mobile-nav static check and Git diff whitespace checks pass. |
| Type check | Astro check still reports the same 33 pre-existing errors, involving missing Node types, untyped component callbacks and legacy handlers. This check is not passing; the simplified implementation adds no diagnostics to that baseline. |

## Concurrent staff edits

Fetched and merged practice commits 9e242cf, 7f11e60 and 0e72fb5 without conflicts. These add the balance-spring-hp.png photo and select it for AGC. The saved image and description were preserved. Build, CMS form validation and desktop/mobile AGC rendering were checked after merging. Gallery columns are now fixed by the template, so the old saved column value is intentionally no longer an editor control.

## Remaining hands-on checks

- Push the prepared practice commits once, wait for the practice Vercel deployment, and refresh Pages CMS. The updated grouped editor has not been checked in an authenticated hosted CMS session yet.
- A staff member should complete the short exercises in CMS-STAFF-GUIDE.md without coaching. Confirm the new groups, save/reopen, image/PDF selection and relevant account access. The observed AGC upload confirms an existing upload path, not all future files or staff permissions.
- The existing TEST notice links to /homepage, which does not exist. Use / for the homepage when finishing the exercise; this user test content has been preserved.
- Booking portal availability, prices and operational facts still require staff confirmation. Local browser tests validate link destinations, not real enrolments.
- Saving still follows the existing Git-to-host build flow. Drafts and a separate Publish website button have not been implemented.
- Production migration is separate. Preserve the real site's domain, hosting, forms and search indexing when selectively porting the reviewed changes.

## Local evidence

Temporary audit files are in C:/Users/Dylan/AppData/Local/Temp/trident-simple-cms-audit-20260922/: rendered-site-results.json, content-test-results.json and desktop/mobile screenshots. Build log: ../trident-simple-cms-build-20260922.log. Type-check log: ../trident-simple-cms-types-20260922.log.

The pure Pages CMS validators were checked against upstream source commit 6f4e860a35d934406580287e7042e5e111e207a1. Browser checks used local Chrome with external network requests blocked. Full route checks preceded the final contrast fix and latest AGC upload; affected holiday/AGC routes and navigation were rechecked afterwards.

Use npm run verify:cms, npm run build and npm run verify:mobile-nav for the maintained repository checks. Legacy class-finder/holiday/poster scripts do not verify the simplified active pages. Do not install/update dependencies in this prepared clone: its packages are a junction to the original checkout; build output and caches are separate.
