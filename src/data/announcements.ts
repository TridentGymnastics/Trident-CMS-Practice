// Single source of truth for the homepage "What's happening at Trident"
// announcements section. This is designed to change week on week:
//
//   • To post a new update, add a new object to the TOP of the `announcements`
//     array below (newest first — the section also sorts by `dateISO` to be safe).
//   • To retire an old update without deleting it, set `live: false`.
//   • To add photos, drop the originals in src/assets/images/announcements/
//     (see the README there), import them at the top of this file, and list them
//     in that announcement's `images` array. A worked example is commented below.
//
// House style: celebrate the gymnasts as a group — never name individuals.

// ── Photo imports ───────────────────────────────────────────────────────────
// Photos live in src/assets/images/announcements/ (see that folder's README) so
// Astro emits optimised, responsive WebP/AVIF and the full-size original never ships.
import agcComp1 from '../assets/images/announcements/agc-comp-1.jpg';
import agcComp2 from '../assets/images/announcements/agc-comp-2.jpg';

export interface AnnouncementImage {
  /** Imported from src/assets so Astro emits optimised, responsive WebP/AVIF. */
  src: ImageMetadata;
  /** Describe the moment, not the people — never a gymnast's name. */
  alt: string;
}

export interface Announcement {
  /** Stable, unique slug — used as a render key. */
  id: string;
  /** Human-friendly date shown on the card, e.g. "July 2026". */
  date: string;
  /** ISO date (YYYY-MM-DD) — used only to sort newest-first. */
  dateISO: string;
  /** Small pill above the title, e.g. "Squad News", "Competition". */
  tag?: string;
  title: string;
  /** One paragraph per array item. */
  body: string[];
  /** Optional photos (0–4 looks best). */
  images?: AnnouncementImage[];
  /** Set false to hide without deleting. Defaults to shown. */
  live?: boolean;
}

export const announcements: Announcement[] = [
  {
    id: 'agc-first-comp-2026',
    date: 'July 2026',
    dateISO: '2026-07-19',
    tag: 'Squad News',
    title: 'We could not be prouder of our squad! 💙💛',
    body: [
      'Our Trident Development Squad took on their very first AGC competition of the season — and the smiles said it all. Big routines, big nerves, and even bigger cheers for each other all day long.',
      "Watching them walk out beaming (with a 2nd overall finish to boot!) made us so proud of every single one of them. Huge congratulations, team — the best of luck for the rest of the season. Go Trident!",
    ],
    images: [
      { src: agcComp1, alt: 'Trident squad gymnasts celebrating together with their medals and ribbons' },
      { src: agcComp2, alt: 'Trident squad gymnasts with their coach after the AGC competition' },
    ],
    live: true,
  },
];
