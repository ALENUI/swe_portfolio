interface SectionHeadingProps {
  id: string;
  title: string;
  description?: string;
}

export function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <header className="reveal mb-10 md:mb-14">
      <h2 id={id} className="font-display text-3xl md:text-4xl font-bold text-foreground">
        {title}
      </h2>
      {description && <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">{description}</p>}
    </header>
  );
}

/** Consistent outer spacing for every content section. */
export const sectionClass = 'px-5 md:px-8 py-20 md:py-28 border-t border-border scroll-mt-16';
