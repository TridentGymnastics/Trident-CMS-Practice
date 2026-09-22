import { siteConfig } from '../config/site';

const lastmod = new Date().toISOString().split('T')[0];

const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/classes', priority: '0.9', changefreq: 'monthly' },
  { path: '/preschool', priority: '0.8', changefreq: 'monthly' },
  { path: '/edugym', priority: '0.8', changefreq: 'monthly' },
  { path: '/urbangym', priority: '0.8', changefreq: 'monthly' },
  { path: '/agc', priority: '0.7', changefreq: 'monthly' },
  { path: '/playgym', priority: '0.8', changefreq: 'monthly' },
  { path: '/parties', priority: '0.7', changefreq: 'monthly' },
  { path: '/school-holidays', priority: '0.8', changefreq: 'weekly' },
  { path: '/school-holidays/opengym', priority: '0.7', changefreq: 'weekly' },
  { path: '/school-holidays/playgym', priority: '0.7', changefreq: 'weekly' },
  { path: '/school-holidays/skill-workshops', priority: '0.7', changefreq: 'weekly' },
  { path: '/dates', priority: '0.6', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/whats-happening', priority: '0.6', changefreq: 'weekly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/careers', priority: '0.5', changefreq: 'monthly' },
  { path: '/policies', priority: '0.4', changefreq: 'yearly' }
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(({ path, priority, changefreq }) => `  <url>
    <loc>${siteConfig.siteUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

export const GET = () => new Response(xml, {
  headers: {
    'Content-Type': 'application/xml; charset=utf-8'
  }
});
