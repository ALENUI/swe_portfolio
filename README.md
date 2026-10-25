# ALENUI — Portfolio

Personal portfolio website. React + Vite + Tailwind CSS, prerendered to static HTML for fast loads and full search-engine visibility, with light/dark themes.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build + prerender into dist/
npm run preview   # serve the production build
```

## Editing content

All text, links, experience, skills and SEO metadata live in **[src/app/data/profile.ts](src/app/data/profile.ts)**. The page, the `<head>` tags, JSON-LD structured data, `sitemap.xml` and `robots.txt` are all generated from it.

The social share image and icons are in [public/](public/) (`og-image.png` is 1200×630).

## Deployment (GitHub Pages)

The workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and deploys on every push to `main`.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The site is then served at `https://alenui.github.io/swe_portfolio/`. The site URL and base path are detected automatically, including when a custom domain is configured under **Settings → Pages → Custom domain**.

### Optional repository variables

Set these under **Settings → Secrets and variables → Actions → Variables**:

| Variable | Purpose |
| --- | --- |
| `GOOGLE_SITE_VERIFICATION` | Token from [Google Search Console](https://search.google.com/search-console) (HTML tag method) |
| `BING_SITE_VERIFICATION` | Token from [Bing Webmaster Tools](https://www.bing.com/webmasters) (also covers Yahoo and DuckDuckGo) |
| `YANDEX_VERIFICATION` | Token from [Yandex Webmaster](https://webmaster.yandex.com) |
| `VITE_CONTACT_ENDPOINT` | Form backend URL (e.g. [Formspree](https://formspree.io)). Without it, the contact form opens the visitor's email client. |

After the first deploy, submit `https://<your-site>/sitemap.xml` in Google Search Console and Bing Webmaster Tools to get indexed quickly.
