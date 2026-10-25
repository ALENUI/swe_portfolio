import { ArrowUp } from 'lucide-react';
import { profile } from '../data/profile';

export function Footer() {
  return (
    <footer className="border-t border-border px-5 md:px-8 py-8">
      <div className="max-w-4xl mx-auto flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-xs md:text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {profile.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer me" className="hover:text-primary transition-colors">
              {s.label}
            </a>
          ))}
          <a href="#bio" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            Back to top <ArrowUp size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
