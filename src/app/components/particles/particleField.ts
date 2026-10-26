import { onThemeChange, themeColor } from '../../theme';

const AREA_PER_PARTICLE = 24000; // CSS px² of viewport per particle
const MIN_PARTICLES = 18;
const MAX_PARTICLES = 70;
const ACCENT_SHARE = 0.2; // fraction drawn in amber instead of purple
const RISE_SPEED = 0.012; // CSS px per millisecond for the nearest particles
const SCROLL_PARALLAX = 0.25; // how much the nearest particles move with page scroll

interface Particle {
  x: number;
  y: number;
  depth: number; // 0.3 (far) to 1 (near): scales size, speed, opacity and parallax
  drift: number; // horizontal sway amplitude in CSS px
  phase: number;
  accent: boolean;
}

/** Starts the full-page particle field in `canvas`; returns a cleanup function. */
export function startParticles(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  const ctx: CanvasRenderingContext2D = context;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let colors = { primary: themeColor('primary'), accent: themeColor('accent') };
  let particles: Particle[] = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let lastTime = performance.now();
  let lastScroll = window.scrollY;

  const spawn = (y = Math.random() * height): Particle => ({
    x: Math.random() * width,
    y,
    depth: 0.3 + Math.random() * 0.7,
    drift: 4 + Math.random() * 12,
    phase: Math.random() * Math.PI * 2,
    accent: Math.random() < ACCENT_SHARE,
  });

  const resize = () => {
    const prevWidth = width || window.innerWidth;
    const prevHeight = height || window.innerHeight;
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Keep existing particles in proportion, then add or drop to match the new area.
    for (const p of particles) {
      p.x *= width / prevWidth;
      p.y *= height / prevHeight;
    }
    const target = Math.round(Math.min(MAX_PARTICLES, Math.max(MIN_PARTICLES, (width * height) / AREA_PER_PARTICLE)));
    while (particles.length < target) particles.push(spawn());
    particles.length = target;
    draw(lastTime);
  };

  function draw(time: number) {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      const sway = reducedMotion.matches ? 0 : Math.sin(time / 3000 + p.phase) * p.drift;
      const twinkle = reducedMotion.matches ? 1 : 0.7 + 0.3 * Math.sin(time / 1700 + p.phase * 3);
      ctx.globalAlpha = (0.12 + 0.33 * p.depth) * twinkle;
      ctx.fillStyle = p.accent ? colors.accent : colors.primary;
      ctx.beginPath();
      ctx.arc(p.x + sway, p.y, 0.6 + 1.6 * p.depth, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Wrap particles that leave the top or bottom back in from the other side,
  // keeping their overshoot so a long scroll doesn't line them up along one edge.
  const wrap = (p: Particle) => {
    if (p.y >= -10 && p.y <= height + 10) return;
    const span = height + 20;
    p.y = ((((p.y + 10) % span) + span) % span) - 10;
    p.x = Math.random() * width;
  };

  const tick = (time: number) => {
    const dt = Math.min(time - lastTime, 50); // no jump after the tab was hidden
    lastTime = time;
    for (const p of particles) {
      p.y -= RISE_SPEED * p.depth * dt;
      wrap(p);
    }
    draw(time);
    frame = requestAnimationFrame(tick);
  };

  // Nearer particles move further with the page, which reads as depth.
  const onScroll = () => {
    const delta = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    if (reducedMotion.matches) return;
    for (const p of particles) {
      p.y -= delta * SCROLL_PARALLAX * p.depth;
      wrap(p);
    }
    if (!frame) draw(lastTime);
  };

  // With reduced motion there is no loop; the field is drawn once and stays still.
  const start = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (reducedMotion.matches) draw(lastTime);
    else frame = requestAnimationFrame(tick);
  };

  const stopThemeWatch = onThemeChange(() => {
    colors = { primary: themeColor('primary'), accent: themeColor('accent') };
    if (!frame) draw(lastTime);
  });
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', onScroll, { passive: true });
  reducedMotion.addEventListener('change', start);
  resize();
  start();

  return () => {
    cancelAnimationFrame(frame);
    stopThemeWatch();
    window.removeEventListener('resize', resize);
    window.removeEventListener('scroll', onScroll);
    reducedMotion.removeEventListener('change', start);
  };
}
