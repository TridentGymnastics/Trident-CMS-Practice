# CMS migration and practice mirror

Status: prepared locally, NOT published. Live GitHub access returned Repository not found through both Git and the connected GitHub tool. The account must fetch the private repository successfully before we can confirm the latest live base or publish a review branch. Do not make the repository public to solve authentication.

## Source and recovery

- Live source: TridentGymnastics/Trident-Gymnastics, local branch cms/live-handover.
- Base: 24e7ee7eb7af0ec6a64cacecbf0e65a2c0486104. Local recovery tag: pre-cms-migration-20260923. This tag does not prove it is the latest remote/live deployment.
- Practice source: TridentGymnastics/Trident-CMS-Practice through 16c290c. Prior exercise state is retained in its Git history and local tag practice-before-live-mirror-20260923.
- User chose to restore original launch content: Spring, 21 September to 2 October 2026, all 21 sessions including the Friday 25 September closure, original program descriptions/photos, party information and the actual 2026 policy PDF. Test notice disabled/cleared. No test PDF reference remains.

## What changes

The existing website gains the 13 staff editors, shared content files, simpler class booking links, holiday schedules/themes and policy management tested in practice. The Classes morning-session banner is removed. Host-specific Netlify functions, redirects, headers and production form destination/honeypot/reCAPTCHA remain. Node is pinned to 24. The old duplicate GitHub Pages deployment is manual-only; Netlify remains the automatic hosting service.

site-environment.json is the only shared-code mode setting: production in the real repository, practice in the training repository. site-mode.mjs also recognises Netlify deploy-preview and branch-deploy contexts. Production uses the existing www domain, normal search metadata and working form markup. Practice and previews show a badge, disable applications, block form submissions with CSP, and disallow indexing. Practice-host headers and vercel.json remain separate and must never be copied into the live repository.

## Checks completed locally

- Production, Netlify preview mode and mirrored practice builds generated 19 pages each.
- Five holiday schedule tests and three environment-safety tests pass.
- Production static markup retains Netlify form name, POST/action, reCAPTCHA and honeypot; preview/practice renders disabled controls with no form registration. Canonical URLs, robots rules, badges and structured data follow the correct mode.
- Production browser audit: 18 routes at desktop/mobile widths, 36 checks passed. Mobile navigation, portal destinations and all six holiday date lists passed. No missing local links/assets, broken loaded images, page errors or overflow. No forms were submitted; external requests blocked.
- Mirrored practice browser audit: the same 18 routes and 36 desktop/mobile checks passed; safeguards remained enabled. 124 source files plus the CMS schema and shared build/mode code match byte for byte between checkouts.
- Type check is NOT clean: 34 diagnostics. The practice baseline had 33; the additional diagnostic is the pre-existing live-only stackbit.config.ts missing @stackbit/types. Other errors involve legacy tooling/type annotations and existing components/header nullability. These were reviewed, not hidden or claimed fixed.
- Actual Netlify preview, authenticated CMS save/reopen on the migration branch, real-domain smoke test and enquiry delivery remain to be verified.

Evidence is in the local Temp folder: trident-migration-audit-production, trident-migration-audit-practice, trident-live-migration-build.log, trident-netlify-migration-preview.log, trident-mirrored-practice-build.log and trident-migration-types.log.

## Publish sequence

1. Use the authorised GitHub account to Fetch origin in the LIVE repository. Reconcile any newer commits into cms/live-handover and rerun affected checks. Do not merge into main yet.
2. Publish the cms/live-handover branch, create a draft pull request to main, and review the existing Netlify project's Deploy Preview. No domain/project/account replacement is needed. If previews are disabled, configure a preview for this branch within the existing project.
3. Select the migration branch of Trident-Gymnastics in Pages CMS. Check holiday dates, a notice and PDF selection. Save/reopen and confirm the preview reflects the saved version. Restore intended launch content after testing. Check branch names carefully: main saves can publish immediately.
4. Confirm the publishing policy with the owner. Existing automatic publishing has not been changed. If manual publication is selected, configure and test it before staff use main; locking publishing still allows builds on saves.
5. After final launch approval, merge the reviewed branch. Netlify deploys through its existing connection. Verify www/non-www redirects, homepage/classes/holidays/policies, mobile menu, canonical/indexing, downloaded PDF and application form/reCAPTCHA on the real host. Send one agreed test application and confirm delivery with the nominated recipient.
6. Select the live repo/main in Pages CMS for real changes. Retain the practice repo for training and label bookmarks clearly.

## Keep practice matching live

Both repositories now use identical page/component code, schema and initial content, with separate mode/hosting settings. They are NOT continuously synced: practice saves must remain harmless exercises, and a refresh must not unexpectedly erase someone's training changes.

After a live release, fetch both repositories, use the live main checkout and run:

    node scripts/sync-practice.mjs --to="ABSOLUTE_PATH_TO_PRACTICE"

This previews a one-way code/assets refresh and retains practice content. Add --apply to write the reviewed changes. To deliberately reset training content to the current live content, use --content as well. The destination must be clean and its origin must be exactly Trident-CMS-Practice. The command never deletes files or copies credentials, functions, workflows, netlify.toml, vercel.json or public hosting/indexing overrides. It sets practice mode, then leaves changes for review, build, commit and push in the practice repository. New dependencies need a coordinated package/lockfile update; never install through the existing shared node_modules junction.

This refresh uses existing Git access and does not require another service/account or a cross-repository automation token. It is a technical maintenance task, not a staff task for routine text/date changes.

## Rollback

Record the actual published Netlify deploy and final live base immediately before launch. If launch fails, manually publish that known-good Netlify deploy, then revert the migration merge in Git so the next automatic build does not reintroduce it. Verify forms and canonical/indexing after rollback. Do not reset/force-push the shared main branch. The local recovery tag is a source reference, not a substitute for confirming which deploy was live.
