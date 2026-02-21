/**
 * Unit tests for Google Reviews API client.
 * Mocks fetch to avoid real API calls – tests parsing and error handling.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchGoogleReviews,
  DEFAULT_MAX_QUOTE_LENGTH,
  type GoogleReviewTestimonial,
} from './google-reviews';

const SUPABASE_URL = 'https://test.supabase.co';
const ANON_KEY = 'test-anon-key';

const mockReview: GoogleReviewTestimonial = {
  id: 'ChIJ-review-1',
  name: 'Jane Doe',
  role: 'Google Review',
  quote: 'Amazing gym! Best experience ever.',
};

describe('fetchGoogleReviews', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns [] when placeId is empty', async () => {
    const result = await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, '');
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns [] when placeId is undefined', async () => {
    const result = await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, undefined);
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns [] when placeId is whitespace only', async () => {
    const result = await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, '   ');
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns [] when response is not ok', async () => {
    fetchMock.mockResolvedValue({ ok: false });
    const result = await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, 'ChIJ-place');
    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/google-reviews'),
      expect.any(Object)
    );
  });

  it('returns reviews when response is ok and has reviews', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ reviews: [mockReview] }),
    });
    const result = await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, 'ChIJ-place');
    expect(result).toEqual([mockReview]);
  });

  it('returns [] when response has no reviews key', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    const result = await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, 'ChIJ-place');
    expect(result).toEqual([]);
  });

  it('returns [] when response.reviews is null', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ reviews: null }),
    });
    const result = await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, 'ChIJ-place');
    expect(result).toEqual([]);
  });

  it('passes place_id and default max_length in URL', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ reviews: [] }) });
    await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, 'ChIJ-abc123');
    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('place_id=ChIJ-abc123');
    expect(url).toContain(`max_length=${DEFAULT_MAX_QUOTE_LENGTH}`);
  });

  it('passes custom maxQuoteLength in URL', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ reviews: [] }) });
    await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, 'ChIJ-place', 200);
    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('max_length=200');
  });

  it('sends Authorization header with Bearer token', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ reviews: [] }) });
    await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, 'ChIJ-place');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${ANON_KEY}` },
      })
    );
  });

  it('returns [] on fetch error', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));
    const result = await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, 'ChIJ-place');
    expect(result).toEqual([]);
  });

  it('returns [] when json() throws', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });
    const result = await fetchGoogleReviews(SUPABASE_URL, ANON_KEY, 'ChIJ-place');
    expect(result).toEqual([]);
  });
});
