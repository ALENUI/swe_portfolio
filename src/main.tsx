import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App.tsx';
import NotFound from './app/NotFound.tsx';
import './styles/index.css';

const root = document.getElementById('root')!;
const page = root.dataset.page === '404' ? <NotFound /> : <App />;

// Production HTML is prerendered (scripts/prerender.mjs), so hydrate it; the dev server starts empty.
if (root.hasChildNodes()) {
  hydrateRoot(root, page);
} else {
  createRoot(root).render(page);
}
