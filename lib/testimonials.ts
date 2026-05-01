export const MAX_TESTIMONIAL_QUOTE_LENGTH = 300;

export const normalizeTestimonialQuote = (
  quote: string,
  maxLength: number = MAX_TESTIMONIAL_QUOTE_LENGTH
): string => (quote || '').slice(0, maxLength).trim();

export const truncateTestimonialForDisplay = (
  quote: string,
  maxLength: number = MAX_TESTIMONIAL_QUOTE_LENGTH
): string => {
  if (!quote) return '';
  return quote.length > maxLength ? `${quote.slice(0, maxLength - 3).trim()}...` : quote;
};
