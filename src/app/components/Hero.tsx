import { MapPin } from 'lucide-react';
import { profile } from '../data/profile';
import { HeroGlobe } from './globe/HeroGlobe';
import { SocialIcon } from './SocialIcon';
import { buttonPrimary, buttonSecondary } from './styles';

export function Hero() {
  const github = profile.socials.find((s) => s.label === 'GitHub');
  const hasContact = Boolean(profile.email) || profile.socials.length > 0;

  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative overflow-hidden px-5 md:px-8 pt-36 pb-20 md:pt-48 md:pb-28"
    >
      <div className="relative max-w-4xl mx-auto">
        <HeroGlobe />

        <div className="relative md:max-w-xl">
          <p className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} aria-hidden="true" />
            {profile.location.city}, {profile.location.country}
          </p>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-[1.05] wrap-anywhere">
            {profile.name}
          </h1>

          <p className="mt-4 text-xl md:text-2xl text-primary font-medium">{profile.headline}</p>

          <p className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">{profile.intro}</p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            {hasContact && (
              <a href="#contact" className={buttonPrimary}>
                Get in touch
              </a>
            )}
            {github && (
              <a href={github.url} target="_blank" rel="noopener noreferrer me" className={buttonSecondary}>
                <SocialIcon label="GitHub" size={16} />
                View my GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
