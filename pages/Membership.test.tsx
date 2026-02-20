import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Membership from './Membership';

const MINDBODY_URL =
  'https://clients.mindbodyonline.com/ASP/main_shop.asp?studioid=5743200&tg=&vt=&lvl=&stype=40&view=&trn=0&page=&catid=&prodid=&date=2%2f7%2f2026&classid=0&prodGroupId=&sSU=&optForwardingLink=&qParam=&justloggedin=&nLgIn=&pMode=0&loc=1';

describe('Membership page', () => {
  it('renders Join Now links that resolve to Mindbody URL', () => {
    render(<Membership />);

    const joinLinks = screen.getAllByRole('link', { name: /join now/i });
    expect(joinLinks.length).toBeGreaterThanOrEqual(1);

    joinLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', MINDBODY_URL);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('uses anchor tags for Join Now (not buttons) to avoid desktop popup blocking', () => {
    render(<Membership />);

    const joinLinks = screen.getAllByRole('link', { name: /join now/i });
    expect(joinLinks.length).toBe(3); // Regular, Student, Annual

    joinLinks.forEach((link) => {
      expect(link.tagName).toBe('A');
    });
  });
});
