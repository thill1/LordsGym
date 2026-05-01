const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_MAX_QUOTE_LENGTH = 300;
const FIVE_STAR_RATING = 5;

interface GoogleReview {
  rating?: number;
  text?: string | { text?: string | null } | null;
  originalText?: string | { text?: string | null } | null;
  publishTime?: string | null;
  authorAttribution?: { displayName?: string } | null;
}

interface PlaceResponse {
  reviews?: GoogleReview[];
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function extractReviewText(review: GoogleReview): string {
  const pick = (value: GoogleReview['text'] | GoogleReview['originalText']): string => {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object' && typeof value.text === 'string') return value.text.trim();
    return '';
  };

  return pick(review.text) || pick(review.originalText);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  const defaultPlaceId = Deno.env.get('GOOGLE_PLACE_ID');

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Google Places API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url);
  const requestedPlaceId = url.searchParams.get('place_id');
  const placeId = defaultPlaceId || requestedPlaceId;
  const maxLength = Math.min(
    300,
    Math.max(80, parseInt(url.searchParams.get('max_length') || String(DEFAULT_MAX_QUOTE_LENGTH), 10) || DEFAULT_MAX_QUOTE_LENGTH)
  );

  if (!placeId) {
    return new Response(
      JSON.stringify({ error: 'Place ID required (query param place_id or env GOOGLE_PLACE_ID)' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // When an environment default exists, pin requests to it to prevent abuse/cost spikes
  // from arbitrary public place_id queries.
  if (defaultPlaceId && requestedPlaceId && requestedPlaceId !== defaultPlaceId) {
    return new Response(
      JSON.stringify({ error: 'Configured place mismatch' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const placeResource = placeId.startsWith('places/') ? placeId : `places/${placeId}`;
    const res = await fetch(
      `https://places.googleapis.com/v1/${placeResource}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'reviews.rating,reviews.text,reviews.originalText,reviews.publishTime,reviews.authorAttribution.displayName',
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Google Places API error:', res.status, errText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch reviews', details: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = (await res.json()) as PlaceResponse;
    const reviews = data.reviews || [];

    const fiveStar = reviews
      .map((review) => ({ ...review, extractedText: extractReviewText(review) }))
      .filter((r): r is GoogleReview & { rating: number; extractedText: string } =>
        r.rating === FIVE_STAR_RATING && r.extractedText.length > 0
      )
      .map((r) => {
        const reviewerName = r.authorAttribution?.displayName || 'Google Reviewer';
        const quote = r.extractedText.length > maxLength
          ? r.extractedText.slice(0, maxLength - 3).trim() + '...'
          : r.extractedText;
        const stableId = `google-${stableHash(`${reviewerName}|${r.publishTime || ''}|${quote}`)}`;
        return {
          id: stableId,
          name: reviewerName,
          role: 'Google Review',
          quote,
        };
      });

    return new Response(JSON.stringify({ reviews: fiveStar }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('google-reviews error:', err);
    return new Response(
      JSON.stringify({ error: 'An error occurred fetching reviews' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
