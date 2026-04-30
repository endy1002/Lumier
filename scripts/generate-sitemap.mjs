import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://lumierbookcharm.store';

const routes = [
  '/',
  '/san-pham',
  '/kham-pha',
  '/bai-viet',
];

const generateSitemap = () => {
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  routes.forEach((route) => {
    // Top-level route priority styling
    const priority = route === '/' ? '1.0' : '0.8';

    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}${route === '/' ? '' : route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');

  console.log(`Sitemap generated successfully at ${sitemapPath}`);
};

generateSitemap();