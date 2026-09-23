import environment from './site-environment.json' with { type: 'json' };

export function resolveSiteMode(config = environment, env = process.env) {
  if (!['production', 'practice'].includes(config.mode)) throw new Error('Choose production or practice in site-environment.json.');
  const isPractice = config.mode === 'practice';
  const repository = (env.REPOSITORY_URL || `${env.VERCEL_GIT_REPO_OWNER || ''}/${env.VERCEL_GIT_REPO_SLUG || ''}`).toLowerCase();
  if (repository.includes('trident-cms-practice') && !isPractice) throw new Error('The practice repository must keep practice mode.');
  if (isPractice && /tridentgymnastics[/:]trident-gymnastics(?:\.git)?\/?$/.test(repository)) throw new Error('Do not publish practice mode from the live repository.');
  const isPreview = ['deploy-preview', 'branch-deploy'].includes(env.CONTEXT) || env.VERCEL_ENV === 'preview';
  let siteUrl = 'https://www.tridentgymnastics.com.au';
  if (isPractice) {
    const host = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_BRANCH_URL || env.VERCEL_URL;
    const address = env.DEPLOY_PRIME_URL || (host && `https://${host}`) || env.PRACTICE_SITE_URL || 'http://127.0.0.1:4323';
    const url = new URL(address);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    const hosted = ['.vercel.app', '.netlify.app', '.pages.dev'].some(suffix => url.hostname.endsWith(suffix));
    if (url.username || url.password || (local ? !['http:', 'https:'].includes(url.protocol) : !hosted || url.protocol !== 'https:')) throw new Error('Practice mode requires a separate preview host, never the club domain.');
    siteUrl = url.origin;
  }
  return {isPractice, isPreview, isNonProduction: isPractice || isPreview, siteUrl};
}

export const {isPractice, isPreview, isNonProduction, siteUrl} = resolveSiteMode();
