# Alenui Rovis Mbah · Portfolio

Personal portfolio website. React + Vite + Tailwind CSS, prerendered to static HTML for fast loads and full search-engine visibility, with light/dark themes.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build + prerender into dist/
npm run preview   # serve the production build
```

## Editing content

All text, links, experience, education, projects, skills and SEO metadata live in **[src/app/data/profile.ts](src/app/data/profile.ts)**. The page, the `<head>` tags, JSON-LD structured data, `sitemap.xml` and `robots.txt` are all generated from it. Sections with no entries (e.g. `projects`) are hidden automatically, along with their navigation link.

The social share image and icons are in [public/](public/) (`og-image.png` is 1200×630).

## Deployment (GitHub Pages)

The workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and deploys on every push to `main`.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Without a custom domain the site is served at `https://alenui.github.io/swe_portfolio/`.

### Custom domain

1. Buy a domain (e.g. from Namecheap, Cloudflare or Porkbun).
2. At your DNS provider, add these records for the apex domain (`example.com`):
   - `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` record for `www` pointing to `alenui.github.io`
3. In **Settings → Pages → Custom domain**, enter the domain, save, and tick **Enforce HTTPS** once the certificate is issued.
4. Re-run the deploy workflow (**Actions → Deploy to GitHub Pages → Run workflow**). The site URL and base path are detected automatically, so canonical URLs, the sitemap and social previews switch to the new domain with no code changes.
5. Update `siteUrl` in `profile.ts` so local builds match.

### Optional repository variables

Set these under **Settings → Secrets and variables → Actions → Variables**:

| Variable | Purpose |
| --- | --- |
| `GOOGLE_SITE_VERIFICATION` | Token from [Google Search Console](https://search.google.com/search-console) (HTML tag method) |
| `BING_SITE_VERIFICATION` | Token from [Bing Webmaster Tools](https://www.bing.com/webmasters) (also covers Yahoo and DuckDuckGo) |
| `YANDEX_VERIFICATION` | Token from [Yandex Webmaster](https://webmaster.yandex.com) |
| `VITE_CONTACT_ENDPOINT` | Form backend URL (e.g. [Formspree](https://formspree.io)). Without it, the contact form opens the visitor's email client. |

After the first deploy, submit `https://<your-site>/sitemap.xml` in Google Search Console and Bing Webmaster Tools to get indexed quickly.
