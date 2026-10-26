import { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Experience } from './components/Experience';
import { Works } from './components/Works';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Navigation, type NavSection } from './components/Navigation';
import { Particles } from './components/particles/Particles';
import { profile } from './data/profile';
import { enableSmoothScroll } from './smoothScroll';
import { watchSystemTheme } from './theme';

// Only link to sections that actually render.
const sections: NavSection[] = [
  profile.experience.length > 0 && { id: 'experience', label: 'Experience' },
  profile.works.length > 0 && { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  (profile.email || profile.socials.length > 0) && { id: 'contact', label: 'Contact' },
].filter((s): s is NavSection => Boolean(s));

export default function App() {
  const [activeSection, setActiveSection] = useState<string>();

  useEffect(() => watchSystemTheme(), []);
  useEffect(() => enableSmoothScroll(), []);

  // Highlight the section that crosses the middle of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    for (const id of ['top', ...sections.map((s) => s.id)]) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="isolate min-h-screen bg-background text-foreground">
      <Particles />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-primary focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <Navigation sections={sections} activeSection={activeSection} homeHref="#top" />

      <main id="main">
        <Hero />
        <Experience />
        <Works />
        <About />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
