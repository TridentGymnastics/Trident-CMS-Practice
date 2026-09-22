# Trident Pages CMS practice

This is a content-editing exercise, not a deployable website. It contains a copy of the existing PlayGym content and an editor configuration. There is no application, deployment workflow, hosting configuration, repository remote or production credential in this pack.

## 1. Create a separate repository

At https://github.com/new create a PRIVATE repository named Trident-CMS-Practice. Prefer a club-controlled account. Do not use the existing Trident-Gymnastics repository. An empty repository is enough; no template, import, fork or deployment is needed.

## 2. Upload the practice files

Unzip this pack locally. Upload the CONTENTS of its folder, not the ZIP and not a containing folder, using GitHub's upload-existing-files option. The repository root must contain .pages.yml and README.md, with src/content/playgym.json underneath it. GitHub may call the initial branch main; that main belongs to this separate practice repository.

## 3. Connect Pages CMS

Open https://app.pagescms.org and sign in with GitHub. Install its GitHub App using Only select repositories and select ONLY Trident-CMS-Practice. Do not select All repositories or Trident-Gymnastics. If the app is already installed, review its existing access first; do not assume selecting this repository removes other permissions. Organization approval may be required.

Open Trident-CMS-Practice in Pages CMS. If it asks you to create a configuration, verify that .pages.yml was uploaded at the repository root and the correct branch is selected.

## 4. Make and reverse one edit

Open PRACTICE - PlayGym description. Copy the original Short description somewhere safe. Append TEST ONLY, save, and reopen the entry. Check src/content/playgym.json and its commit history in the PRACTICE GitHub repository: the tagline should change, and schedule, prices, policies, contact and all other keys should remain. Restore the exact original description, save again, and verify it. No website preview is expected at this stage.

The configuration sets settings.content.merge to true to preserve fields outside the editor schema. Verify the hosted app honours this before adapting the configuration for the real site. File create, rename and delete controls are disabled for this entry. These settings are editor controls, not a GitHub security boundary.

## 5. Build a separate website preview later

After the editor exercise succeeds, prepare a separate copy of the website for staging. Audit copied deployment workflows, redirects, forms, analytics and credentials before hosting it. Use a distinct preview host with indexing blocked and form submissions disabled. Production domain/DNS, hosting project and production repository stay separate. Do not connect the existing production hosting project to this practice repository.

## 6. Expand and verify before production

Add frequent updates gradually: announcements, closures, holiday seasons, program descriptions, policies and theme choices. Centralise duplicated content before exposing program-wide renaming or visibility. Use scheduled publishing only after it works end to end. Compare pages, mobile navigation, booking links, PDFs, forms and search metadata against the current site. Rehearse publishing failure and recovery with the future editor.

A production release is a separate deliberate step after the staging version passes review. Agree how staff will preview, publish and recover without asking them to manage Git. A separate practice repository alone is not the final production publishing workflow.

## Reference

Source snapshot: local commit 24e7ee7eb7af0ec6a64cacecbf0e65a2c0486104, inspected 22 September 2026. No production files were changed in preparing this pack.

- https://pagescms.org/docs/quick-start/
- https://pagescms.org/docs/configuration/settings/
- https://pagescms.org/docs/configuration/content/operations/