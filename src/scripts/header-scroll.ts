/**
 * Header Scroll Controller
 *
 * Adds a scrolled state and controls the header reveal.
 * The fixed header hides while scrolling down and returns after a
 * deliberate upward scroll so the hamburger is reachable from anywhere.
 *
 * Reveal is intent-based: we accumulate distance in the current scroll
 * direction and reset the tally when direction flips, so a stray upward
 * jitter (e.g. momentum settling at the end of a downward flick) can't
 * pop the header in.
 */

let currentCleanup: (() => void) | null = null;

export function initHeaderScroll() {
  const siteHeader = document.getElementById('site-header');
  const header = document.getElementById('site-nav-shell');
  const root = document.documentElement;
  const primaryNav = document.querySelector<HTMLElement>('.primary-nav');

  if (!siteHeader || !header) {
    console.warn('Header scroll: required header elements not found');
    return;
  }

  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  let ticking = false;
  let hasScrolled = header.classList.contains('has-scrolled');
  let isHidden = siteHeader.classList.contains('is-hidden');
  let lastScrollY = Math.max(window.scrollY, 0);
  let headerHeight = 0;
  let touchStartY = 0;
  const shadowAt = 8;
  const directionThreshold = 6; // px of movement before we trust a hide / touch direction
  const revealThreshold = 120; // px of *sustained* upward scroll before revealing — above one wheel notch so casual up-scrolls don't pop it in (tune to taste)
  let scrollIntent = 0; // accumulated directional distance: >0 downward, <0 upward

  function menuIsOpen() {
    return primaryNav?.classList.contains('show') ?? false;
  }

  function setHeaderHeight() {
    headerHeight = Math.ceil(siteHeader.getBoundingClientRect().height);
    root.style.setProperty('--site-header-height', `${headerHeight}px`);
  }

  function setHidden(nextHidden: boolean) {
    if (nextHidden === isHidden) {
      return;
    }

    siteHeader.classList.toggle('is-hidden', nextHidden);
    isHidden = nextHidden;
  }

  function revealHeader() {
    setHidden(false);
  }

  function update() {
    ticking = false;
    const currentScrollY = Math.max(window.scrollY, 0);
    const shouldShowShadow = currentScrollY > shadowAt;

    if (shouldShowShadow !== hasScrolled) {
      header.classList.toggle('has-scrolled', shouldShowShadow);
      siteHeader.classList.toggle('has-scrolled', shouldShowShadow);
      hasScrolled = shouldShowShadow;
    }

    if (menuIsOpen() || currentScrollY <= shadowAt) {
      revealHeader();
      scrollIntent = 0;
      lastScrollY = currentScrollY;
      return;
    }

    const scrollDelta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
    if (scrollDelta === 0) {
      return;
    }

    // Reversing direction resets the tally, so an upward jitter at the tail of
    // a downward flick (or momentum settling) can't instantly reveal.
    if ((scrollDelta > 0) !== (scrollIntent > 0)) {
      scrollIntent = 0;
    }
    scrollIntent += scrollDelta;

    const pastHeader = currentScrollY > Math.max(headerHeight, 72);
    if (scrollIntent >= directionThreshold && pastHeader) {
      setHidden(true);
    } else if (scrollIntent <= -revealThreshold) {
      setHidden(false);
    }
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  function onTouchStart(event: TouchEvent) {
    touchStartY = event.touches[0]?.clientY ?? 0;
  }

  function onTouchMove(event: TouchEvent) {
    const currentTouchY = event.touches[0]?.clientY ?? touchStartY;
    if (currentTouchY > touchStartY + directionThreshold) {
      revealHeader();
    }
  }

  function onLayoutChange() {
    setHeaderHeight();
    revealHeader();
    lastScrollY = Math.max(window.scrollY, 0);
    update();
  }

  const resizeObserver = new ResizeObserver(setHeaderHeight);
  resizeObserver.observe(siteHeader);

  setHeaderHeight();
  update();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('resize', onLayoutChange);
  window.addEventListener('orientationchange', onLayoutChange);

  currentCleanup = () => {
    resizeObserver.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('resize', onLayoutChange);
    window.removeEventListener('orientationchange', onLayoutChange);
    root.style.removeProperty('--site-header-height');
    currentCleanup = null;
  };
}
