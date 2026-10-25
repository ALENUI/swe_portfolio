import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';

const root = document.getElementById('root')!;

// Production HTML is prerendered (scripts/prerender.mjs), so hydrate it; the dev server starts empty.
if (root.hasChildNodes()) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
