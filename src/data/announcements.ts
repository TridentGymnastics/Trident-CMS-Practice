import type { ImageMetadata } from 'astro';
import content from '../content/announcements.json';
import { cmsImage } from '../lib/cms-media';

export interface AnnouncementImage { src: ImageMetadata; alt: string; }
export interface Announcement {
  id: string; date: string; dateISO: string; tag?: string;
  title: string; body: string[]; images?: AnnouncementImage[]; live?: boolean;
}

// Pages CMS edits this JSON; resolve uploaded photos through Astro optimisation.
export const announcements: Announcement[] = content.items.map(item => ({
  ...item,
  images: (item.images ?? []).map(image => ({ ...image, src: cmsImage(image.src) })),
}));
