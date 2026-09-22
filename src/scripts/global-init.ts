import { setupNavDropdown } from './nav-dropdown';
import { setupCtaAttention } from './cta-attn';
import { initHeaderScroll } from './header-scroll';
import { initMobileNav } from './mobile-nav';
import { initSkipLink } from './skip-link';

const bootstrapInteractions = () => {
  setupNavDropdown();
  setupCtaAttention();
  initHeaderScroll();
  initMobileNav();
  initSkipLink();
};

let pageLoadListenerAttached = false;

export function initGlobalInteractions() {
  bootstrapInteractions();

  if (typeof document !== 'undefined' && !pageLoadListenerAttached) {
    document.addEventListener('astro:page-load', bootstrapInteractions);
    pageLoadListenerAttached = true;
  }
}

if (typeof window !== 'undefined') {
  initGlobalInteractions();
}
