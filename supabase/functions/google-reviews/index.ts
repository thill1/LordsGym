const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_MAX_QUOTE_LENGTH = 200;
const FIVE_STAR_RATING = 5;

interface GoogleReview {
  rating?: number;
  text?: string | null;
  authorAttribution?: { displayName?: string } | null;
}

interface PlaceResponse {
  reviews?: GoogleReview[];
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
  const placeId = url.searchParams.get('place_id') || defaultPlaceId;
  const maxLength = Math.min(
    200,
    Math.max(80, parseInt(url.searchParams.get('max_length') || String(DEFAULT_MAX_QUOTE_LENGTH), 10) || DEFAULT_MAX_QUOTE_LENGTH)
  );

  if (!placeId) {
    return new Response(
      JSON.stringify({ error: 'Place ID required (query param place_id or env GOOGLE_PLACE_ID)' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
          'X-Goog-FieldMask': 'reviews',
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
      .filter((r): r is GoogleReview & { rating: number; text: string } =>
        r.rating === FIVE_STAR_RATING && typeof r.text === 'string' && r.text.trim().length > 0
      )
      .map((r, i) => {
        const quote = r.text.length > maxLength
          ? r.text.slice(0, maxLength - 3).trim() + '...'
          : r.text.trim();
        return {
          id: `google-${i}`,
          name: r.authorAttribution?.displayName || 'Google Reviewer',
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
