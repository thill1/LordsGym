import { useEffect, useRef } from 'react';

/**
 * Custom hook for auto-saving form data
 * @param value - The value to save
 * @param saveFn - Function to call when saving
 * @param delay - Delay in milliseconds before saving (default: 1000)
 */
export const useAutoSave = <T>(
  value: T,
  saveFn: (value: T) => void | Promise<void>,
  delay: number = 1000
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<T>(value);

  useEffect(() => {
    // Only save if value has changed
    if (JSON.stringify(value) === JSON.stringify(previousValueRef.current)) {
      return;
    }

    previousValueRef.current = value;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveFn(value);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, saveFn, delay]);
};
