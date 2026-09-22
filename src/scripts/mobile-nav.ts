let mobileNavCleanup: (() => void) | null = null;

export function initMobileNav() {
  // Remove any previous listeners before re-initializing (e.g., astro:page-load)
  if (mobileNavCleanup) {
    mobileNavCleanup();
    mobileNavCleanup = null;
  }

  const mobileToggle = document.querySelector<HTMLButtonElement>('.mobile-toggle');
  const primaryNav = document.querySelector<HTMLElement>('.primary-nav');

  if (!mobileToggle || !primaryNav) {
    return;
  }

  // The floating contact button is fixed at z-index 9999, above the header, so
  // with the menu open its toggle covered the lower nav items on short phones.
  // The body class lets the stylesheet take it out of the way while the menu is
  // up; the menu offers its own route to Contact.
  const closeMenu = () => {
    mobileToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('show');
    document.body.classList.remove('mobile-nav-open');
  };

  const openMenu = () => {
    mobileToggle.setAttribute('aria-expanded', 'true');
    primaryNav.classList.add('show');
    document.body.classList.add('mobile-nav-open');
  };

  const handleToggle = () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleOutsideClick = (event: Event) => {
    const target = event.target as Node;
    if (!mobileToggle.contains(target) && !primaryNav.contains(target)) {
      closeMenu();
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    // Only act when this menu is actually open. Unguarded, every Escape on the
    // page pulled focus to the hamburger — including Escape meant for another
    // widget, such as the floating contact menu.
    if (event.key === 'Escape' && mobileToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      mobileToggle.focus();
    }
  };

  const breakpoint = window.matchMedia('(min-width: 992px)');
  const handleBreakpointChange = () => {
    if (breakpoint.matches) {
      closeMenu();
    }
  };

  // Reset to a known closed state every time Astro re-initializes the shared header.
  closeMenu();

  mobileToggle.addEventListener('click', handleToggle);
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleEscape);
  breakpoint.addEventListener('change', handleBreakpointChange);

  mobileNavCleanup = () => {
    mobileToggle.removeEventListener('click', handleToggle);
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleEscape);
    breakpoint.removeEventListener('change', handleBreakpointChange);
    mobileNavCleanup = null;
  };
}
