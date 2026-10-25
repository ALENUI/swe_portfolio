import { Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '../data/profile';

const socialIcons: Record<string, typeof Github> = { GitHub: Github, LinkedIn: Linkedin };

export function Hero() {
  return (
    <section
      id="bio"
      aria-label="Introduction"
      className="min-h-[100svh] flex items-center justify-center relative pt-24 pb-28 px-5 md:px-8"
    >
      {/* Subtle gradient orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl w-full relative z-10 text-center">
        <div className="reveal">
          {profile.availableForWork && (
            <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs md:text-sm text-muted-foreground">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Open to new opportunities
            </p>
          )}

          <div className="mb-6 flex items-center justify-center gap-3">
            <div aria-hidden="true" className="h-px w-10 md:w-16 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{profile.role}</span>
            <div aria-hidden="true" className="h-px w-10 md:w-16 bg-gradient-to-l from-transparent to-primary" />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-bold mb-6 text-foreground leading-tight">
            {profile.name}
          </h1>

          <p className="text-base sm:text-xl md:text-2xl font-light text-muted-foreground max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed px-2">
            {profile.tagline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="#contact"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300"
            >
              Get in touch
            </a>
            <a
              href="#experience"
              className="w-full sm:w-auto px-8 py-4 border-2 border-border text-foreground rounded-full font-semibold hover:border-primary hover:text-primary transition-colors duration-300"
            >
              View work
            </a>
          </div>

          <ul className="mt-8 flex items-center justify-center gap-3">
            {profile.socials.map((s) => {
              const Icon = socialIcons[s.label];
              return (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={s.label}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-300"
                  >
                    {Icon && <Icon size={18} aria-hidden="true" />}
                  </a>
                </li>
              );
            })}
            <li>
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-300"
              >
                <Mail size={18} aria-hidden="true" />
              </a>
            </li>
          </ul>

          {/* Stats */}
          <dl className="mt-14 md:mt-16 flex items-center justify-center gap-6 md:gap-12 text-sm text-muted-foreground flex-wrap">
            {profile.stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-6 md:gap-12">
                {index > 0 && <div aria-hidden="true" className="h-10 md:h-12 w-px bg-border" />}
                <div className="flex flex-col-reverse">
                  <dt>{stat.label}</dt>
                  <dd
                    className={`font-display text-2xl md:text-3xl font-semibold mb-1 md:mb-2 ${
                      index % 2 === 0 ? 'text-primary' : 'text-accent'
                    }`}
                  >
                    {stat.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Scroll Indicator */}
      <a
        href="#experience"
        aria-label="Scroll to experience"
        className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 reveal"
        style={{ '--reveal-delay': '0.8s' } as React.CSSProperties}
      >
        <span className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2 hover:border-primary/60 transition-colors">
          <span className="w-1 h-2 bg-primary rounded-full animate-bounce" />
        </span>
      </a>
    </section>
  );
}
