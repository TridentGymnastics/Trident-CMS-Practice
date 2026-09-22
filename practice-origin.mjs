// Practice builds must never use the club's live domain.
export function resolvePracticeSiteUrl(env = process.env) {
  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_BRANCH_URL || env.VERCEL_URL;
  const address = env.DEPLOY_PRIME_URL || env.CF_PAGES_URL || (vercelHost && `https://${vercelHost}`) || env.PRACTICE_SITE_URL;
  if (env.VERCEL === '1' && !address) {
    throw new Error('Enable Vercel system environment variables, or set PRACTICE_SITE_URL to this practice project address.');
  }
  const url = new URL(address || 'http://127.0.0.1:4323');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const hosted = ['.netlify.app', '.pages.dev', '.vercel.app'].some(suffix => url.hostname.endsWith(suffix));
  if (url.username || url.password || (local ? !['http:', 'https:'].includes(url.protocol) : !hosted || url.protocol !== 'https:')) {
    throw new Error('CMS practice requires localhost or a separate netlify.app/pages.dev/vercel.app address. Do not attach the live domain.');
  }
  if (env.REPOSITORY_URL) {
    const repository = env.REPOSITORY_URL.toLowerCase().replace(/\.git$/, '').replace(/\/$/, '');
    if (!['https://github.com/tridentgymnastics/trident-cms-practice', 'git@github.com:tridentgymnastics/trident-cms-practice'].includes(repository)) {
      throw new Error('This build belongs only to TridentGymnastics/Trident-CMS-Practice. Check the new preview project repository.');
    }
  }
  if (env.VERCEL_GIT_REPO_OWNER || env.VERCEL_GIT_REPO_SLUG) {
    const repository = `${env.VERCEL_GIT_REPO_OWNER}/${env.VERCEL_GIT_REPO_SLUG}`.toLowerCase();
    if (repository !== 'tridentgymnastics/trident-cms-practice') {
      throw new Error('The Vercel practice project must connect only to TridentGymnastics/Trident-CMS-Practice.');
    }
  }
  return url.origin;
}

export const practiceSiteUrl = resolvePracticeSiteUrl();
