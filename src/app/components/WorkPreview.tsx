import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import type { Work } from '../data/profile';
import { chip, iconButton } from './styles';

// How long the mouse has to rest on a cover image before the preview opens.
export const PREVIEW_DELAY_MS = 3000;

const imageUrl = (work: Work) => `${import.meta.env.BASE_URL}${work.image!.src}`;

/**
 * Cover image that opens a larger preview after a 3-second hover, or straight away
 * on click / Enter (touch screens and keyboards have no hover).
 */
export function WorkCover({ work, onOpen }: { work: Work; onOpen: (work: Work, via: 'hover' | 'click') => void }) {
  const timer = useRef<number>();
  const [waiting, setWaiting] = useState(false);

  const cancel = () => {
    window.clearTimeout(timer.current);
    setWaiting(false);
  };
  useEffect(() => cancel, []);

  return (
    <button
      type="button"
      onClick={() => {
        cancel();
        onOpen(work, 'click');
      }}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        setWaiting(true);
        timer.current = window.setTimeout(() => {
          setWaiting(false);
          onOpen(work, 'hover');
        }, PREVIEW_DELAY_MS);
      }}
      onPointerLeave={cancel}
      className="group relative block -mt-2 mb-6 w-full overflow-hidden rounded-xl border border-border bg-muted cursor-zoom-in"
    >
      <img
        src={imageUrl(work)}
        alt={work.image!.alt}
        loading="lazy"
        decoding="async"
        width={1280}
        height={720}
        className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
      />
      <span className="sr-only">(open a larger preview)</span>
      {/* Fills up while the hover timer runs, so the wait doesn't feel like nothing is happening. */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-1 bg-primary origin-left ease-linear ${
          waiting ? 'scale-x-100 transition-transform' : 'scale-x-0'
        }`}
        style={waiting ? { transitionDuration: `${PREVIEW_DELAY_MS}ms` } : undefined}
      />
    </button>
  );
}

/** Modal quick view of a work: large cover image plus its details. */
export function WorkPreview({ work, via, onClose }: { work: Work | null; via: 'hover' | 'click'; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const entered = useRef(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el || !work) return;
    entered.current = false;
    el.showModal();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      if (el.open) el.close();
    };
  }, [work]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="work-preview-title"
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> itself, not on the panel inside it.
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      className="m-auto w-[min(64rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] p-0 bg-transparent text-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm open:animate-pop-in"
    >
      {work?.image && (
        <div
          // Opened by hovering: moving the mouse off the preview closes it again.
          onPointerEnter={() => (entered.current = true)}
          onPointerLeave={(e) => via === 'hover' && e.pointerType === 'mouse' && entered.current && dialog.current?.close()}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <img
            src={imageUrl(work)}
            alt={work.image.alt}
            width={1280}
            height={720}
            className="w-full max-h-[65dvh] object-contain bg-muted"
          />
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  {[work.category, work.year, work.inProgress ? 'In progress' : null].filter(Boolean).join(' · ')}
                </p>
                <h3 id="work-preview-title" className="mt-1 font-display text-2xl md:text-3xl font-semibold wrap-anywhere">
                  {work.title}
                </h3>
              </div>
              <button type="button" onClick={() => dialog.current?.close()} className={`${iconButton} shrink-0`} aria-label="Close preview">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 text-muted-foreground leading-relaxed">{work.summary}</p>
            {work.tags.length > 0 && (
              <ul aria-label="Tags" className="mt-5 flex flex-wrap gap-2">
                {work.tags.map((tag) => (
                  <li key={tag} className={chip}>
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {work.links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {work.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {link.label}
                    <ArrowUpRight size={14} aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
