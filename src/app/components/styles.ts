// Shared class names so buttons, chips and cards stay identical across sections.
export const buttonPrimary =
  'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors';

export const buttonSecondary =
  'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full border border-border text-foreground text-sm font-semibold hover:border-primary hover:text-primary transition-colors';

export const iconButton =
  'w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors';

export const chip = 'px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs md:text-sm';

export const card = 'bg-card rounded-2xl border border-border p-6 md:p-8';

export const textLink = 'text-primary font-medium underline-offset-4 hover:underline';

export const field =
  'w-full bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-60';
