/**
 * Fetch 5-star Google reviews via Supabase Edge Function.
 * Keeps API key server-side; returns testimonials shaped for the carousel.
 */

import { MAX_TESTIMONIAL_QUOTE_LENGTH } from './testimonials';

export const DEFAULT_MAX_QUOTE_LENGTH = MAX_TESTIMONIAL_QUOTE_LENGTH;

export interface GoogleReviewTestimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export async function fetchGoogleReviews(
  supabaseUrl: string,
  supabaseAnonKey: string = '',
  placeId?: string,
  maxQuoteLength: number = DEFAULT_MAX_QUOTE_LENGTH
): Promise<GoogleReviewTestimonial[]> {
  if (!supabaseUrl?.trim()) return [];

  try {
    const params = new URLSearchParams({ max_length: String(maxQuoteLength) });
    const normalizedPlaceId = placeId?.trim();
    if (normalizedPlaceId) {
      params.set('place_id', normalizedPlaceId);
    }

    const headers: Record<string, string> = {};
    if (supabaseAnonKey?.trim()) {
      headers.Authorization = `Bearer ${supabaseAnonKey.trim()}`;
    }

    const res = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/functions/v1/google-reviews?${params}`,
      { headers }
    );

    if (!res.ok) return [];

    const data = (await res.json()) as { reviews?: GoogleReviewTestimonial[] };
    return data.reviews || [];
  } catch {
    return [];
  }
}
