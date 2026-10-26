/**
 * Post-build step: renders the app to static HTML and injects SEO metadata,
 * so every search engine and social crawler sees full content without JS.
 *
 * Env vars (all optional):
 *   SITE_URL                   Public URL, e.g. https://alenui.dev (defaults to profile.siteUrl)
 *   GOOGLE_SITE_VERIFICATION   Google Search Console token
 *   BING_SITE_VERIFICATION     Bing Webmaster Tools token
 *   YANDEX_VERIFICATION        Yandex Webmaster token
 */
import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

const { render, profile } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

const siteUrl = (process.env.SITE_URL || profile.siteUrl).replace(/\/+$/, '');
const pageUrl = `${siteUrl}/`;
const title = `${profile.name} · ${profile.jobTitle}`;
const ogImage = `${siteUrl}/og-image.png`;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const meta = (attr, key, content) => (content ? `<meta ${attr}="${key}" content="${esc(content)}" />` : '');

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${pageUrl}#person`,
      name: profile.name,
      url: pageUrl,
      image: ogImage,
      alternateName: profile.alternateNames,
      ...(profile.email && { email: `mailto:${profile.email}` }),
      jobTitle: profile.jobTitle,
      description: profile.description,
      worksFor: profile.experience
        .filter((job) => job.end === null)
        .map((job) => ({ '@type': 'Organization', name: job.company })),
      alumniOf: [...new Set(profile.education.map((d) => d.school))].map((name) => ({ '@type': 'CollegeOrUniversity', name })),
      hasOccupation: profile.experience
        .filter((job) => job.end === null)
        .map((job) => ({ '@type': 'Occupation', name: job.role })),
      address: {
        '@type': 'PostalAddress',
        addressLocality: profile.location.city,
        addressRegion: profile.location.region,
        addressCountry: profile.location.countryCode,
      },
      knowsAbout: [...new Set(Object.values(profile.skills).flat())],
      sameAs: profile.socials.map((s) => s.url),
    },
    {
      '@type': 'ProfilePage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description: profile.description,
      inLanguage: 'en',
      mainEntity: { '@id': `${pageUrl}#person` },
      dateModified: new Date().toISOString(),
    },
  ],
};

const head = [
  `<title>${esc(title)}</title>`,
  meta('name', 'description', profile.description),
  meta('name', 'author', profile.name),
  meta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'),
  `<link rel="canonical" href="${esc(pageUrl)}" />`,
  // Open Graph (Facebook, LinkedIn, Slack, Discord, WhatsApp...)
  meta('property', 'og:type', 'profile'),
  meta('property', 'og:site_name', profile.name),
  meta('property', 'og:locale', profile.locale),
  meta('property', 'og:url', pageUrl),
  meta('property', 'og:title', title),
  meta('property', 'og:description', profile.description),
  meta('property', 'og:image', ogImage),
  meta('property', 'og:image:width', '1200'),
  meta('property', 'og:image:height', '630'),
  meta('property', 'og:image:alt', `${profile.name}, ${profile.headline.toLowerCase()}`),
  // Twitter / X
  meta('name', 'twitter:card', 'summary_large_image'),
  meta('name', 'twitter:title', title),
  meta('name', 'twitter:description', profile.description),
  meta('name', 'twitter:image', ogImage),
  meta('name', 'twitter:image:alt', `${profile.name}, ${profile.headline.toLowerCase()}`),
  // Search engine ownership verification
  meta('name', 'google-site-verification', process.env.GOOGLE_SITE_VERIFICATION),
  meta('name', 'msvalidate.01', process.env.BING_SITE_VERIFICATION),
  meta('name', 'yandex-verification', process.env.YANDEX_VERIFICATION),
  `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
]
  .filter(Boolean)
  .join('\n    ');

const indexPath = path.join(dist, 'index.html');
const template = await readFile(indexPath, 'utf8');
const withoutTitle = template.replace(/<title>.*?<\/title>\s*/s, '');

await writeFile(indexPath, withoutTitle.replace('<!--app-head-->', head).replace('<!--app-html-->', render()));

// GitHub Pages serves 404.html for any unknown path.
const notFoundHead = [
  `<title>Page not found · ${esc(profile.name)}</title>`,
  meta('name', 'robots', 'noindex'),
].join('\n    ');
await writeFile(
  path.join(dist, '404.html'),
  withoutTitle
    .replace('<!--app-head-->', notFoundHead)
    .replace('<div id="root"><!--app-html-->', `<div id="root" data-page="404">${render('404')}`),
);

await writeFile(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${esc(pageUrl)}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>
</urlset>
`,
);

await rm(ssrDir, { recursive: true, force: true });
console.log(`Prerendered ${path.relative(root, indexPath)} for ${pageUrl}`);
