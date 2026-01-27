/**
 * Normalize popup CTA/dismiss link to an app path for hash routing.
 * Accepts "/membership", "membership", "#/membership", "#/" and returns "/membership", "/", etc.
 */
export function normalizePopupPath(link: string): string {
  let s = (link || '').trim().replace(/^#+/, '');
  if (!s || s === '/') return '/';
  if (!s.startsWith('/')) s = '/' + s;
  return s;
}
