import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Particles } from './components/particles/Particles';
import { buttonPrimary } from './components/styles';
import { watchSystemTheme } from './theme';

const home = import.meta.env.BASE_URL;

export default function NotFound() {
  useEffect(() => watchSystemTheme(), []);

  return (
    <div className="isolate min-h-screen flex flex-col bg-background text-foreground">
      <Particles />
      <Navigation sections={[]} homeHref={home} />

      <main id="main" className="flex-1 flex items-center px-5 md:px-8 pt-32 pb-20">
        <div className="max-w-4xl lg:max-w-[min(70vw,var(--content-max))] w-full mx-auto">
          <p className="text-sm font-semibold text-primary">404</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold">Page not found</h1>
          <p className="mt-4 max-w-xl text-base md:text-lg text-muted-foreground">
            There's nothing at this address. The link may be mistyped, or the page may have moved.
          </p>
          <a href={home} className={`${buttonPrimary} mt-10`}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to the homepage
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
