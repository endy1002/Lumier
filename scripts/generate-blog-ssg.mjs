import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

function normalizeApiBaseUrl(value) {
  const fallback = 'http://localhost:8080/api';
  const raw = (value || fallback).trim().replace(/\/+$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

function normalizeSiteUrl(value) {
  const fallback = 'https://lumierbookcharm.store';
  return (value || fallback).trim().replace(/\/+$/, '');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function upsertTag(html, tagRegex, newTag) {
  if (tagRegex.test(html)) {
    return html.replace(tagRegex, newTag);
  }
  return html.replace(/<\/head>/i, `${newTag}\n</head>`);
}

function applyMeta(templateHtml, meta) {
  let html = templateHtml;

  if (meta.title) {
    html = html.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(meta.title)}</title>`);
  }

  if (meta.description) {
    const descTag = `<meta name="description" content="${escapeHtml(meta.description)}" />`;
    html = upsertTag(html, /<meta\s+name=["']description["'][^>]*>/i, descTag);
  }

  const ogTags = [
    meta.title ? `<meta property="og:title" content="${escapeHtml(meta.title)}" />` : null,
    meta.description ? `<meta property="og:description" content="${escapeHtml(meta.description)}" />` : null,
    meta.imageUrl ? `<meta property="og:image" content="${escapeHtml(meta.imageUrl)}" />` : null,
    meta.canonicalUrl ? `<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />` : null,
    '<meta property="og:type" content="article" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    meta.title ? `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />` : null,
    meta.description ? `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />` : null,
    meta.imageUrl ? `<meta name="twitter:image" content="${escapeHtml(meta.imageUrl)}" />` : null,
  ].filter(Boolean);

  const canonicalTag = meta.canonicalUrl
    ? `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`
    : null;

  const injectTags = [canonicalTag, ...ogTags].filter(Boolean).join('\n');
  if (injectTags) {
    html = html.replace(/<\/head>/i, `${injectTags}\n</head>`);
  }

  return html;
}

function formatDate(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split('T')[0];
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} (${url})`);
  }
  return response.json();
}

async function generate() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error('dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const apiBaseUrl = normalizeApiBaseUrl(process.env.VITE_API_URL || process.env.API_URL);
  const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL || process.env.SITE_URL);

  let cards = [];
  try {
    cards = await fetchJson(`${apiBaseUrl}/blogs`);
  } catch (error) {
    console.error('Failed to load blog cards:', error.message);
  }

  const blogDetails = [];
  for (const card of cards) {
    if (!card?.slug) {
      continue;
    }

    try {
      const detail = await fetchJson(`${apiBaseUrl}/blogs/${card.slug}`);
      blogDetails.push(detail);
    } catch (error) {
      console.error(`Failed to load blog detail for ${card.slug}:`, error.message);
    }
  }

  for (const article of blogDetails) {
    if (!article?.slug) {
      continue;
    }

    const title = article.seoTitle || article.title || 'LUMIER';
    const description = article.seoDescription || article.excerpt || '';
    const canonicalUrl = `${siteUrl}/bai-viet/${article.slug}`;
    const imageUrl = article.coverImageUrl || '';

    const outputHtml = applyMeta(templateHtml, {
      title,
      description,
      canonicalUrl,
      imageUrl,
    });

    const outputDir = path.join(DIST_DIR, 'bai-viet', article.slug);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), outputHtml, 'utf8');
  }

  const staticRoutes = ['/', '/san-pham', '/kham-pha', '/bai-viet'];
  const nowDate = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const route of staticRoutes) {
    const priority = route === '/' ? '1.0' : '0.8';
    xml += '  <url>\n';
    xml += `    <loc>${siteUrl}${route === '/' ? '' : route}</loc>\n`;
    xml += `    <lastmod>${nowDate}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += `    <priority>${priority}</priority>\n`;
    xml += '  </url>\n';
  }

  for (const article of blogDetails) {
    if (!article?.slug) {
      continue;
    }

    const lastmod = formatDate(article.publishedAt) || nowDate;
    xml += '  <url>\n';
    xml += `    <loc>${siteUrl}/bai-viet/${article.slug}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml, 'utf8');

  console.log(`Generated ${blogDetails.length} blog meta pages and sitemap.xml.`);
}

generate().catch((error) => {
  console.error('SSG generation failed:', error);
  process.exit(1);
});
