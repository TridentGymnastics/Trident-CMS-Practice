import confetti from 'canvas-confetti';

// Brand-coloured confetti bursts, shared by the class-selector celebration and
// the in-house comp page. Each burst renders on its own throwaway canvas so it
// always lands above modals and never blocks pointer events.

const BRAND_COLORS = ['#ffd338', '#ffe792', '#ffb700', '#1573c2', '#4cc6ff', '#ffffff'];

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createOverlayCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '2147483647',
  });
  document.body.appendChild(canvas);
  return canvas;
}

export function firePartyPopper() {
  if (prefersReducedMotion()) return;

  const canvas = createOverlayCanvas();
  const fire = confetti.create(canvas, { resize: true, useWorker: false });

  // Party popper pattern: fire from screen edges at shallow angles so particles
  // arc across the full viewport and fall down in front of any modal.
  // In canvas-confetti: 0° = right, 90° = up, 180° = left, 270° = down.
  // 60° fires up-right (left cannon), 120° fires up-left (right cannon).
  const shot = (angle: number, x: number, count: number) =>
    fire({ particleCount: count, angle, spread: 52, origin: { x, y: 0.48 },
           colors: BRAND_COLORS, startVelocity: 58, gravity: 0.88, scalar: 1.1, ticks: 320 });

  // Wave 1
  shot(60, 0.08, 90);
  shot(120, 0.92, 90);
  // Wave 2
  setTimeout(() => { shot(65, 0.14, 60); shot(115, 0.86, 60); }, 190);
  // Wave 3 — trailing burst
  setTimeout(() => { shot(55, 0.05, 45); shot(125, 0.95, 45); }, 360);

  if (navigator.vibrate) navigator.vibrate([80, 40, 120]);
  setTimeout(() => canvas.remove(), 7000);
}

// Small single burst for playful repeat interactions (e.g. tapping the
// countdown) — cheap enough to fire often without wearing out its welcome.
// Deliberately NOT gated on prefers-reduced-motion: it only ever runs from an
// explicit user action asking for the effect (motion-on-request), unlike the
// automatic party popper above.
export function miniBurst(origin: { x: number; y: number } = { x: 0.5, y: 0.55 }) {
  const canvas = createOverlayCanvas();
  const fire = confetti.create(canvas, { resize: true, useWorker: false });

  fire({ particleCount: 40, angle: 90, spread: 70, origin,
         colors: BRAND_COLORS, startVelocity: 42, gravity: 0.9, scalar: 0.95, ticks: 220 });

  setTimeout(() => canvas.remove(), 4000);
}
