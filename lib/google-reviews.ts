/**
 * Fetch 5-star Google reviews via Supabase Edge Function.
 * Keeps API key server-side; returns testimonials shaped for the carousel.
 */

export const DEFAULT_MAX_QUOTE_LENGTH = 200;

export interface GoogleReviewTestimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export async function fetchGoogleReviews(
  supabaseUrl: string,
  supabaseAnonKey: string,
  placeId: string | undefined,
  maxQuoteLength: number = DEFAULT_MAX_QUOTE_LENGTH
): Promise<GoogleReviewTestimonial[]> {
  if (!placeId?.trim()) return [];

  try {
    const params = new URLSearchParams({ place_id: placeId, max_length: String(maxQuoteLength) });
    const res = await fetch(
      `${supabaseUrl}/functions/v1/google-reviews?${params}`,
      { headers: { Authorization: `Bearer ${supabaseAnonKey}` } }
    );

    if (!res.ok) return [];

    const data = (await res.json()) as { reviews?: GoogleReviewTestimonial[] };
    return data.reviews || [];
  } catch {
    return [];
  }
}
