import { ArrowUpRight } from 'lucide-react';
import { profile } from '../data/profile';
import { SectionHeading, sectionClass } from './SectionHeading';
import { SocialIcon } from './SocialIcon';
import { card, chip } from './styles';

const projectLink = 'inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline';

export function Projects() {
  if (profile.projects.length === 0) return null;

  return (
    <section id="projects" aria-labelledby="projects-title" className={sectionClass}>
      <div className="max-w-4xl mx-auto">
        <SectionHeading id="projects-title" title="Projects" />

        <ul className="grid md:grid-cols-2 gap-6">
          {profile.projects.map((project) => (
            <li key={project.name} className={`${card} min-w-0 flex flex-col`}>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground wrap-anywhere">{project.name}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed flex-1">{project.summary}</p>

              {project.tech.length > 0 && (
                <ul aria-label="Technologies" className="mt-5 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <li key={tech} className={chip}>
                      {tech}
                    </li>
                  ))}
                </ul>
              )}

              {(project.url || project.repo) && (
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className={projectLink}>
                      Live site <ArrowUpRight size={14} aria-hidden="true" />
                      <span className="sr-only">for {project.name} (opens in a new tab)</span>
                    </a>
                  )}
                  {project.repo && (
                    <a href={project.repo} target="_blank" rel="noopener noreferrer" className={projectLink}>
                      <SocialIcon label="GitHub" size={14} /> Source
                      <span className="sr-only">code for {project.name} (opens in a new tab)</span>
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
