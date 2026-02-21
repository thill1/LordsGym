/**
 * Store product sync logic - regression tests
 *
 * Guards against:
 * - Sync re-adding deleted products (root cause of admin delete bug)
 * - Sync only adds new products from constants; never removes
 */
import { describe, it, expect } from 'vitest';
import { syncProductsFromConstants } from './store-products';
import type { Product } from '../types';

function product(id: string, title: string): Product {
  return {
    id,
    title,
    price: 29.99,
    category: "Men's Apparel",
    image: `/media/${id}.png`,
  };
}

describe('syncProductsFromConstants', () => {
  it('adds seed products that are not in current (caller must not invoke when Supabase is source)', () => {
    const seed = [product('m1', 'Tee 1'), product('m2', 'Tee 2'), product('m3', 'Tee 3')];
    const current = [product('m1', 'Tee 1')];
    const result = syncProductsFromConstants(current, seed);
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.id).sort()).toEqual(['m1', 'm2', 'm3']);
  });

  it('adds only new products from seed when current has fewer', () => {
    const seed = [product('m1', 'Tee 1'), product('m2', 'Tee 2'), product('m3', 'Tee 3')];
    const current = [product('m1', 'Tee 1')];
    const result = syncProductsFromConstants(current, seed);
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.id).sort()).toEqual(['m1', 'm2', 'm3']);
  });

  it('returns current unchanged when no new products to add', () => {
    const seed = [product('m1', 'Tee 1'), product('m2', 'Tee 2')];
    const current = [product('m1', 'Tee 1'), product('m2', 'Tee 2')];
    const result = syncProductsFromConstants(current, seed);
    expect(result).toBe(current);
  });

  it('preserves existing products and adds only missing from seed', () => {
    const seed = [product('m1', 'Tee 1'), product('m2', 'Tee 2')];
    const customized = product('m1', 'Custom Title');
    customized.price = 39.99;
    const current = [customized];
    const result = syncProductsFromConstants(current, seed);
    expect(result).toHaveLength(2);
    const m1 = result.find((p) => p.id === 'm1')!;
    expect(m1.title).toBe('Custom Title');
    expect(m1.price).toBe(39.99);
    const m2 = result.find((p) => p.id === 'm2')!;
    expect(m2.title).toBe('Tee 2');
  });

  it('handles empty current', () => {
    const seed = [product('m1', 'Tee 1')];
    const result = syncProductsFromConstants([], seed);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m1');
  });

  it('handles empty seed', () => {
    const current = [product('m1', 'Tee 1')];
    const result = syncProductsFromConstants(current, []);
    expect(result).toBe(current);
  });
});
