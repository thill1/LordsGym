/**
 * Pure cart operations — extracted for unit testing.
 * Used by StoreContext for add/remove/update cart logic.
 */
import type { Product, CartItem } from '../types';

/** Create a cart ID from product and size */
export function makeCartId(productId: string, size: string): string {
  return `${productId}-${size}`;
}

/** Add product to cart or increment quantity if same product+size exists */
export function addToCart(prevCart: CartItem[], product: Product, size: string): CartItem[] {
  const cartId = makeCartId(product.id, size);
  const existing = prevCart.find((item) => item.cartId === cartId);

  if (existing) {
    return prevCart.map((item) =>
      item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
    );
  }

  return [...prevCart, { ...product, selectedSize: size, quantity: 1, cartId }];
}

/** Remove item by cartId */
export function removeFromCart(prevCart: CartItem[], cartId: string): CartItem[] {
  return prevCart.filter((item) => item.cartId !== cartId);
}

/** Update quantity by delta; remove item when quantity reaches 0 or below */
export function updateQuantity(prevCart: CartItem[], cartId: string, delta: number): CartItem[] {
  return prevCart
    .map((item) => {
      if (item.cartId !== cartId) return item;
      const newQuantity = item.quantity + delta;
      return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
    })
    .filter((item): item is CartItem => item !== null);
}

/** Compute cart total */
export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

/** Compute cart item count */
export function cartCount(cart: CartItem[]): number {
  return cart.reduce((count, item) => count + item.quantity, 0);
}
