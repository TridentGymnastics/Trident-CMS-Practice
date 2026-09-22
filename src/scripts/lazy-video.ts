/**
 * Lazy Video Loading Script
 *
 * Purpose: Defer video loading until they're needed to reduce initial page weight
 * Impact: Saves 13MB+ on initial homepage load by only loading videos when carousel slides are active
 *
 * Usage: Add data-lazy-video="/path/to/video.mp4" attribute to <video> elements
 */

export function initLazyVideos() {
  const lazyVideos = document.querySelectorAll<HTMLVideoElement>('[data-lazy-video]');

  if (lazyVideos.length === 0) {
    return; // No lazy videos on this page
  }

  // Check for IntersectionObserver support
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target as HTMLVideoElement;
          const source = video.dataset.lazyVideo;

          if (source && !video.src) {
            // Load the video source
            video.src = source;
            video.load();

            // Auto-play when in view (muted videos are allowed)
            video.play().catch(err => {
              // Autoplay might fail on some browsers
              console.warn('Video autoplay prevented:', err.message);
            });

            // Stop observing this video
            videoObserver.unobserve(video);
          }
        }
      });
    }, {
      rootMargin: '100px',  // Start loading 100px before video enters viewport
      threshold: 0.25        // Load when 25% of video is visible
    });

    // Observe all lazy videos
    lazyVideos.forEach(video => videoObserver.observe(video));
  } else {
    // Fallback for older browsers without IntersectionObserver
    // Load videos immediately (graceful degradation)
    lazyVideos.forEach(video => {
      const source = video.dataset.lazyVideo;
      if (source) {
        video.src = source;
        video.load();
      }
    });
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLazyVideos);
} else {
  initLazyVideos();
}

// Reinitialize on Astro page transitions (for SPA-like navigation)
document.addEventListener('astro:page-load', initLazyVideos);
