// Practice builds must never use the club's live domain.
export function resolvePracticeSiteUrl(env = process.env) {
  const address = env.DEPLOY_PRIME_URL || env.CF_PAGES_URL || env.PRACTICE_SITE_URL || 'http://127.0.0.1:4323';
  const url = new URL(address);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const hosted = url.hostname.endsWith('.netlify.app') || url.hostname.endsWith('.pages.dev');
  if (url.username || url.password || (local ? !['http:', 'https:'].includes(url.protocol) : !hosted || url.protocol !== 'https:')) {
    throw new Error('CMS practice requires localhost or a separate netlify.app/pages.dev address. Do not attach the live domain.');
  }
  if (env.REPOSITORY_URL) {
    const repository = env.REPOSITORY_URL.toLowerCase().replace(/\.git$/, '').replace(/\/$/, '');
    if (!['https://github.com/tridentgymnastics/trident-cms-practice', 'git@github.com:tridentgymnastics/trident-cms-practice'].includes(repository)) {
      throw new Error('This build belongs only to TridentGymnastics/Trident-CMS-Practice. Check the new preview project repository.');
    }
  }
  return url.origin;
}

export const practiceSiteUrl = resolvePracticeSiteUrl();
