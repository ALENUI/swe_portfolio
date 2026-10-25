import { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Experience } from './components/Experience';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Navigation, sections } from './components/Navigation';
import { toggleTheme, watchSystemTheme } from './theme';

export default function App() {
  const [activeSection, setActiveSection] = useState('bio');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => watchSystemTheme(), []);

  // Track the active section and reading progress (throttled to one update per frame).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      for (const { id } of sections) {
        const element = document.getElementById(id);
        if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
          setActiveSection(id);
          break;
        }
      }
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? window.scrollY / totalHeight : 0);
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Fade elements in as they scroll into view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip relative">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-full focus:bg-primary focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <Navigation activeSection={activeSection} scrolled={scrolled} toggleTheme={toggleTheme} />

      <main id="main">
        <Hero />
        <Experience />
        <About />
        <Contact />
      </main>

      <Footer />

      {/* Scroll Progress Indicator */}
      <div aria-hidden="true" className="fixed top-0 left-0 right-0 h-0.5 z-50 pointer-events-none">
        <div
          className="h-full origin-left bg-gradient-to-r from-primary to-accent"
          style={{ transform: `scaleX(${scrollProgress})` }}
        />
      </div>
    </div>
  );
}
