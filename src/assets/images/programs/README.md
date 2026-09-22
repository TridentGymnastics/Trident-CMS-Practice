# Program page media (Preschool / UrbanGym / EduGym)

Photos for the program pages live here — **not** in `public/`.

Files in this folder are processed by Astro + sharp at build time, which emits AVIF/WebP
at multiple widths with a `srcset`. A phone then downloads a ~400–800px image instead of
the full-size original. Files served from `public/` skip all of that and ship full size to
every device — which matters here, because ~70% of our members are on mobile.

## Layout

```
src/assets/images/programs/
  preschool/     photos + video posters for /preschool/
  urbangym/      photos + video posters for /urbangym/
  edugym/        photos + video posters for /edugym/
```

Videos are **not** processed by Astro and stay in `public/` (see below).

## Photos

- Drop in the **highest-quality original** (up to ~2400px wide). Do not pre-compress —
  Astro handles resizing/compression. Oversized originals are fine; they never ship.
- Naming: `<subject>-<n>.jpg` — e.g. `class-warmup-1.jpg`, `beam-2.jpg`.
- Rendered via `<Image />` with `widths` + `sizes`, `loading="lazy"`, `decoding="async"`.

## Video posters

- Every video needs a poster so mobile users see an image instantly and **zero video bytes
  download until they tap play**.
- Put the poster image here (same rules as photos) and the `.mp4` in `public/`.

## Videos (in `public/`, not here)

Encode to **H.264 (`libx264`)** — universal playback including Android Chrome.

> ⚠️ `MEDIA-OPTIMIZATION.md` currently prescribes `libx265` (H.265/HEVC). Don't follow that
> for new video: HEVC fails to decode on most Android Chrome. The videos actually shipping
> today are H.264, which is correct — the doc is out of step with the files.

```
ffmpeg -i input.mp4 -c:v libx264 -crf 26 -preset medium -vf "scale='min(1280,iw)':-2" \
  -c:a aac -b:a 96k -movflags +faststart output.mp4
```

Targets: **< 2MB**, `+faststart` (progressive playback), 1280px max width.

## Checklist before committing media

- [ ] Photo original in the right program folder, sensible name
- [ ] Video is H.264, < 2MB, `+faststart`
- [ ] Every video has a poster
- [ ] Alt text written for each photo (describes the activity, not "photo of kids")
