/**
 * Eased scrolling for in-page links (#about, #contact...). CSS `scroll-behavior`
 * can't set a duration or curve, and it's all-or-nothing under reduced motion;
 * this gives a calm, distance-based glide, and a short one when motion is reduced.
 */
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// Longer trips take a little longer, within limits, so short and long jumps both feel natural.
const durationFor = (distance: number) =>
  reducedMotion() ? 400 : Math.min(1100, Math.max(450, 300 + distance * 0.3));

let frame = 0;

function scrollToY(target: number) {
  cancelAnimationFrame(frame);
  const start = window.scrollY;
  const distance = target - start;
  if (Math.abs(distance) < 2) return;
  const duration = durationFor(Math.abs(distance));
  const began = performance.now();

  const step = (now: number) => {
    const t = Math.min(1, (now - began) / duration);
    window.scrollTo({ top: start + distance * easeInOutCubic(t), behavior: 'instant' });
    if (t < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
}

function onClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = (e.target as Element).closest?.('a[href^="#"]');
  const hash = link?.getAttribute('href');
  if (!hash || hash === '#') return;
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return;

  e.preventDefault();
  const offset = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  scrollToY(hash === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - offset);
  if (location.hash !== hash) history.pushState(null, '', hash);

  // Move keyboard focus along with the view (e.g. "Skip to content").
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

// The user taking over (wheel, touch, keys) stops the glide instead of fighting it.
const stop = () => cancelAnimationFrame(frame);

export function enableSmoothScroll() {
  document.addEventListener('click', onClick);
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', stop);
  return () => {
    stop();
    document.removeEventListener('click', onClick);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('keydown', stop);
  };
}
