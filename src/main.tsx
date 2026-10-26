import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App.tsx';
import NotFound from './app/NotFound.tsx';
import './styles/index.css';

const root = document.getElementById('root')!;
const notFound = root.dataset.page === '404';
const admin = `${import.meta.env.BASE_URL}admin`;

if (notFound && (location.pathname === admin || location.pathname.startsWith(`${admin}/`))) {
  // GitHub Pages serves 404.html for unknown paths like /admin/login: send those to the admin.
  location.replace(`${admin}/`);
} else {
  const page = notFound ? <NotFound /> : <App />;
  // Production HTML is prerendered (scripts/prerender.mjs), so hydrate it; the dev server starts empty.
  if (root.hasChildNodes()) {
    hydrateRoot(root, page);
  } else {
    createRoot(root).render(page);
  }
}
