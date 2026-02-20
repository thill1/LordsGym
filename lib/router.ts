/**
 * Resolves the current route from location (hash or pathname).
 * Supports both hash routing (#/membership) and pathname routing (/membership)
 * for direct URLs (desktop bookmarks, shared links).
 */
export function getPathFromLocation(
  pathname: string,
  hash: string,
  baseUrl: string = '/'
): string {
  const raw = hash.slice(1);
  const path = raw ? raw.split('?')[0] : '';
  if (path) return path;

  const baseNoTrailing = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const relative =
    baseNoTrailing && pathname.startsWith(baseNoTrailing)
      ? pathname.slice(baseNoTrailing.length) || '/'
      : pathname || '/';
  const norm = relative.replace(/\/$/, '') || '/';

  const pathnameRoutes: Record<string, string> = {
    '/admin': '/admin',
    '/membership': '/membership',
    '/shop': '/shop',
    '/training': '/training',
    '/programs': '/programs',
    '/calendar': '/calendar',
    '/outreach': '/outreach',
    '/contact': '/contact',
    '/about': '/about',
    '/checkout': '/checkout',
    '/order-confirmation': '/order-confirmation',
  };

  if (norm in pathnameRoutes) return pathnameRoutes[norm];
  return '/';
}
