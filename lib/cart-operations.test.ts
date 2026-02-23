/**
 * Cart operations unit tests — guards against regression.
 * Covers: add, remove, updateQuantity (including qty→0 removal).
 */
import { describe, it, expect } from 'vitest';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  cartTotal,
  cartCount,
  makeCartId,
} from './cart-operations';
import type { Product, CartItem } from '../types';

function product(id: string, title: string, price: number = 29.99): Product {
  return {
    id,
    title,
    price,
    category: "Men's Apparel",
    image: '',
  };
}

describe('cart-operations', () => {
  describe('makeCartId', () => {
    it('combines product id and size', () => {
      expect(makeCartId('m1', 'L')).toBe('m1-L');
      expect(makeCartId('a1', 'One Size')).toBe('a1-One Size');
    });
  });

  describe('addToCart', () => {
    it('adds new product to empty cart', () => {
      const p = product('m1', 'Tee');
      const result = addToCart([], p, 'L');
      expect(result).toHaveLength(1);
      expect(result[0].cartId).toBe('m1-L');
      expect(result[0].quantity).toBe(1);
      expect(result[0].selectedSize).toBe('L');
      expect(result[0].title).toBe('Tee');
    });

    it('increments quantity when same product+size already in cart', () => {
      const p = product('m1', 'Tee');
      const cart: CartItem[] = [
        { ...p, cartId: 'm1-L', selectedSize: 'L', quantity: 2 },
      ];
      const result = addToCart(cart, p, 'L');
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(3);
    });

    it('adds as new item when same product different size', () => {
      const p = product('m1', 'Tee');
      const cart: CartItem[] = [
        { ...p, cartId: 'm1-L', selectedSize: 'L', quantity: 1 },
      ];
      const result = addToCart(cart, p, 'M');
      expect(result).toHaveLength(2);
      expect(result.find((i) => i.selectedSize === 'L')?.quantity).toBe(1);
      expect(result.find((i) => i.selectedSize === 'M')?.quantity).toBe(1);
    });
  });

  describe('removeFromCart', () => {
    it('removes item by cartId', () => {
      const cart: CartItem[] = [
        { ...product('m1', 'Tee'), cartId: 'm1-L', selectedSize: 'L', quantity: 1 },
        { ...product('m2', 'Hoodie'), cartId: 'm2-M', selectedSize: 'M', quantity: 1 },
      ];
      const result = removeFromCart(cart, 'm1-L');
      expect(result).toHaveLength(1);
      expect(result[0].cartId).toBe('m2-M');
    });

    it('returns empty when removing only item', () => {
      const cart: CartItem[] = [
        { ...product('m1', 'Tee'), cartId: 'm1-L', selectedSize: 'L', quantity: 1 },
      ];
      const result = removeFromCart(cart, 'm1-L');
      expect(result).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('increments quantity', () => {
      const cart: CartItem[] = [
        { ...product('m1', 'Tee'), cartId: 'm1-L', selectedSize: 'L', quantity: 1 },
      ];
      const result = updateQuantity(cart, 'm1-L', 1);
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(2);
    });

    it('decrements quantity', () => {
      const cart: CartItem[] = [
        { ...product('m1', 'Tee'), cartId: 'm1-L', selectedSize: 'L', quantity: 2 },
      ];
      const result = updateQuantity(cart, 'm1-L', -1);
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(1);
    });

    it('removes item when quantity reaches 0 (regression: qty=0 bug)', () => {
      const cart: CartItem[] = [
        { ...product('m1', 'Tee'), cartId: 'm1-L', selectedSize: 'L', quantity: 1 },
      ];
      const result = updateQuantity(cart, 'm1-L', -1);
      expect(result).toHaveLength(0);
    });

    it('removes item when quantity goes below 0', () => {
      const cart: CartItem[] = [
        { ...product('m1', 'Tee'), cartId: 'm1-L', selectedSize: 'L', quantity: 1 },
      ];
      const result = updateQuantity(cart, 'm1-L', -5);
      expect(result).toHaveLength(0);
    });

    it('leaves other items unchanged', () => {
      const cart: CartItem[] = [
        { ...product('m1', 'Tee'), cartId: 'm1-L', selectedSize: 'L', quantity: 1 },
        { ...product('m2', 'Hoodie'), cartId: 'm2-M', selectedSize: 'M', quantity: 2 },
      ];
      const result = updateQuantity(cart, 'm1-L', -1);
      expect(result).toHaveLength(1);
      expect(result[0].cartId).toBe('m2-M');
      expect(result[0].quantity).toBe(2);
    });
  });

  describe('cartTotal', () => {
    it('sums line totals', () => {
      const cart: CartItem[] = [
        { ...product('m1', 'Tee', 10), cartId: 'm1-L', selectedSize: 'L', quantity: 2 },
        { ...product('m2', 'Hoodie', 20), cartId: 'm2-M', selectedSize: 'M', quantity: 1 },
      ];
      expect(cartTotal(cart)).toBe(40);
    });

    it('returns 0 for empty cart', () => {
      expect(cartTotal([])).toBe(0);
    });
  });

  describe('cartCount', () => {
    it('sums item quantities', () => {
      const cart: CartItem[] = [
        { ...product('m1', 'Tee'), cartId: 'm1-L', selectedSize: 'L', quantity: 2 },
        { ...product('m2', 'Hoodie'), cartId: 'm2-M', selectedSize: 'M', quantity: 3 },
      ];
      expect(cartCount(cart)).toBe(5);
    });

    it('returns 0 for empty cart', () => {
      expect(cartCount([])).toBe(0);
    });
  });
});
