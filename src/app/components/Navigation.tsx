import { useEffect, useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { profile } from '../data/profile';

interface NavigationProps {
  activeSection: string;
  scrolled: boolean;
  toggleTheme: () => void;
}

export const sections = [
  { id: 'bio', label: 'Home' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

const iconButton =
  'w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-300';

export function Navigation({ activeSection, scrolled, toggleTheme }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md transition-colors duration-300 border-b ${
        scrolled || menuOpen ? 'bg-background/80 border-border' : 'bg-background/40 border-transparent'
      }`}
    >
      <nav aria-label="Main" className="max-w-6xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#bio" className="flex items-center gap-2 rounded-md" aria-label={`${profile.name} – back to top`}>
          <span aria-hidden="true" className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-semibold text-foreground tracking-widest uppercase text-sm">{profile.name}</span>
        </a>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {sections.map((section) => {
            const active = activeSection === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={active ? 'location' : undefined}
                  className={`relative py-1 text-sm transition-colors duration-300 ${
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {section.label}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary rounded-full transition-transform duration-300 origin-left ${
                      active ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle dark mode" className={iconButton}>
            {/* Icon is driven by the .dark class so it is correct before React hydrates */}
            <Sun size={16} className="hidden dark:block" aria-hidden="true" />
            <Moon size={16} className="dark:hidden" aria-hidden="true" />
          </button>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={`md:hidden ${iconButton}`}
          >
            {menuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-border bg-background/95">
          <ul className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setMenuOpen(false)}
                  aria-current={activeSection === section.id ? 'location' : undefined}
                  className={`block px-4 py-3 rounded-xl text-sm transition-colors duration-200 ${
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
