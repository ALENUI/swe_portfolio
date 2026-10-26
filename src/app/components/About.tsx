import { profile } from '../data/profile';
import { SectionHeading, sectionClass } from './SectionHeading';
import { chip } from './styles';

export function About() {
  const skillGroups: [string, string[]][] = profile.skills
    .filter((g) => g.items.length > 0)
    .map((g) => [g.group, g.items]);
  if (profile.spokenLanguages.length > 0) {
    skillGroups.push(['Spoken', profile.spokenLanguages.map((l) => `${l.name} (${l.level})`)]);
  }

  return (
    <section id="about" aria-labelledby="about-title" className={sectionClass}>
      <div className="max-w-4xl lg:max-w-[min(70vw,var(--content-max))] mx-auto">
        <SectionHeading id="about-title" title="About" />

        <div className="grid md:grid-cols-[3fr_2fr] gap-12 md:gap-16">
          <div>
            <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              {profile.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {profile.education.length > 0 && (
              <>
                <h3 className="font-display text-xl font-semibold text-foreground mt-12 mb-5">Education</h3>
                <ul className="space-y-5">
                  {profile.education.map((d) => (
                    <li key={d.degree}>
                      <p className="font-semibold text-foreground">{d.degree}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {d.school} · <span className="whitespace-nowrap">{d.start} – {d.end}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {skillGroups.length > 0 && (
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-5">Skills</h3>
              <dl className="space-y-5">
                {skillGroups.map(([category, items]) => (
                  <div key={category}>
                    <dt className="text-sm text-foreground font-semibold mb-2">{category}</dt>
                    <dd>
                      <ul className="flex flex-wrap gap-2">
                        {items.map((skill) => (
                          <li key={skill} className={chip}>
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
