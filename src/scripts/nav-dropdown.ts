let dropdownOutsideClickHandler: ((event: MouseEvent) => void) | null = null;

export function setupNavDropdown() {

  // Dropdown functionality
  const dropdowns = document.querySelectorAll<HTMLElement>('.has-dropdown');

  dropdowns.forEach((item) => {
    const trigger = item.querySelector<HTMLAnchorElement>('.tab');
    const dropdown = item.querySelector<HTMLElement>('.dropdown');

    if (!trigger || !dropdown) return;

    let hideTimer: number | null = null;

    const open = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      // Close other dropdowns
      dropdowns.forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          const otherTrigger = other.querySelector<HTMLAnchorElement>('.tab');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      hideTimer = window.setTimeout(() => {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }, 120);
    };

    // Desktop hover behavior (not on mobile)
    const mediaQuery = window.matchMedia('(min-width: 992px)');

    const attachHoverListeners = () => {
      if (mediaQuery.matches) {
        item.addEventListener('mouseenter', open);
        item.addEventListener('mouseleave', close);
      }
    };

    attachHoverListeners();
    mediaQuery.addEventListener('change', attachHoverListeners);

    // Click/touch toggle for mobile
    trigger.addEventListener('click', (e) => {
      if (trigger.hasAttribute('aria-haspopup')) {
        // On desktop: allow navigation, hover handles dropdown
        // On mobile: prevent default and toggle dropdown
        if (!mediaQuery.matches) {
          e.preventDefault();
          if (item.classList.contains('open')) {
            item.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
          } else {
            open();
          }
        }
        // On desktop, let the link navigate normally
      }
    });

    // Keyboard support
    trigger.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        open();
        const firstItem = dropdown.querySelector<HTMLAnchorElement>('a');
        if (firstItem) {
          setTimeout(() => firstItem.focus(), 50);
        }
      }
    });

    // Escape key in dropdown
    dropdown.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });

    // Arrow navigation within dropdown items
    const items = Array.from(dropdown.querySelectorAll<HTMLAnchorElement>('a'));
    items.forEach((link, index) => {
      link.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextItem = items[index + 1];
          if (nextItem) nextItem.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevItem = items[index - 1];
          if (prevItem) {
            prevItem.focus();
          } else {
            trigger.focus();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          item.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
    });
  });

  // Close dropdowns when clicking outside
  if (dropdownOutsideClickHandler) {
    document.removeEventListener('click', dropdownOutsideClickHandler);
  }

  dropdownOutsideClickHandler = (event: MouseEvent) => {
    const target = event.target as Node;
    dropdowns.forEach((item) => {
      if (!item.contains(target)) {
        item.classList.remove('open');
        const trigger = item.querySelector<HTMLAnchorElement>('.tab');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  };

  document.addEventListener('click', dropdownOutsideClickHandler);
}
