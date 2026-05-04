
import React, { useEffect, useState } from 'react';
import Section from '../components/Section';
import Button from '../components/Button';
import {
  parseSessionIdFromHash,
  fetchOrderBySessionId,
  formatOrderTotal,
  formatOrderItems,
  formatShippingAddress,
  type StoreOrder,
} from '../lib/store-orders';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 10; // up to 20 seconds waiting for webhook

const OrderConfirmation: React.FC = () => {
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const sessionId = parseSessionIdFromHash();
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let polls = 0;

    const poll = async () => {
      const result = await fetchOrderBySessionId(sessionId);
      if (cancelled) return;

      if (result) {
        // If order is still 'pending', webhook hasn't fired yet — keep polling briefly
        if (result.status === 'pending' && polls < MAX_POLLS) {
          polls++;
          setPollCount(polls);
          setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          setOrder(result);
          setLoading(false);
        }
      } else if (polls < MAX_POLLS) {
        polls++;
        setPollCount(polls);
        setTimeout(poll, POLL_INTERVAL_MS);
      } else {
        setLoading(false);
      }
    };

    poll();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Section bg="alternate" className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">
            {pollCount > 0 ? 'Confirming your payment…' : 'Loading your order…'}
          </p>
        </div>
      </Section>
    );
  }

  // No session ID in URL — likely a direct visit
  if (!parseSessionIdFromHash()) {
    return (
      <Section bg="alternate" className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">No order found</h1>
          <p className="text-neutral-500 mb-8">This page is reached after completing a purchase.</p>
          <Button onClick={() => { window.location.hash = '/shop'; }}>Go to Shop</Button>
        </div>
      </Section>
    );
  }

  // Order loaded — show confirmation
  return (
    <Section bg="alternate" className="pt-32 pb-20 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full bg-white dark:bg-neutral-800 p-8 md:p-12 rounded-lg shadow-xl text-center border-t-8 border-brand-red">

        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-neutral-500 mb-8">Thank you for supporting Lord's Gym. Your gear is on its way.</p>

        {order ? (
          <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-lg mb-8 text-left space-y-3">
            <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-3">
              <span className="text-xs font-bold uppercase text-neutral-400">Order ID</span>
              <span className="font-mono text-sm font-bold">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>

            {order.customer_name && (
              <div className="flex justify-between">
                <span className="text-xs font-bold uppercase text-neutral-400">Name</span>
                <span className="font-bold text-sm">{order.customer_name}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-xs font-bold uppercase text-neutral-400">Email</span>
              <span className="text-sm">{order.customer_email}</span>
            </div>

            {order.items?.length > 0 && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                <p className="text-xs font-bold uppercase text-neutral-400 mb-2">Items</p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>{item.title} ({item.size}) ×{item.quantity}</span>
                    <span className="font-bold">{formatOrderTotal(item.price_cents * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-700 pt-3">
              <span className="text-xs font-bold uppercase text-neutral-400">Total Paid</span>
              <span className="font-bold text-lg">{formatOrderTotal(order.total_cents)}</span>
            </div>

            {order.shipping_address && (
              <div className="flex justify-between">
                <span className="text-xs font-bold uppercase text-neutral-400">Ship To</span>
                <span className="text-sm text-right max-w-[60%]">{formatShippingAddress(order.shipping_address)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-xs font-bold uppercase text-neutral-400">Est. Delivery</span>
              <span className="font-bold text-sm">3–5 Business Days</span>
            </div>
          </div>
        ) : (
          // Order not in DB yet (webhook delay or no Supabase) — show generic confirmation
          <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-lg mb-8 text-left">
            <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2 mb-2">
              <span className="text-xs font-bold uppercase text-neutral-400">Status</span>
              <span className="font-bold text-green-600">Payment received</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold uppercase text-neutral-400">Est. Delivery</span>
              <span className="font-bold">3–5 Business Days</span>
            </div>
          </div>
        )}

        <p className="text-sm text-neutral-400 mb-8">
          A confirmation email has been sent to {order?.customer_email || 'your email address'}.
        </p>

        <Button fullWidth onClick={() => { window.location.hash = '/shop'; }}>
          Continue Shopping
        </Button>
      </div>
    </Section>
  );
};

export default OrderConfirmation;
