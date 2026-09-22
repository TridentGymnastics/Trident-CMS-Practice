export function setupCtaAttention() {
  // Prevent double init (e.g., Vite HMR)
  if ((window as any).__ctaAttnInit) return;
  (window as any).__ctaAttnInit = true;

  const ctas = Array.from(document.querySelectorAll('.cta-trial'));
  if (!ctas.length) return;

  // Respect reduced motion users
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let engaged = false; // any interaction stops attention globally

  const stopAll = () => {
    engaged = true;
    ctas.forEach((el) => el.removeAttribute('data-attn'));
  };

  // Stop all pulses when user interacts with any CTA
  ['pointerenter', 'focusin', 'click', 'touchstart'].forEach((evt) => {
    document.addEventListener(
      evt,
      (e) => {
        if (e.target instanceof Element && e.target.closest('.cta-trial')) {
          stopAll();
        }
      },
      { capture: true, passive: true }
    );
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (engaged || el.dataset.attnDone) return;

        // Start only when comfortably visible (prevents fold jitter)
        if (entry.isIntersecting) {
          el.dataset.attnDone = '1'; // mark handled forever
          let count = 0;

          const pulseOnce = () => {
            if (engaged || count >= 3) return; // max 3 soft pulses
            el.setAttribute('data-attn', 'true');
            setTimeout(() => el.removeAttribute('data-attn'), 1300);
            count++;
            if (count < 3) setTimeout(pulseOnce, 7000); // gentle spacing
          };

          pulseOnce();
          io.unobserve(el); // detach after first visibility
        }
      });
    },
    {
      threshold: 0.75, // require 75% of the CTA to be visible
      rootMargin: '0px 0px -15% 0px', // buffer bottom edge to avoid thrash
    }
  );

  ctas.forEach((el) => io.observe(el));
}
