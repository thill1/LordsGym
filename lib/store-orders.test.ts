/**
 * Tests for store-orders helper functions.
 * Pure functions only — no Supabase/Stripe dependencies.
 */
import { describe, it, expect } from 'vitest';
import {
  formatOrderTotal,
  formatOrderItems,
  formatShippingAddress,
  parseSessionIdFromHash,
  type OrderItem,
  type ShippingAddress,
} from './store-orders';

// --- formatOrderTotal ---

describe('formatOrderTotal', () => {
  it('formats cents as dollars with two decimal places', () => {
    expect(formatOrderTotal(2999)).toBe('$29.99');
  });

  it('formats zero cents', () => {
    expect(formatOrderTotal(0)).toBe('$0.00');
  });

  it('formats amounts that divide evenly', () => {
    expect(formatOrderTotal(5000)).toBe('$50.00');
  });

  it('formats large amounts', () => {
    expect(formatOrderTotal(15000)).toBe('$150.00');
  });
});

// --- formatOrderItems ---

function item(title: string, size: string, quantity: number): OrderItem {
  return { id: `id-${title}`, title, size, quantity, price_cents: 2999 };
}

describe('formatOrderItems', () => {
  it('formats a single item', () => {
    expect(formatOrderItems([item('Lords Gym Tee', 'L', 1)])).toBe('Lords Gym Tee (L) ×1');
  });

  it('formats multiple items', () => {
    const items = [item('Tee', 'M', 2), item('Hat', 'OS', 1)];
    expect(formatOrderItems(items)).toBe('Tee (M) ×2, Hat (OS) ×1');
  });

  it('handles empty item list', () => {
    expect(formatOrderItems([])).toBe('');
  });
});

// --- formatShippingAddress ---

describe('formatShippingAddress', () => {
  it('returns fallback for null address', () => {
    expect(formatShippingAddress(null)).toBe('No address on file');
  });

  it('formats a full US address', () => {
    const addr: ShippingAddress = {
      line1: '258 Elm Ave',
      city: 'Auburn',
      state: 'CA',
      postal_code: '95603',
    };
    expect(formatShippingAddress(addr)).toBe('258 Elm Ave, Auburn, CA, 95603');
  });

  it('includes line2 when present', () => {
    const addr: ShippingAddress = {
      line1: '100 Main St',
      line2: 'Apt 4',
      city: 'Auburn',
      state: 'CA',
      postal_code: '95603',
    };
    expect(formatShippingAddress(addr)).toBe('100 Main St, Apt 4, Auburn, CA, 95603');
  });

  it('omits missing fields', () => {
    const addr: ShippingAddress = { city: 'Auburn', state: 'CA' };
    expect(formatShippingAddress(addr)).toBe('Auburn, CA');
  });

  it('handles entirely empty address object', () => {
    expect(formatShippingAddress({})).toBe('No address on file');
  });
});

// --- parseSessionIdFromHash ---
// The function accepts an optional hash string, making it testable without window.

describe('parseSessionIdFromHash', () => {
  it('parses session_id from a hash query string', () => {
    expect(parseSessionIdFromHash('#/order-confirmation?session_id=cs_test_abc123')).toBe('cs_test_abc123');
  });

  it('works without a leading # character', () => {
    expect(parseSessionIdFromHash('/order-confirmation?session_id=cs_test_abc123')).toBe('cs_test_abc123');
  });

  it('returns null when hash has no query string', () => {
    expect(parseSessionIdFromHash('#/order-confirmation')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseSessionIdFromHash('')).toBeNull();
  });

  it('handles other params alongside session_id', () => {
    expect(parseSessionIdFromHash('#/order-confirmation?foo=bar&session_id=cs_live_xyz&baz=qux')).toBe('cs_live_xyz');
  });

  it('returns null when session_id param is absent', () => {
    expect(parseSessionIdFromHash('#/order-confirmation?foo=bar')).toBeNull();
  });

  it('handles Stripe live session IDs', () => {
    expect(parseSessionIdFromHash('#/order-confirmation?session_id=cs_live_AbCd1234XyZ')).toBe('cs_live_AbCd1234XyZ');
  });
});
