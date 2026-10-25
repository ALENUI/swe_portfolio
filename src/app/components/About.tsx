import { Code2, Gauge, GraduationCap, Network } from 'lucide-react';
import { profile } from '../data/profile';
import { SectionHeading } from './SectionHeading';

const interests = [
  { title: 'Open Source', icon: Code2 },
  { title: 'System Design', icon: Network },
  { title: 'Performance', icon: Gauge },
  { title: 'Mentorship', icon: GraduationCap },
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-32 px-5 md:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <SectionHeading id="about-title" eyebrow="Background" title="About Me" tone="accent" />

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Philosophy */}
          <div className="reveal" style={{ '--reveal-delay': '0.1s' } as React.CSSProperties}>
            <h3 className="font-display text-xl md:text-2xl font-semibold mb-5 md:mb-6 text-foreground">Philosophy</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
              {profile.philosophy.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="reveal" style={{ '--reveal-delay': '0.2s' } as React.CSSProperties}>
            <h3 className="font-display text-xl md:text-2xl font-semibold mb-5 md:mb-6 text-foreground">Expertise</h3>
            <dl className="space-y-5 md:space-y-6">
              {Object.entries(profile.skills).map(([category, items]) => (
                <div key={category}>
                  <dt className="text-xs md:text-sm text-primary font-semibold mb-2 md:mb-3">{category}</dt>
                  <dd>
                    <ul className="flex flex-wrap gap-1.5 md:gap-2">
                      {items.map((skill) => (
                        <li
                          key={skill}
                          className="px-2.5 md:px-3 py-1 md:py-1.5 bg-muted text-muted-foreground rounded-lg text-xs md:text-sm hover:bg-primary/10 hover:text-primary transition-colors duration-300"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Interests */}
        <ul className="mt-14 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {interests.map(({ title, icon: Icon }, index) => (
            <li
              key={title}
              className="reveal flex flex-col items-center text-center p-5 md:p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
              style={{ '--reveal-delay': `${index * 0.08}s` } as React.CSSProperties}
            >
              <span className="mb-3 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="text-xs md:text-sm text-foreground font-medium">{title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
