# Announcement photos (homepage "What's happening at Trident")

Photos for the homepage announcements section live here — **not** in `public/`.

Files in this folder are processed by Astro + sharp at build time (AVIF/WebP at
multiple widths with a `srcset`), so a phone downloads a ~400–800px image instead
of the full-size original. Files served from `public/` skip all of that and ship
full size to every device — which also means the full-res original stays on the
server and is never handed to the browser (our "no-download" rule for photos).

## How to add photos to an announcement

1. Drop the **highest-quality originals** in here (up to ~2400px wide). Do **not**
   pre-compress — Astro handles resizing/compression. Oversized originals are fine;
   they never ship.
2. Name them per announcement, e.g. `agc-comp-1.jpg`, `agc-comp-2.jpg`.
3. In `src/data/announcements.ts`, import each file at the top and add it to that
   announcement's `images` array with descriptive `alt` text. There's a worked,
   commented-out example in that file for the first announcement — just uncomment
   the two imports and the two `images` entries once the files are here.

Alt text describes the moment (e.g. "Trident squad gymnasts celebrating with their
medals"), never a name — we don't identify individual gymnasts.
