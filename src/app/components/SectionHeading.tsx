interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: 'primary' | 'accent';
}

export function SectionHeading({ id, eyebrow, title, description, tone = 'primary' }: SectionHeadingProps) {
  return (
    <header className="mb-12 md:mb-20 reveal">
      <div className="mb-4 flex items-center gap-3">
        <div
          aria-hidden="true"
          className={`h-px w-12 bg-gradient-to-r from-transparent ${tone === 'primary' ? 'to-primary' : 'to-accent'}`}
        />
        <span className="text-sm text-muted-foreground uppercase tracking-wider">{eyebrow}</span>
      </div>
      <h2 id={id} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 md:mt-6 text-base md:text-xl text-muted-foreground max-w-2xl">{description}</p>
      )}
    </header>
  );
}
