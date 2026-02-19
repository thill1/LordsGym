# Google Reviews Setup

The testimonials section can display 5-star Google reviews alongside manually entered testimonials.

## Configuration

### 1. Get your Google Place ID

- Go to [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
- Search for Lord's Gym (or your business)
- Copy the Place ID (e.g. `ChIJ...`)

### 2. Google Cloud Console

1. Enable the **Places API (New)** in [Google Cloud Console](https://console.cloud.google.com/)
2. Create an API key
3. Restrict the key to **Places API** only (recommended for security)

### 3. Supabase Edge Function secrets

Set these secrets in your Supabase project (Dashboard → Project Settings → Edge Functions → Secrets):

```
GOOGLE_PLACES_API_KEY=your_api_key_here
GOOGLE_PLACE_ID=ChIJ...your_place_id...
```

For local testing with Supabase CLI:

```bash
supabase secrets set GOOGLE_PLACES_API_KEY=your_key
supabase secrets set GOOGLE_PLACE_ID=ChIJ...your_place_id
```

### 4. Deploy the Edge Function

```bash
supabase functions deploy google-reviews
```

### 5. Frontend: Place ID (optional override)

For local development or to override the server default, add to `.env.local`:

```
VITE_GOOGLE_PLACE_ID=ChIJ...your_place_id
```

If not set, the function uses `GOOGLE_PLACE_ID` from Supabase secrets.

## Behavior

- **5-star only**: Only reviews with a 5.0 rating are shown
- **Character limit**: Quotes are truncated to 200 characters (configurable via `max_length` query param)
- **Order**: Manual testimonials first, then Google reviews
- **Admin**: Google reviews are read-only; only manual testimonials can be edited/deleted

## Billing

The Google Places API uses the **Place Details Enterprise + Atmosphere** SKU when requesting the `reviews` field. Check [Google Maps Platform pricing](https://developers.google.com/maps/billing-and-pricing) for costs. The API returns up to 5 reviews per request.
