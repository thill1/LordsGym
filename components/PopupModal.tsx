import React, { useCallback, useEffect, useRef } from 'react';

export interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: string;
  ctaText?: string;
  ctaLink?: string;
  /** Called when primary CTA is clicked, with ctaLink. Parent should navigate then close. */
  onCtaNavigate?: (path: string) => void;
  /** Called when user dismisses (Close, Maybe later, backdrop, Escape). Parent should navigate to home then close. */
  onDismissNavigate?: () => void;
  /** Legacy: used when onCtaNavigate not provided. */
  onNavigate?: (path: string) => void;
}

/**
 * Accessible modal dialog for site popups.
 * - Focus trap when open
 * - Escape key closes
 * - Backdrop click closes (optional for promos; we allow it for clarity)
 * - aria-modal, role="dialog", aria-labelledby
 */
const PopupModal: React.FC<PopupModalProps> = ({
  isOpen,
  onClose,
  title,
  body,
  ctaText,
  ctaLink,
  onCtaNavigate,
  onDismissNavigate,
  onNavigate
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  const handleDismiss = useCallback(() => {
    onDismissNavigate?.();
    onClose();
  }, [onDismissNavigate, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      }
    },
    [handleDismiss]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        handleDismiss();
      }
    },
    [handleDismiss]
  );

  const handleCtaClick = useCallback(() => {
    if (ctaLink && onCtaNavigate) {
      onCtaNavigate(ctaLink);
      onClose();
    } else if (ctaLink && onNavigate) {
      onNavigate(ctaLink);
      onClose();
    } else if (ctaLink) {
      window.location.hash = ctaLink.startsWith('#') ? ctaLink : '#' + ctaLink;
      onClose();
    } else {
      onClose();
    }
  }, [ctaLink, onCtaNavigate, onNavigate, onClose]);

  // Focus trap and restore focus on close
  useEffect(() => {
    if (!isOpen) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0] as HTMLElement | undefined;
    const last = focusable?.[focusable.length - 1] as HTMLElement | undefined;
    first?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const current = document.activeElement;
      if (e.shiftKey) {
        if (current === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (current === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      document.removeEventListener('keydown', trap);
      previousActiveRef.current?.focus?.();
    };
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-modal-title"
      aria-describedby="popup-modal-desc"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pt-8 pb-6 flex flex-col gap-4 overflow-y-auto">
          <h2 id="popup-modal-title" className="text-xl font-bold text-brand-charcoal dark:text-white pr-8">
            {title}
          </h2>
          <p id="popup-modal-desc" className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {body}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {ctaText && (
              <button
                type="button"
                onClick={handleCtaClick}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-bold text-white bg-brand-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 transition-colors"
              >
                {ctaText}
              </button>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-bold text-brand-charcoal dark:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 transition-colors"
            >
              {ctaText ? 'Maybe later' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
