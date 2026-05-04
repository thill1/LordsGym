import { supabase } from './supabase';

export interface OrderItem {
  id: string;
  title: string;
  size: string;
  quantity: number;
  price_cents: number;
}

export interface StoreOrder {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  customer_email: string;
  customer_name: string | null;
  shipping_address: ShippingAddress | null;
  items: OrderItem[];
  total_cents: number;
  status: 'pending' | 'paid' | 'fulfilled' | 'canceled' | 'refunded';
  created_at: string;
  paid_at: string | null;
  fulfilled_at: string | null;
}

export interface ShippingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export function formatOrderTotal(totalCents: number): string {
  return `$${(totalCents / 100).toFixed(2)}`;
}

export function formatOrderItems(items: OrderItem[]): string {
  return items.map((i) => `${i.title} (${i.size}) ×${i.quantity}`).join(', ');
}

export function formatShippingAddress(addr: ShippingAddress | null): string {
  if (!addr) return 'No address on file';
  const parts = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(', '),
  ].filter(Boolean);
  return parts.join(', ') || 'No address on file';
}

export function parseSessionIdFromHash(hash?: string): string | null {
  try {
    const raw = hash ?? (typeof window !== 'undefined' ? window.location.hash : '');
    const withoutLeadingHash = raw.startsWith('#') ? raw.slice(1) : raw;
    const queryStr = withoutLeadingHash.includes('?') ? withoutLeadingHash.split('?')[1] : '';
    if (!queryStr) return null;
    return new URLSearchParams(queryStr).get('session_id');
  } catch {
    return null;
  }
}

export async function fetchOrderBySessionId(sessionId: string): Promise<StoreOrder | null> {
  const { data, error } = await supabase
    .from('store_orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single();

  if (error || !data) return null;
  return data as StoreOrder;
}
