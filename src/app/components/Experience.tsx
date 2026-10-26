import { formatPeriod, profile } from '../data/profile';
import { SectionHeading, sectionClass } from './SectionHeading';
import { card, chip } from './styles';

export function Experience() {
  if (profile.experience.length === 0) return null;

  return (
    <section id="experience" aria-labelledby="experience-title" className={sectionClass}>
      <div className="max-w-4xl mx-auto">
        <SectionHeading id="experience-title" title="Experience" />

        <ol className="relative space-y-6 md:space-y-8 md:pl-10 md:before:absolute md:before:left-[5px] md:before:top-3 md:before:bottom-3 md:before:w-px md:before:bg-border">
          {profile.experience.map((job) => {
            const current = job.end === null;
            return (
              <li key={`${job.company}-${job.start}`} className="relative">
                <span
                  aria-hidden="true"
                  className={`hidden md:block absolute -left-10 top-10 w-[11px] h-[11px] rounded-full ring-4 ring-background ${
                    current ? 'bg-primary' : 'bg-muted-foreground/40'
                  }`}
                />

                <article className={card}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-sm text-muted-foreground">
                    <time dateTime={job.start}>{formatPeriod(job)}</time>
                    {current && <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Current</span>}
                  </div>

                  <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground wrap-anywhere">{job.role}</h3>
                  <p className="mt-1 text-base wrap-anywhere">
                    <span className="text-accent-strong font-medium">{job.company}</span>
                    {job.companyLocation && <span className="text-muted-foreground"> · {job.companyLocation}</span>}
                  </p>

                  {job.highlights.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {job.highlights.map((item) => (
                        <li key={item} className="flex gap-3 text-sm md:text-base text-muted-foreground">
                          <span aria-hidden="true" className="mt-2.5 w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {job.tech && job.tech.length > 0 && (
                    <ul aria-label="Technologies" className="mt-6 flex flex-wrap gap-2">
                      {job.tech.map((tech) => (
                        <li key={tech} className={chip}>
                          {tech}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
