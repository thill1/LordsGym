import { describe, it, expect } from 'vitest';

const MAX_QUOTE_LENGTH = 300;

function validateQuote(quote: string): { valid: boolean; error?: string } {
  if (!quote) return { valid: false, error: 'Quote is required' };
  if (quote.length > MAX_QUOTE_LENGTH) {
    return { valid: false, error: `Quote must be ${MAX_QUOTE_LENGTH} characters or less (currently ${quote.length})` };
  }
  return { valid: true };
}

function truncateQuote(quote: string): string {
  if (quote.length <= MAX_QUOTE_LENGTH) return quote;
  return quote.slice(0, MAX_QUOTE_LENGTH - 3).trim() + '...';
}

describe('testimonial quote limit (MAX_QUOTE_LENGTH = 300)', () => {
  it('accepts an empty quote as invalid', () => {
    expect(validateQuote('').valid).toBe(false);
  });

  it('accepts a quote under the limit', () => {
    const quote = 'a'.repeat(299);
    expect(validateQuote(quote)).toEqual({ valid: true });
  });

  it('accepts a quote exactly at the limit', () => {
    const quote = 'a'.repeat(300);
    expect(validateQuote(quote)).toEqual({ valid: true });
  });

  it('rejects a quote one character over the limit', () => {
    const quote = 'a'.repeat(301);
    const result = validateQuote(quote);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('300');
    expect(result.error).toContain('301');
  });

  it('truncates an over-limit quote with ellipsis', () => {
    const quote = 'a'.repeat(400);
    const result = truncateQuote(quote);
    expect(result.length).toBeLessThanOrEqual(MAX_QUOTE_LENGTH);
    expect(result.endsWith('...')).toBe(true);
  });

  it('does not truncate a quote at or under the limit', () => {
    const quote = 'Great gym, highly recommend!';
    expect(truncateQuote(quote)).toBe(quote);
  });
});
