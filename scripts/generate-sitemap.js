#!/usr/bin/env node

/**
 * Chatters SEO Sitemap Generator
 * Generates an optimized sitemap.xml for search engines
 * 
 * Usage: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://www.getchatters.com';
const TODAY = new Date().toISOString().split('T')[0];

// Define all public pages with their SEO priorities and update frequencies
const pages = [
  // Core marketing pages (highest priority)
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
  { path: '/demo', priority: '0.9', changefreq: 'weekly' },

  // Product pages (high priority)
  { path: '/product/question-management', priority: '0.9', changefreq: 'monthly' },
  { path: '/product/business-intelligence', priority: '0.9', changefreq: 'monthly' },
  { path: '/product/automation-workflow', priority: '0.9', changefreq: 'monthly' },
  { path: '/product/multi-location-control', priority: '0.9', changefreq: 'monthly' },
  { path: '/product/kiosk-mode', priority: '0.9', changefreq: 'monthly' },
  { path: '/product/real-time-alerts', priority: '0.9', changefreq: 'monthly' },

  // Solutions pages (high priority)
  { path: '/solutions/restaurants', priority: '0.8', changefreq: 'monthly' },
  { path: '/solutions/hotels', priority: '0.8', changefreq: 'monthly' },
  { path: '/solutions/retail', priority: '0.8', changefreq: 'monthly' },
  { path: '/solutions/events', priority: '0.8', changefreq: 'monthly' },

  // Content & resources pages
  { path: '/blog', priority: '0.7', changefreq: 'weekly' },
  { path: '/help', priority: '0.7', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
  { path: '/security', priority: '0.6', changefreq: 'monthly' },

  // Authentication pages
  { path: '/signin', priority: '0.5', changefreq: 'monthly' },

  // Legal pages
  { path: '/terms', priority: '0.4', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.4', changefreq: 'yearly' },
];

// Generate XML sitemap content
function generateSitemap() {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" 
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

  const urls = pages.map(page => `
  <url>
    <loc>${DOMAIN}${page.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  const footer = `
</urlset>`;

  return header + urls + footer;
}

// Write sitemap to public directory
function writeSitemap() {
  const sitemap = generateSitemap();
  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  
  fs.writeFileSync(outputPath, sitemap, 'utf8');
  console.log(`✅ Sitemap generated successfully at ${outputPath}`);
  console.log(`📊 Generated ${pages.length} URLs`);
  console.log(`🔗 Domain: ${DOMAIN}`);
  console.log(`📅 Last modified: ${TODAY}`);
}

// Run the generator
if (require.main === module) {
  writeSitemap();
}

module.exports = { generateSitemap, pages };