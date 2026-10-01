import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseUrl = 'https://mdpreview.dev';

const pages = [
  { path: '', priority: '1.0', changefreq: 'weekly', localized: true },
  { path: 'pdf-to-md.html', priority: '0.9', changefreq: 'weekly', localized: false },
  { path: 'md-to-card.html', priority: '0.9', changefreq: 'weekly', localized: false },
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

const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml">'
];

const today = new Date().toISOString().split('T')[0];

for (const page of pages) {
  if (page.localized) {
    for (const lang of languages) {
      const pageUrl = baseUrl + '/' + lang.prefix;
      xmlLines.push('  <url>');
      xmlLines.push('    <loc>' + pageUrl + '</loc>');
      xmlLines.push('    <lastmod>' + today + '</lastmod>');
      xmlLines.push('    <changefreq>' + page.changefreq + '</changefreq>');
      xmlLines.push('    <priority>' + page.priority + '</priority>');
      for (const altLang of languages) {
        xmlLines.push('    <xhtml:link rel="alternate" hreflang="' + altLang.code + '" href="' + baseUrl + '/' + altLang.prefix + '" />');
      }
      xmlLines.push('    <xhtml:link rel="alternate" hreflang="x-default" href="' + baseUrl + '/" />');
      xmlLines.push('  </url>');
    }
  } else {
    xmlLines.push('  <url>');
    xmlLines.push('    <loc>' + baseUrl + '/' + page.path + '</loc>');
    xmlLines.push('    <lastmod>' + today + '</lastmod>');
    xmlLines.push('    <changefreq>' + page.changefreq + '</changefreq>');
    xmlLines.push('    <priority>' + page.priority + '</priority>');
    xmlLines.push('  </url>');
  }
}

xmlLines.push('</urlset>');

const sitemap = xmlLines.join('\n') + '\n';
const outPath = resolve(__dirname, '../dist/sitemap.xml');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, sitemap, 'utf-8');
console.log("sitemap.xml generated with full hreflang matrix and new tools");
