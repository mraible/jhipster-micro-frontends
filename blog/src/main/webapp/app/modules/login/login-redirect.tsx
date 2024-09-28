import { useEffect } from 'react';
import { REDIRECT_URL } from 'app/shared/util/url-utils';
import { useLocation } from 'react-router';

export const LoginRedirect = () => {
  const pageLocation = useLocation();

  useEffect(() => {
    localStorage.setItem(REDIRECT_URL, pageLocation.state.from.pathname);
    window.location.href = '/oauth2/authorization/oidc';
  });

  return null;
};

export default LoginRedirect;
