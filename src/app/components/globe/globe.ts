import { onThemeChange, themeColor } from '../../theme';
import { LAND_BITS, ROW_COUNTS, STEP } from './land';

const DEG = Math.PI / 180;
const HOME = { lat: 5.9631 * DEG, lon: 10.1591 * DEG, label: 'Bamenda' };
const REST_PITCH = 18 * DEG; // tilt the north pole slightly toward the viewer
const PITCH_LIMIT = 50 * DEG;
const AUTO_SPEED = (3 * DEG) / 1000; // radians per millisecond (3° per second)
// Visitors who ask for reduced motion still see a gentle spin, without fling or spring-back.
const CALM_SPEED = (1 * DEG) / 1000;
const DRAG_SPEED = 0.006; // radians per CSS pixel dragged
const DEPTH_BUCKETS = 6;

/** Unit vectors (x, y, z) for every land sample; +z faces the viewer at yaw 0. */
function landPoints() {
  const bytes = Uint8Array.from(atob(LAND_BITS), (c) => c.charCodeAt(0));
  const points: number[] = [];
  let k = 0;
  ROW_COUNTS.forEach((count, row) => {
    const lat = (-90 + STEP * (row + 0.5)) * DEG;
    for (let j = 0; j < count; j++, k++) {
      if (!(bytes[k >> 3] & (1 << (k & 7)))) continue;
      const lon = (-180 + (360 * (j + 0.5)) / count) * DEG;
      points.push(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon));
    }
  });
  return new Float32Array(points);
}

const readColors = () => ({ dots: themeColor('primary'), marker: themeColor('accent'), label: themeColor('muted-foreground') });

/** Starts rendering the globe into `canvas`; returns a cleanup function. */
export function startGlobe(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  const ctx: CanvasRenderingContext2D = context;

  const points = landPoints();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const buckets: number[][] = Array.from({ length: DEPTH_BUCKETS }, () => []);
  let colors = readColors();

  let yaw = HOME.lon; // start with Bamenda facing the viewer
  let pitch = REST_PITCH;
  let velocity = 0; // yaw radians per millisecond, from drag inertia
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastMoveTime = 0;

  let width = 0;
  let dpr = 1;
  let frame = 0;
  let visible = true;
  let lastTime = performance.now();

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw(lastTime);
  };

  function draw(time: number) {
    const size = Math.min(canvas.width, canvas.height);
    const radius = size * 0.46;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dot = Math.max(1, radius * 0.0065);
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);
    const sinPitch = Math.sin(pitch);
    const cosPitch = Math.cos(pitch);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Faint outline so the sphere reads even where it is mostly ocean.
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = colors.dots;
    ctx.lineWidth = dpr;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    for (const bucket of buckets) bucket.length = 0;
    for (let i = 0; i < points.length; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];
      const x1 = x * cosYaw - z * sinYaw;
      const z1 = x * sinYaw + z * cosYaw;
      const y2 = y * cosPitch - z1 * sinPitch;
      const z2 = y * sinPitch + z1 * cosPitch;
      if (z2 <= 0) continue; // back hemisphere
      const b = Math.min(DEPTH_BUCKETS - 1, Math.floor(z2 * DEPTH_BUCKETS));
      buckets[b].push(cx + x1 * radius, cy - y2 * radius);
    }

    // One path per depth bucket keeps fillStyle/alpha changes to a minimum.
    ctx.fillStyle = colors.dots;
    buckets.forEach((coords, b) => {
      if (coords.length === 0) return;
      const depth = (b + 0.5) / DEPTH_BUCKETS;
      const r = dot * (0.55 + 0.45 * depth);
      ctx.globalAlpha = 0.15 + 0.7 * depth;
      ctx.beginPath();
      for (let i = 0; i < coords.length; i += 2) {
        ctx.moveTo(coords[i] + r, coords[i + 1]);
        ctx.arc(coords[i], coords[i + 1], r, 0, Math.PI * 2);
      }
      ctx.fill();
    });

    // Home marker
    const hx = Math.cos(HOME.lat) * Math.sin(HOME.lon);
    const hy = Math.sin(HOME.lat);
    const hz = Math.cos(HOME.lat) * Math.cos(HOME.lon);
    const hx1 = hx * cosYaw - hz * sinYaw;
    const hz1 = hx * sinYaw + hz * cosYaw;
    const hy2 = hy * cosPitch - hz1 * sinPitch;
    const hz2 = hy * sinPitch + hz1 * cosPitch;
    if (hz2 > 0) {
      const mx = cx + hx1 * radius;
      const my = cy - hy2 * radius;
      const fade = Math.min(1, hz2 * 3); // fade out near the edge of the globe
      const pulse = reducedMotion.matches ? 0.5 : (time % 2400) / 2400;

      ctx.strokeStyle = colors.marker;
      ctx.lineWidth = 1.5 * dpr;
      ctx.globalAlpha = fade * (1 - pulse) * 0.9;
      ctx.beginPath();
      ctx.arc(mx, my, dot * 2.5 + pulse * 14 * dpr, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = fade;
      ctx.fillStyle = colors.marker;
      ctx.beginPath();
      ctx.arc(mx, my, dot * 2.5, 0, Math.PI * 2);
      ctx.fill();

      if (width >= 360) {
        ctx.globalAlpha = fade;
        ctx.fillStyle = colors.label;
        ctx.font = `500 ${12 * dpr}px "Plus Jakarta Sans", system-ui, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText(HOME.label, mx + dot * 2.5 + 8 * dpr, my);
      }
    }
    ctx.globalAlpha = 1;
  }

  const tick = (time: number) => {
    const dt = Math.min(time - lastTime, 50); // avoid jumps after the tab was hidden
    lastTime = time;
    if (!dragging) {
      const calm = reducedMotion.matches;
      yaw += (velocity - (calm ? CALM_SPEED : AUTO_SPEED)) * dt; // Earth turns west to east
      velocity = calm ? 0 : velocity * Math.exp(-dt / 500);
      if (!calm) pitch += (REST_PITCH - pitch) * (1 - Math.exp(-dt / 1500));
    }
    draw(time);
    frame = visible ? requestAnimationFrame(tick) : 0;
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true;
    velocity = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    lastMoveTime = e.timeStamp;
    canvas.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = Math.max(1, e.timeStamp - lastMoveTime);
    yaw -= dx * DRAG_SPEED;
    velocity = (-dx * DRAG_SPEED) / dt;
    // Touch only rotates horizontally; vertical swipes stay as page scrolling.
    if (e.pointerType !== 'touch') pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch + dy * DRAG_SPEED));
    lastX = e.clientX;
    lastY = e.clientY;
    lastMoveTime = e.timeStamp;
    if (!frame) draw(performance.now());
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    // A pause before release means the user stopped the globe: no fling.
    if (e.timeStamp - lastMoveTime > 80) velocity = 0;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };

  const start = () => {
    if (frame || !visible) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  };
  let stopped = false;

  // Stop animating while the hero is scrolled out of view.
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  });
  const resizeObserver = new ResizeObserver(resize);
  const stopThemeWatch = onThemeChange(() => {
    colors = readColors();
    if (!frame) draw(lastTime);
  });

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  intersection.observe(canvas);
  resizeObserver.observe(canvas);
  resize();
  start();
  // Redraw once the label font has loaded.
  document.fonts?.ready.then(() => !stopped && draw(lastTime));

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    intersection.disconnect();
    resizeObserver.disconnect();
    stopThemeWatch();
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerUp);
  };
}
