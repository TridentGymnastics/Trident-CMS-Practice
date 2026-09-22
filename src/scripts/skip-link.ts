/**
 * Skip link focus handling.
 *
 * `tabindex="-1"` on the target plus a fragment href is the standard pattern,
 * but browsers disagree about whether activating the link actually moves focus
 * as well as scrolling — Safari historically scrolls without focusing, which
 * leaves the keyboard user exactly where they started. Moving focus explicitly
 * makes the behaviour the same everywhere.
 */
let cleanup: (() => void) | null = null;

export function initSkipLink() {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }

  const link = document.querySelector<HTMLAnchorElement>('.skip-link');
  if (!link) return;

  const handleActivate = (event: Event) => {
    const id = link.getAttribute('href')?.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  };

  link.addEventListener('click', handleActivate);
  cleanup = () => {
    link.removeEventListener('click', handleActivate);
    cleanup = null;
  };
}
