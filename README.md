# Trident CMS practice website

This is the separate test website for TridentGymnastics/Trident-CMS-Practice. It contains an Astro website copied from live-source commit 24e7ee7eb7af0ec6a64cacecbf0e65a2c0486104, with practice safeguards. The existing .pages.yml and src/content/playgym.json are preserved from this repository.

Nothing has been connected to a hosting account yet. A push to this repository by itself does not establish automatic preview hosting.

## Current editor exercise

In Pages CMS, select Trident-CMS-Practice / main and open PRACTICE - PlayGym description. Saving edits src/content/playgym.json. The website reads that exact file. settings.content.merge remains true so the prices, timetable, policies and other fields are preserved.

The root-level pages.yml and playgym.json are earlier uploaded copies. They are retained, but the app uses only .pages.yml and src/content/playgym.json.

## Local preview

Use Node 24. In a normal standalone clone, run npm ci, npm run build, then npm run preview. Open http://127.0.0.1:4323/playgym. For development, npm run dev reads local content changes directly.

The prepared local clone uses a junction to the original checkout's installed packages for testing. Do not run npm install, npm ci, npm update, or dependency cleanup in that prepared clone while the junction is present. Build output and caches are isolated. A fresh clone has no junction and can use npm ci normally.

## Connect a separate test website

1. First push this prepared practice repository using a GitHub account with write access.
2. Create a NEW preview hosting project connected only to TridentGymnastics/Trident-CMS-Practice, branch main. Keep its default netlify.app or pages.dev address. Do not change the live project's repository connection, domains, DNS, environment variables, or credentials.
3. Build command: npm run build. Output directory: dist. Node: 24. Set PUPPETEER_SKIP_DOWNLOAD=true and ASTRO_TELEMETRY_DISABLED=1 in the preview build environment. Netlify reads these settings from this repository's preview-only netlify.toml.
4. Host usage must also be isolated from the live site. In a Netlify team using credit-based billing, exhausting the shared allowance can pause all projects. Use separate preview billing/quota, or a separate hosting service, after confirming the setup.
5. Verify the deployed /playgym page has the CMS PRACTICE banner, noindex headers and the saved description. This check must happen on the actual host; a successful local build does not prove the online connection.
6. Change one description in Pages CMS, save, wait for the practice deployment to succeed, and check the preview. Restore the text and verify a second deployment. Only then is the automatic editing flow proven.

## Safeguards and limits

- No original .github workflows, live Netlify configuration, production site IDs, environment files or credentials are included.
- Every generated page has noindex metadata. robots.txt disallows crawling, and public/_headers adds noindex and blocks form submissions on supported hosts. Noindex is not password protection.
- The careers form is replaced by disabled controls. Booking, phone, email, map and social links are still real links; this is a content and appearance exercise.
- Canonical URLs use the practice host. practice-origin.mjs rejects custom domains and, when provided by Netlify, a repository URL other than Trident-CMS-Practice.
- These build safeguards do not control hosting-account permissions. Do not import into or relink the existing live hosting project.
- The CMS currently exposes only the PlayGym description and paragraphs. Program-wide renaming, page visibility and layout controls need further implementation and testing.

## References

- Pages CMS editing: https://pagescms.org/docs/
- Netlify repository connection: https://docs.netlify.com/start/quickstarts/deploy-from-repository/
- Netlify shared usage: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/
- Cloudflare Pages build configuration: https://developers.cloudflare.com/pages/configuration/build-configuration/
