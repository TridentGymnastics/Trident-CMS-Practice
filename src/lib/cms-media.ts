import type { ImageMetadata } from 'astro';

// Pages CMS stores repository asset paths. Selected photos still go through
// the existing responsive Astro Image components.
const images = import.meta.glob<ImageMetadata>('/src/assets/images/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
  import: 'default',
});

export function cmsImage(source: string): ImageMetadata {
  const image = images[source];
  if (!image) throw new Error(`CMS image not found: ${source}. Select an image from the Program and news photos library.`);
  return image;
}

export interface CmsMedia {
  heading?: string;
  subtitle?: string;
  columns?: number;
  maxWidth?: string;
  photos?: Array<{ src: string; alt: string; position?: string }>;
  video?: { enabled?: boolean; src?: string; poster?: string; title?: string; autoplay?: boolean };
}

export function resolveProgramMedia(media?: CmsMedia) {
  if (!media) return undefined;
  const video = media.video;
  const resolvedVideo = video?.enabled && video.src && video.poster && video.title
    ? { ...video, src: video.src, poster: cmsImage(video.poster), title: video.title }
    : undefined;
  return {
    ...media,
    heading: media.heading?.trim() || undefined,
    columns: media.columns ?? undefined,
    maxWidth: media.maxWidth || undefined,
    photos: (media.photos ?? []).map(photo => ({ ...photo, src: cmsImage(photo.src) })),
    video: resolvedVideo,
  };
}
