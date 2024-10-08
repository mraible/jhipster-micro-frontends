export const getLoginUrl = () => {
  const port = location.port ? `:${location.port}` : '';

  // If you have configured multiple OIDC providers, then, you can update this URL to /login.
  // It will show a Spring Security generated login page with links to configured OIDC providers.
  return `//${location.hostname}${port}/sign-in`;
};
export const REDIRECT_URL = 'redirectURL';
