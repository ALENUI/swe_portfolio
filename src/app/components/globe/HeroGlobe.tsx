import { useEffect, useRef, useState } from 'react';

/**
 * Decorative, draggable dot globe marking Bamenda. The renderer and land data
 * are loaded after the page is interactive, so they never delay first paint.
 */
export function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    import('./globe').then(({ startGlobe }) => {
      if (cancelled || !canvasRef.current) return;
      stop = startGlobe(canvasRef.current);
      setReady(true);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none md:pointer-events-auto -right-28 top-2 w-80 h-80 opacity-50 md:opacity-60 lg:opacity-100 md:right-auto md:left-[55%] md:top-1/2 md:-translate-y-1/2 md:w-[min(560px,55vw)] md:h-[min(560px,55vw)]"
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full touch-pan-y cursor-grab active:cursor-grabbing transition-opacity duration-1000 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
