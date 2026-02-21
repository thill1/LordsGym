/**
 * Store product sync logic - adds only new products from constants.
 * Never re-adds deleted products; ALL_PRODUCTS is a seed for new merchandise only.
 */
import type { Product } from '../types';

/**
 * Merge products: add only items from seed that are not yet in current.
 * Never remove or re-add deleted products.
 */
export function syncProductsFromConstants(
  currentProducts: Product[],
  seedProducts: Product[]
): Product[] {
  const currentIds = new Set(currentProducts.map((p) => p.id));
  const toAdd = seedProducts.filter((p) => !currentIds.has(p.id));
  if (toAdd.length === 0) return currentProducts;
  const productMap = new Map(currentProducts.map((p) => [p.id, p]));
  toAdd.forEach((p) => productMap.set(p.id, p));
  return Array.from(productMap.values());
}
