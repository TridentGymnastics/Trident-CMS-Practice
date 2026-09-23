import { isNonProduction } from '../../site-mode.mjs';
import { siteConfig } from '../config/site';

export const GET = () => new Response(
  [
    'User-agent: *',
    isNonProduction ? 'Disallow: /' : 'Allow: /',
    ...(isNonProduction ? [] : [`Sitemap: ${siteConfig.siteUrl}/sitemap.xml`]),
    ''
  ].join('\n'),
  {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  }
);
