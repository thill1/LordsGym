import { describe, it, expect } from 'vitest';
import { getPathFromLocation } from './router';

describe('getPathFromLocation', () => {
  describe('hash routing', () => {
    it('resolves #/membership to /membership', () => {
      expect(getPathFromLocation('/', '#/membership', '/')).toBe('/membership');
    });

    it('resolves #/shop to /shop', () => {
      expect(getPathFromLocation('/', '#/shop', '/')).toBe('/shop');
    });

    it('resolves #/ to home', () => {
      expect(getPathFromLocation('/', '#/', '/')).toBe('/');
    });

    it('resolves empty hash using pathname', () => {
      expect(getPathFromLocation('/', '', '/')).toBe('/');
    });
  });

  describe('pathname routing (desktop direct URLs)', () => {
    it('resolves /membership pathname to /membership', () => {
      expect(getPathFromLocation('/membership', '', '/')).toBe('/membership');
    });

    it('resolves /membership pathname with base to /membership', () => {
      expect(getPathFromLocation('/LordsGym/membership', '', '/LordsGym/')).toBe(
        '/membership'
      );
    });

    it('resolves /shop pathname to /shop', () => {
      expect(getPathFromLocation('/shop', '', '/')).toBe('/shop');
    });

    it('resolves /training pathname to /training', () => {
      expect(getPathFromLocation('/training', '', '/')).toBe('/training');
    });

    it('resolves /admin pathname to /admin', () => {
      expect(getPathFromLocation('/admin', '', '/')).toBe('/admin');
    });

    it('resolves root pathname to home', () => {
      expect(getPathFromLocation('/', '', '/')).toBe('/');
    });

    it('returns home for unknown pathname', () => {
      expect(getPathFromLocation('/unknown-page', '', '/')).toBe('/');
    });
  });

  describe('hash takes precedence over pathname', () => {
    it('uses hash when both hash and pathname are present', () => {
      expect(
        getPathFromLocation('/membership', '#/shop', '/')
      ).toBe('/shop');
    });
  });
});
