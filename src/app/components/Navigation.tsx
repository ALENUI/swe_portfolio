import { useEffect, useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { profile } from '../data/profile';
import { toggleTheme } from '../theme';
import { iconButton } from './styles';

export interface NavSection {
  id: string;
  label: string;
}

interface NavigationProps {
  sections: NavSection[];
  activeSection?: string;
  homeHref: string;
}

export function Navigation({ sections, activeSection, homeHref }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    // Close the mobile menu if the viewport grows past the breakpoint.
    const media = window.matchMedia('(min-width: 768px)');
    const onResize = () => media.matches && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    media.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      media.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b transition-colors ${
        scrolled || menuOpen ? 'bg-background/90 backdrop-blur-md border-border' : 'bg-background border-transparent'
      }`}
    >
      <nav aria-label="Main" className="px-5 md:px-8">
        <div className="max-w-4xl mx-auto h-16 flex items-center justify-between gap-4">
          <a href={homeHref} className="flex items-center gap-2 rounded-md">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-semibold text-foreground tracking-widest uppercase text-sm">{profile.shortName}</span>
          </a>

          <div className="flex items-center gap-6 md:gap-8">
            {sections.length > 0 && (
              <ul className="hidden md:flex items-center gap-8">
                {sections.map((section) => {
                  const active = activeSection === section.id;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        aria-current={active ? 'location' : undefined}
                        className={`text-sm transition-colors ${
                          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {section.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                title="Toggle dark mode"
                className={iconButton}
              >
                {/* Icon follows the .dark class so it is right before React hydrates */}
                <Sun size={16} className="hidden dark:block" aria-hidden="true" />
                <Moon size={16} className="dark:hidden" aria-hidden="true" />
              </button>

              {sections.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                  className={`md:hidden ${iconButton}`}
                >
                  {menuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-border px-5">
          <ul className="max-w-4xl mx-auto py-3 flex flex-col">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setMenuOpen(false)}
                  aria-current={activeSection === section.id ? 'location' : undefined}
                  className={`block py-3 text-base transition-colors ${
                    activeSection === section.id
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
