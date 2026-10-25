// Mirrors the inline script in index.html, which applies the theme before first paint.
const STORAGE_KEY = 'theme';
const THEME_COLORS = { light: '#fafafa', dark: '#0c0b14' };

export function applyTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light);
}

export function toggleTheme() {
  const dark = !document.documentElement.classList.contains('dark');
  applyTheme(dark);
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  } catch {
    // Storage unavailable (private mode); the choice just won't persist.
  }
}

/** Follows the OS theme until the visitor picks one explicitly. */
export function watchSystemTheme() {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = (e: MediaQueryListEvent) => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (!stored) applyTheme(e.matches);
  };
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}
