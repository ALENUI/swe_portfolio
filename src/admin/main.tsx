import { createRoot } from 'react-dom/client';
import AdminApp from './AdminApp';
import { applyTheme, watchSystemTheme } from '../app/theme';
import '../styles/index.css';

// The admin's Content Security Policy forbids inline scripts, so the theme is applied here.
let stored: string | null = null;
try {
  stored = localStorage.getItem('theme');
} catch {}
applyTheme(stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
watchSystemTheme();

createRoot(document.getElementById('root')!).render(<AdminApp />);
