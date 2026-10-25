import { formatPeriod, profile } from '../data/profile';
import { SectionHeading } from './SectionHeading';

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="py-20 md:py-32 px-5 md:px-8 relative bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <SectionHeading id="experience-title" eyebrow="Career" title="Experience" />

        <div className="relative">
          {/* Vertical timeline line */}
          <div
            aria-hidden="true"
            className="absolute left-0 top-2 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-primary/10"
          />

          <ol className="space-y-8 md:space-y-12 ml-8 md:ml-12">
            {profile.experience.map((job, index) => {
              const current = job.end === null;
              return (
                <li
                  key={job.company}
                  className="reveal relative"
                  style={{ '--reveal-delay': `${index * 0.1}s` } as React.CSSProperties}
                >
                  {/* Dot on timeline */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-7 md:top-9 w-3 h-3 rounded-full ${current ? 'bg-primary' : 'bg-accent'} ring-4 ring-background`}
                    style={{ left: 'calc(-2rem - 6px)' }}
                  />

                  <article className="group bg-card rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md border border-border hover:border-primary/30 transition-all duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <time className="text-sm text-muted-foreground" dateTime={job.start}>
                        {formatPeriod(job)}
                      </time>
                      {current && (
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          Current
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-300">
                      {job.role}
                    </h3>
                    <p className="text-base md:text-lg text-accent-strong font-medium mt-1 mb-4">{job.company}</p>

                    <p className="text-muted-foreground leading-relaxed mb-4">{job.description}</p>

                    <ul className="space-y-2 mb-6">
                      {job.achievements.map((achievement) => (
                        <li key={achievement} className="flex items-start gap-3 text-sm md:text-base text-muted-foreground">
                          <span aria-hidden="true" className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>

                    <ul aria-label="Technologies" className="flex flex-wrap gap-2">
                      {job.tech.map((tech) => (
                        <li
                          key={tech}
                          className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs md:text-sm"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
