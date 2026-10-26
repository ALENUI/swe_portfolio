import { useEffect, useRef, useState } from 'react';

/**
 * Decorative particle field behind the whole page. Must be rendered inside an
 * `isolate` container so its negative z-index sits above the page background
 * but below the content. Loaded after the page is interactive.
 */
export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    import('./particleField').then(({ startParticles }) => {
      if (cancelled || !canvasRef.current) return;
      stop = startParticles(canvasRef.current);
      setReady(true);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 -z-10 w-full h-full pointer-events-none transition-opacity duration-1000 ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
