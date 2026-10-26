import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { profile, type WorkCategory } from '../data/profile';
import { SectionHeading, sectionClass } from './SectionHeading';
import { card, chip } from './styles';

type Filter = 'All' | WorkCategory;

const filterButton = (active: boolean) =>
  `h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
    active
      ? 'bg-primary text-primary-foreground border-primary'
      : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
  }`;

export function Works() {
  const [filter, setFilter] = useState<Filter>('All');
  if (profile.works.length === 0) return null;

  const categories = [...new Set(profile.works.map((w) => w.category))];
  const shown = filter === 'All' ? profile.works : profile.works.filter((w) => w.category === filter);

  return (
    <section id="work" aria-labelledby="work-title" className={sectionClass}>
      <div className="max-w-4xl lg:max-w-[min(70vw,var(--content-max))] mx-auto">
        <SectionHeading id="work-title" title="Work" description="Things I've built and designed." />

        {categories.length > 1 && (
          <div role="group" aria-label="Filter work by category" className="mb-8 flex flex-wrap gap-2">
            {(['All', ...categories] as Filter[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={filter === option}
                onClick={() => setFilter(option)}
                className={filterButton(filter === option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <ul className="grid md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {shown.map((work) => (
            <li key={work.title} className={`${card} min-w-0 flex flex-col`}>
              {work.image && (
                <img
                  src={`${import.meta.env.BASE_URL}${work.image.src}`}
                  alt={work.image.alt}
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={720}
                  className="-mt-2 mb-6 w-full aspect-video object-cover rounded-xl border border-border bg-muted"
                />
              )}

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>{work.category}</span>
                {work.year && <span aria-hidden="true">·</span>}
                {work.year && <span>{work.year}</span>}
                {work.inProgress && (
                  <span className="ml-1 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent-strong text-xs font-medium">
                    In progress
                  </span>
                )}
              </div>

              <h3 className="mt-2 font-display text-xl md:text-2xl font-semibold text-foreground wrap-anywhere">{work.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed flex-1">{work.summary}</p>

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
                      <span className="sr-only">
                        : {work.title} (opens in a new tab)
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
