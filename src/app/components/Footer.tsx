import { profile } from '../data/profile';

export function Footer() {
  return (
    <footer className="border-t border-border px-5 md:px-8 py-8">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>
          {profile.location.city}, {profile.location.country}
        </p>
      </div>
    </footer>
  );
}
