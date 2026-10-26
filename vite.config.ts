import { defineConfig, type Connect, type Plugin } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// The admin page holds a GitHub token, so in production it may only load its own
// code and fonts, and only talk to the GitHub API. (Dev needs inline scripts for HMR.)
const ADMIN_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data: blob:",
  'connect-src https://api.github.com',
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ');

function adminCsp(): Plugin {
  return {
    name: 'admin-csp',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      if (!ctx.path.endsWith('/admin/index.html')) return html;
      return html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${ADMIN_CSP}" />`);
    },
  };
}

// Serve the admin for any /admin, /admin/ or /admin/... path (e.g. /admin/login) in dev
// and preview; otherwise the SPA fallback would show the homepage instead.
function adminRoutes(): Plugin {
  const rewrite =
    (base: string): Connect.NextHandleFunction =>
    (req, _res, next) => {
      const [pathname, query] = (req.url ?? '').split('?');
      const prefix = `${base}admin`;
      if ((pathname === prefix || pathname.startsWith(`${prefix}/`)) && !/\.\w+$/.test(pathname)) {
        req.url = `${prefix}/index.html${query ? `?${query}` : ''}`;
      }
      next();
    };
  return {
    name: 'admin-routes',
    configureServer: (server) => void server.middlewares.use(rewrite(server.config.base)),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite(server.config.base)),
  };
}

export default defineConfig({
  // Sub-path when served from https://<user>.github.io/<repo>/ (set by the deploy workflow)
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss(), adminCsp(), adminRoutes()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin/index.html'),
      },
    },
  },
});
