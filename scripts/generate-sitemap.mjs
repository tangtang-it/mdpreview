import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseUrl = 'https://mdpreview.dev';

const pages = [
  { path: '', priority: '1.0', changefreq: 'weekly', localized: true },
  { path: 'about.html', priority: '0.6', changefreq: 'monthly', localized: false },
  { path: 'privacy.html', priority: '0.4', changefreq: 'yearly', localized: false },
  { path: 'terms.html', priority: '0.4', changefreq: 'yearly', localized: false },
  { path: 'contact.html', priority: '0.5', changefreq: 'monthly', localized: false }
];

const languages = [
  { code: 'en', prefix: '' },
  { code: 'es', prefix: 'es/' },
  { code: 'pt', prefix: 'pt/' }
];

let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
sitemap += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

const today = new Date().toISOString().split('T')[0];

for (const page of pages) {
  if (page.localized) {
    for (const lang of languages) {
      const pageUrl = `${baseUrl}/${lang.prefix}`;
      sitemap += '  <url>\n';
      sitemap += `    <loc>${pageUrl}</loc>\n`;
      sitemap += `    <lastmod>${today}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      
      for (const altLang of languages) {
        sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang.code}" href="${baseUrl}/${altLang.prefix}" />\n`;
      }
      sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/" />\n`;
      sitemap += '  </url>\n';
    }
  } else {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/${page.path}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += '  </url>\n';
  }
}

sitemap += '</urlset>\n';

const outPath = resolve(__dirname, '../dist/sitemap.xml');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, sitemap, 'utf-8');
console.log('✅ sitemap.xml generated with full hreflang matrix');
